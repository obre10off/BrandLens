import { db } from '@/lib/db';
import { queries, queryExecutions, brandMentions } from '@/lib/db/schema';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { detectMentions } from '@/lib/llm/mention-detection';
import { analyzeSentiment } from '@/lib/llm/sentiment';

export async function runInitialQueries(projectId: string) {
  try {
    // Get all active queries for the project
    const projectQueries = await db
      .select()
      .from(queries)
      .where((q, { eq, and }) => 
        and(
          eq(q.projectId, projectId),
          eq(q.isActive, true)
        )
      );

    console.log(`Running ${projectQueries.length} initial queries for project ${projectId}`);

    // Run each query
    for (const query of projectQueries) {
      try {
        // Create execution record
        const [execution] = await db.insert(queryExecutions).values({
          queryId: query.id,
          status: 'running',
          provider: 'openai',
        }).returning();

        // Generate response from AI
        const { text: aiResponse } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt: query.query,
          temperature: 0.7,
          maxTokens: 1500,
        });

        // Detect mentions in the response
        const mentions = await detectMentions(aiResponse, projectId);

        // Store mentions with sentiment analysis
        const mentionResults = [];
        for (const mention of mentions) {
          const sentiment = await analyzeSentiment(mention.context);
          
          const [storedMention] = await db.insert(brandMentions).values({
            projectId,
            queryExecutionId: execution.id,
            platform: 'openai',
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

          mentionResults.push(storedMention);
        }

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

        console.log(`Query "${query.name}" completed with ${mentionResults.length} mentions`);

      } catch (error) {
        console.error(`Failed to run query "${query.name}":`, error);
      }
    }

    return { success: true, queriesRun: projectQueries.length };
  } catch (error) {
    console.error('Failed to run initial queries:', error);
    return { success: false, error };
  }
}