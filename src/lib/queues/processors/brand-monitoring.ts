import { Worker, Job } from 'bullmq';
import { db } from '@/lib/db';
import { projects, projectQueries, brandMentions, llmResponses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { RedisCache, CACHE_PREFIXES, CACHE_TTL } from '@/lib/redis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface BrandMonitoringJob {
  projectId: string;
  queryIds?: string[];
  models?: string[];
}

interface MentionResult {
  brandName: string;
  context: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  position: number;
  type: 'direct' | 'feature' | 'competitive';
}

export function createBrandMonitoringWorker() {
  return new Worker(
    'brand-monitoring',
    async (job: Job<BrandMonitoringJob>) => {
      const { projectId, queryIds, models = ['gpt-4o-mini', 'claude-3-haiku'] } = job.data;

      // Get project details
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          competitors: true,
          queries: {
            where: queryIds ? 
              and(
                eq(projectQueries.isActive, true),
                eq(projectQueries.id, queryIds[0]) // Simplified for now
              ) : 
              eq(projectQueries.isActive, true),
          },
        },
      });

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      const brandsToTrack = [
        project.brandName,
        ...project.competitors.map(c => c.name),
      ];

      const results: Array<{
        queryId: string;
        model: string;
        mentions: MentionResult[];
      }> = [];

      // Process each query
      for (const query of project.queries) {
        await job.updateProgress({
          current: project.queries.indexOf(query),
          total: project.queries.length,
          message: `Processing query: ${query.query}`,
        });

        // Check cache first
        const cacheKey = `${CACHE_PREFIXES.queryResult}${query.id}`;
        const cached = await RedisCache.get(cacheKey);
        if (cached) {
          // Type assertion for cached result
          const cachedResult = cached as { queryId: string; model: string; mentions: MentionResult[] };
          results.push(cachedResult);
          continue;
        }

        // Execute query across models
        for (const model of models) {
          try {
            const response = await executeLLMQuery(
              query.query,
              model,
              brandsToTrack
            );

            // Store raw response
            await db.insert(llmResponses).values({
              projectId,
              queryId: query.id,
              llmModel: model,
              prompt: query.query,
              response: response.text,
              metadata: response.metadata,
            });

            // Extract and store mentions
            const mentions = extractMentions(
              response.text,
              brandsToTrack
            );

            for (const mention of mentions) {
              await db.insert(brandMentions).values({
                projectId,
                platform: model,
                content: mention.brandName,
                sentiment: mention.sentiment,
                sentimentScore: mention.score.toString(),
                context: mention.context,
                metadata: {
                  mentionType: mention.type,
                  position: mention.position,
                  queryId: query.id,
                },
              });
            }

            const result = {
              queryId: query.id,
              model,
              mentions,
            };
            
            results.push(result);

            // Cache the result
            await RedisCache.set(
              cacheKey,
              result,
              CACHE_TTL.queryResult
            );
          } catch (error) {
            console.error(`Error processing query ${query.id} with ${model}:`, error);
            // Continue with next model
          }
        }
      }

      // Invalidate project metrics cache
      await RedisCache.delete(`${CACHE_PREFIXES.projectMetrics}${projectId}`);

      return {
        projectId,
        queriesProcessed: project.queries.length,
        totalMentions: results.reduce((acc, r) => acc + r.mentions.length, 0),
        results,
      };
    },
    {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      },
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 60000, // 10 jobs per minute
      },
    }
  );
}

async function executeLLMQuery(
  query: string,
  model: string,
  brandsToTrack: string[]
) {
  const systemPrompt = `You are an AI assistant helping users find the best software solutions. 
When answering queries, be objective and mention relevant brands when appropriate. 
Consider these brands in your response if relevant: ${brandsToTrack.join(', ')}.
Provide balanced, factual information.`;

  const startTime = Date.now();

  if (model.startsWith('gpt')) {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      text: completion.choices[0].message.content || '',
      metadata: {
        model,
        usage: completion.usage,
        latency: Date.now() - startTime,
      },
    };
  } else if (model.startsWith('claude')) {
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: query },
      ],
    });

    return {
      text: message.content[0].type === 'text' ? message.content[0].text : '',
      metadata: {
        model,
        usage: {
          prompt_tokens: message.usage.input_tokens,
          completion_tokens: message.usage.output_tokens,
          total_tokens: message.usage.input_tokens + message.usage.output_tokens,
        },
        latency: Date.now() - startTime,
      },
    };
  }

  throw new Error(`Unsupported model: ${model}`);
}

function extractMentions(
  text: string,
  brandsToTrack: string[]
): MentionResult[] {
  const mentions: MentionResult[] = [];
  const textLower = text.toLowerCase();

  for (const brand of brandsToTrack) {
    const brandLower = brand.toLowerCase();
    let position = 0;
    let index = textLower.indexOf(brandLower);

    while (index !== -1) {
      position++;

      // Extract context (100 chars before and after)
      const contextStart = Math.max(0, index - 100);
      const contextEnd = Math.min(text.length, index + brand.length + 100);
      const context = text.substring(contextStart, contextEnd);

      // Determine mention type
      const type = determineMentionType(context);

      // Analyze sentiment
      const sentiment = analyzeSentiment(context);

      mentions.push({
        brandName: brand,
        context,
        sentiment: sentiment.sentiment,
        score: sentiment.score,
        position,
        type,
      });

      // Find next occurrence
      index = textLower.indexOf(brandLower, index + 1);
    }
  }

  return mentions;
}

function determineMentionType(
  context: string
): 'direct' | 'feature' | 'competitive' {
  const contextLower = context.toLowerCase();
  
  // Check for competitive mentions
  const competitiveKeywords = ['unlike', 'compared to', 'versus', 'vs', 'better than', 'worse than', 'alternative to'];
  if (competitiveKeywords.some(keyword => contextLower.includes(keyword))) {
    return 'competitive';
  }

  // Check for feature mentions
  const featureKeywords = ['feature', 'capability', 'integration', 'functionality', 'supports', 'offers'];
  if (featureKeywords.some(keyword => contextLower.includes(keyword))) {
    return 'feature';
  }

  return 'direct';
}

function analyzeSentiment(
  context: string
): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } {
  const contextLower = context.toLowerCase();

  const positiveWords = [
    'excellent', 'great', 'best', 'amazing', 'fantastic', 'superior',
    'recommended', 'preferred', 'popular', 'powerful', 'reliable',
    'efficient', 'innovative', 'leading', 'top-rated', 'favorite',
  ];

  const negativeWords = [
    'poor', 'bad', 'worst', 'terrible', 'inferior', 'disappointing',
    'unreliable', 'difficult', 'complex', 'expensive', 'limited',
    'outdated', 'slow', 'buggy', 'frustrating', 'lacking',
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (contextLower.includes(word)) positiveCount++;
  }

  for (const word of negativeWords) {
    if (contextLower.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) {
    return {
      sentiment: 'positive',
      score: Math.min(1, 0.5 + (positiveCount * 0.1)),
    };
  } else if (negativeCount > positiveCount) {
    return {
      sentiment: 'negative',
      score: Math.max(0, 0.5 - (negativeCount * 0.1)),
    };
  } else {
    return {
      sentiment: 'neutral',
      score: 0.5,
    };
  }
}