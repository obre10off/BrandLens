import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { z } from 'zod';
import { db } from '@/lib/db';
import { queries as queriesTable, queryExecutions, brandMentions, trials } from '@/lib/db/schema';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { detectMentions } from '@/lib/llm/mention-detection';
import { analyzeSentiment } from '@/lib/llm/sentiment';
import { queryTemplates } from '@/lib/llm/query-templates';
import { checkQueryLimit, getBillingPeriodStart, getBillingPeriodEnd, PlanType } from '@/lib/subscription-limits';
import { sql, eq, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';

const executeQuerySchema = z.object({
  queryId: z.string().optional(),
  templateId: z.string().optional(),
  customQuery: z.string().optional(),
  provider: z.enum(['openai', 'anthropic', 'google', 'azure']).default('openai'),
  projectId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = executeQuerySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const { queryId, templateId, customQuery, provider, projectId } = validation.data;

    // Get user's organizations to verify access
    const organizations = await getUserOrganizations(session.user.id);
    const hasAccess = organizations.some(org => 
      org.projects?.some(p => p.id === projectId)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get or create the query
    let query: string;
    let queryRecord;

    if (queryId) {
      // Use existing query
      const existing = await db.query.queries.findFirst({
        where: (queries, { eq }) => eq(queries.id, queryId),
      });
      if (!existing) {
        return NextResponse.json({ error: 'Query not found' }, { status: 404 });
      }
      query = existing.query;
      queryRecord = existing;
    } else if (templateId) {
      // Use template
      const template = queryTemplates.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      
      // Create query from template
      const [newQuery] = await db.insert(queriesTable).values({
        projectId,
        name: template.name,
        query: template.query,
        category: template.category,
        isActive: true,
      }).returning();
      
      query = template.query;
      queryRecord = newQuery;
    } else if (customQuery) {
      // Create custom query
      const [newQuery] = await db.insert(queriesTable).values({
        projectId,
        name: 'Custom Query',
        query: customQuery,
        category: 'custom',
        isActive: true,
      }).returning();
      
      query = customQuery;
      queryRecord = newQuery;
    } else {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    // Check trial/subscription limits
    const org = organizations.find(o => o.projects?.some(p => p.id === projectId));
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Determine plan type
    let planType: PlanType = 'trial';
    if (org.subscription?.status === 'active') {
      planType = org.subscription.plan as PlanType;
    } else if (org.trial?.status !== 'active') {
      return NextResponse.json({ 
        error: 'Active subscription or trial required' 
      }, { status: 403 });
    }

    // Check monthly query limit for subscriptions
    if (planType !== 'trial') {
      const periodStart = getBillingPeriodStart();
      const periodEnd = getBillingPeriodEnd();
      
      const [monthlyStats] = await db
        .select({
          count: sql<number>`count(*)`
        })
        .from(queryExecutions)
        .innerJoin(queries, eq(queryExecutions.queryId, queries.id))
        .where(
          sql`${queries.projectId} = ${projectId} 
          AND ${queryExecutions.createdAt} >= ${periodStart}
          AND ${queryExecutions.createdAt} <= ${periodEnd}`
        );

      const currentMonthQueries = monthlyStats?.count || 0;
      const { allowed, limit } = await checkQueryLimit(planType, currentMonthQueries);

      if (!allowed) {
        return NextResponse.json({ 
          error: `Monthly query limit reached (${limit} queries). Please upgrade your plan to continue.`,
          limit,
          used: currentMonthQueries,
          remaining: 0
        }, { status: 403 });
      }
    } else {
      // Check trial limits
      const remaining = org.trial!.queriesLimit - (org.trial!.queriesUsed || 0);
      if (remaining <= 0) {
        return NextResponse.json({ 
          error: 'Trial query limit reached. Please upgrade to continue.',
          limit: org.trial!.queriesLimit,
          used: org.trial!.queriesUsed || 0,
          remaining: 0
        }, { status: 403 });
      }
    }

    // Create execution record
    const [execution] = await db.insert(queryExecutions).values({
      queryId: queryRecord.id,
      status: 'running',
      provider,
    }).returning();

    // Execute the query based on provider
    try {
      let model;
      switch (provider) {
        case 'anthropic':
          model = anthropic('claude-3-5-sonnet-20241022');
          break;
        case 'openai':
        default:
          model = openai('gpt-4o-mini');
          break;
      }

      // Generate response from AI
      const { text: aiResponse } = await generateText({
        model,
        prompt: query,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Detect mentions in the response
      const mentions = await detectMentions(aiResponse, projectId);

      // Store mentions with sentiment analysis (parallelized for performance)
      const mentionResults = await Promise.all(
        mentions.map(async (mention) => {
          const sentiment = await analyzeSentiment(mention.context);
          
          const [storedMention] = await db.insert(brandMentions).values({
            projectId,
            queryExecutionId: execution.id,
            platform: provider,
            content: mention.context,
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
            context: mention.fullContext,
            metadata: {
              brandName: mention.brandName,
              competitors: mention.competitors,
              features: mention.features,
            },
          }).returning();

          return storedMention;
        })
      );

      // Update execution status
      await db.update(queryExecutions)
        .set({
          status: 'completed',
          completedAt: new Date(),
          resultCount: mentionResults.length,
          results: {
            mentions: mentionResults.length,
            response: aiResponse,
          },
        })
        .where((executions, { eq }) => eq(executions.id, execution.id));

      // Update trial usage if applicable
      if (org.trial?.status === 'active' && org.trial.id) {
        await db.update(trials)
          .set({
            queriesUsed: (org.trial.queriesUsed || 0) + 1,
          })
          .where((trials, { eq }) => eq(trials.id, org.trial!.id));
      }

      logger.info('Query execution completed successfully', {
        userId: session.user.id,
        projectId,
        queryId: queryRecord.id,
        executionId: execution.id,
        provider,
        mentionCount: mentionResults.length,
        planType
      });

      return NextResponse.json({
        execution: {
          id: execution.id,
          status: 'completed',
          mentions: mentionResults,
        },
        summary: {
          totalMentions: mentionResults.length,
          sentiment: {
            positive: mentionResults.filter(m => m.sentiment === 'positive').length,
            neutral: mentionResults.filter(m => m.sentiment === 'neutral').length,
            negative: mentionResults.filter(m => m.sentiment === 'negative').length,
          },
        },
      });

    } catch (error) {
      // Update execution status to failed
      await db.update(queryExecutions)
        .set({
          status: 'failed',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        .where((executions, { eq }) => eq(executions.id, execution.id));

      throw error;
    }

  } catch (error) {
    logger.error('Query execution failed', { 
      userId: session.user.id,
      projectId,
      provider 
    }, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to execute query' },
      { status: 500 }
    );
  }
}

// Get query execution history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Verify access
    const organizations = await getUserOrganizations(session.user.id);
    const hasAccess = organizations.some(org => 
      org.projects?.some(p => p.id === projectId)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get executions with query details
    const executions = await db
      .select({
        execution: queryExecutions,
        query: queriesTable,
      })
      .from(queryExecutions)
      .innerJoin(queriesTable, eq(queryExecutions.queryId, queriesTable.id))
      .where(eq(queriesTable.projectId, projectId))
      .orderBy(desc(queryExecutions.createdAt))
      .limit(50);

    logger.info('Execution history fetched', { 
      userId: session.user.id, 
      projectId, 
      executionCount: executions.length 
    });
    
    return NextResponse.json({ executions });
  } catch (error) {
    logger.error('Failed to fetch execution history', { 
      userId: session.user.id, 
      projectId 
    }, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch execution history' },
      { status: 500 }
    );
  }
}