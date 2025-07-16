# BrandLens LLM Processing

## Overview
Efficient batch processing system for querying ChatGPT and Claude. Designed for cost optimization, rate limit compliance, and reliable mention extraction.

## LLM Integration Architecture

### API Clients
```typescript
// src/lib/llm/openai-client.ts
import OpenAI from 'openai';

export class OpenAIClient {
  private client: OpenAI;
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.rateLimiter = new RateLimiter({
      maxRequests: 60,
      perMinutes: 1,
    });
  }
  
  async query(prompt: string): Promise<LLMResponse> {
    await this.rateLimiter.wait();
    
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini", // Cost-effective for our use case
        messages: [{
          role: "user",
          content: prompt,
        }],
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return {
        model: "gpt-4o-mini",
        prompt,
        response: completion.choices[0].message.content || "",
        tokens: completion.usage?.total_tokens || 0,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      throw new LLMError("OpenAI query failed", error);
    }
  }
}

// src/lib/llm/anthropic-client.ts
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicClient {
  private client: Anthropic;
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.rateLimiter = new RateLimiter({
      maxRequests: 50,
      perMinutes: 1,
    });
  }
  
  async query(prompt: string): Promise<LLMResponse> {
    await this.rateLimiter.wait();
    
    const message = await this.client.messages.create({
      model: "claude-3-haiku-20240307", // Fast and affordable
      messages: [{
        role: "user",
        content: prompt,
      }],
      max_tokens: 1000,
    });
    
    return {
      model: "claude-3-haiku",
      prompt,
      response: message.content[0].text,
      tokens: message.usage.input_tokens + message.usage.output_tokens,
      latency: Date.now() - startTime,
    };
  }
}
```

## Query Generation System

### Template Engine
```typescript
// src/lib/llm/query-templates.ts
export const queryTemplates = [
  // General comparisons
  {
    id: "general-best",
    category: "general",
    template: "What are the best {category} software tools in 2024?",
    variables: ["category"],
  },
  {
    id: "use-case-specific",
    category: "use-case",
    template: "What's the best {category} for {use_case}?",
    variables: ["category", "use_case"],
  },
  {
    id: "feature-focused",
    category: "features",
    template: "Which {category} tools have the best {feature}?",
    variables: ["category", "feature"],
  },
  {
    id: "alternatives",
    category: "alternatives",
    template: "What are the best alternatives to {competitor}?",
    variables: ["competitor"],
  },
  {
    id: "integration",
    category: "integration",
    template: "Which {category} tools integrate well with {platform}?",
    variables: ["category", "platform"],
  },
];

// SaaS-specific query data
export const saasCategories = {
  crm: {
    features: ["pipeline management", "email automation", "reporting"],
    use_cases: ["sales teams", "small business", "enterprise"],
    platforms: ["Slack", "Google Workspace", "Microsoft 365"],
  },
  project_management: {
    features: ["kanban boards", "time tracking", "resource planning"],
    use_cases: ["agile teams", "remote teams", "creative agencies"],
    platforms: ["GitHub", "Slack", "Jira"],
  },
  // ... more categories
};
```

### Query Builder
```typescript
export class QueryBuilder {
  generateQueries(project: Project): GeneratedQuery[] {
    const queries: GeneratedQuery[] = [];
    const category = this.detectCategory(project.domain);
    
    // Generate queries based on templates
    for (const template of queryTemplates) {
      if (this.shouldIncludeTemplate(template, project)) {
        const variations = this.generateVariations(template, category);
        queries.push(...variations);
      }
    }
    
    // Add competitor-specific queries
    for (const competitor of project.competitors) {
      queries.push({
        template: "alternatives",
        prompt: `What are the best alternatives to ${competitor.name}?`,
        metadata: { competitorId: competitor.id },
      });
    }
    
    return queries;
  }
  
  private generateVariations(
    template: QueryTemplate,
    category: SaaSCategory
  ): GeneratedQuery[] {
    const variations: GeneratedQuery[] = [];
    
    // Generate all combinations of variables
    const varCombinations = this.getCombinations(template.variables, category);
    
    for (const vars of varCombinations) {
      const prompt = this.fillTemplate(template.template, vars);
      variations.push({
        templateId: template.id,
        prompt,
        variables: vars,
      });
    }
    
    return variations.slice(0, 5); // Limit variations per template
  }
}
```

## Batch Processing System

### Queue Implementation
```typescript
// src/lib/jobs/llm-processor.ts
import { Queue, Worker } from 'bullmq';
import { Redis } from '@upstash/redis';

export const llmQueue = new Queue('llm-processing', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Add batch job
export async function queueProjectScan(projectId: string) {
  const queries = await generateProjectQueries(projectId);
  
  // Split into batches for parallel processing
  const batches = chunk(queries, 10);
  
  for (const [index, batch] of batches.entries()) {
    await llmQueue.add(`scan-${projectId}-${index}`, {
      projectId,
      queries: batch,
      batchIndex: index,
      totalBatches: batches.length,
    }, {
      delay: index * 5000, // Stagger batches by 5 seconds
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}

// Worker to process batches
const llmWorker = new Worker('llm-processing', async (job) => {
  const { projectId, queries } = job.data;
  
  // Process queries in parallel (respecting rate limits)
  const results = await Promise.allSettled(
    queries.map(query => processQuery(projectId, query))
  );
  
  // Store successful results
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  await storeLLMResponses(projectId, successful);
  
  // Log failures for retry
  const failed = results
    .filter(r => r.status === 'rejected')
    .map((r, i) => ({ query: queries[i], error: r.reason }));
  
  if (failed.length > 0) {
    await logFailedQueries(projectId, failed);
  }
  
  return {
    processed: successful.length,
    failed: failed.length,
  };
});
```

### Cost Optimization
```typescript
export class CostOptimizer {
  // Cache responses to avoid duplicate queries
  async getCachedOrQuery(
    prompt: string,
    model: LLMModel
  ): Promise<LLMResponse | null> {
    const cacheKey = this.generateCacheKey(prompt, model);
    const cached = await redis.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    
    const response = await this.queryLLM(prompt, model);
    
    // Cache for 7 days
    await redis.set(cacheKey, response, { ex: 7 * 24 * 60 * 60 });
    
    return response;
  }
  
  // Use cheaper models for simple queries
  selectOptimalModel(query: GeneratedQuery): LLMModel {
    if (query.complexity === 'simple') {
      return 'gpt-4o-mini'; // Cheaper
    }
    if (query.priority === 'high') {
      return 'gpt-4o'; // Better quality
    }
    return 'claude-3-haiku'; // Good balance
  }
  
  // Batch similar queries
  optimizeQueryBatch(queries: GeneratedQuery[]): OptimizedBatch[] {
    // Group by similarity to potentially combine
    const grouped = this.groupBySimilarity(queries);
    
    return grouped.map(group => ({
      combinedPrompt: this.combinePrompts(group),
      originalQueries: group,
      estimatedCost: this.estimateCost(group),
    }));
  }
}
```

## Response Processing

### Mention Extraction
```typescript
export class MentionExtractor {
  private brandPatterns: Map<string, RegExp>;
  
  constructor() {
    this.brandPatterns = new Map();
  }
  
  extractMentions(
    response: string,
    brandName: string,
    competitors: string[]
  ): ExtractedMention[] {
    const mentions: ExtractedMention[] = [];
    const allBrands = [brandName, ...competitors];
    
    for (const brand of allBrands) {
      const pattern = this.getBrandPattern(brand);
      const matches = this.findMatches(response, pattern);
      
      for (const match of matches) {
        mentions.push({
          brandName: brand,
          context: this.extractContext(response, match.index),
          position: match.index,
          type: this.classifyMentionType(match, response),
          sentiment: this.analyzeSentiment(match.context),
          confidence: this.calculateConfidence(match),
        });
      }
    }
    
    return this.deduplicateMentions(mentions);
  }
  
  private getBrandPattern(brand: string): RegExp {
    if (!this.brandPatterns.has(brand)) {
      // Handle variations: "Slack", "Slack's", "slack.com"
      const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `\\b(${escaped}|${escaped}'s?|${escaped}\\.com|${escaped} app)\\b`,
        'gi'
      );
      this.brandPatterns.set(brand, pattern);
    }
    return this.brandPatterns.get(brand)!;
  }
  
  private classifyMentionType(
    match: RegExpMatch,
    fullText: string
  ): MentionType {
    const context = fullText.substring(
      Math.max(0, match.index - 100),
      Math.min(fullText.length, match.index + 100)
    );
    
    if (/recommend|best|top|prefer/i.test(context)) {
      return 'recommendation';
    }
    if (/alternative|instead|versus|vs/i.test(context)) {
      return 'comparison';
    }
    if (/integrat|connect|work with/i.test(context)) {
      return 'integration';
    }
    if (/feature|capability|offer/i.test(context)) {
      return 'feature';
    }
    
    return 'general';
  }
}
```

### Sentiment Analysis
```typescript
export class SentimentAnalyzer {
  private positiveWords = new Set([
    'best', 'excellent', 'great', 'amazing', 'powerful',
    'recommended', 'favorite', 'love', 'perfect', 'reliable',
  ]);
  
  private negativeWords = new Set([
    'worst', 'terrible', 'avoid', 'problem', 'issue',
    'expensive', 'difficult', 'complex', 'lacking', 'missing',
  ]);
  
  private modifiers = {
    negation: /\b(not|no|never|neither|none|nothing)\b/gi,
    intensifier: /\b(very|extremely|highly|really|quite)\b/gi,
  };
  
  analyzeSentiment(context: string): SentimentResult {
    const words = context.toLowerCase().split(/\s+/);
    let score = 0;
    let confidence = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isNegated = this.checkNegation(words, i);
      
      if (this.positiveWords.has(word)) {
        score += isNegated ? -1 : 1;
        confidence += 0.1;
      } else if (this.negativeWords.has(word)) {
        score += isNegated ? 1 : -1;
        confidence += 0.1;
      }
    }
    
    // Normalize score to -1 to 1
    const normalizedScore = Math.max(-1, Math.min(1, score / 5));
    
    return {
      sentiment: this.scoreToSentiment(normalizedScore),
      score: normalizedScore,
      confidence: Math.min(1, confidence),
    };
  }
  
  private scoreToSentiment(score: number): Sentiment {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }
}
```

## Error Handling & Retry Logic

```typescript
export class LLMErrorHandler {
  async handleError(error: unknown, context: QueryContext): Promise<void> {
    if (error instanceof RateLimitError) {
      // Exponential backoff
      await this.retryQueue.add({
        ...context,
        retryCount: (context.retryCount || 0) + 1,
        retryAfter: error.retryAfter || 60000,
      });
    } else if (error instanceof APIError && error.code === 'context_length') {
      // Split query or use smaller model
      await this.handleContextLengthError(context);
    } else if (error instanceof NetworkError) {
      // Retry with backoff
      await this.scheduleRetry(context, 5000);
    } else {
      // Log to Sentry and mark as failed
      await this.logPermanentFailure(error, context);
    }
  }
  
  private async scheduleRetry(
    context: QueryContext,
    delay: number
  ): Promise<void> {
    if (context.retryCount >= 3) {
      await this.logPermanentFailure(new Error('Max retries exceeded'), context);
      return;
    }
    
    await this.retryQueue.add(context, {
      delay,
      attempts: 1,
    });
  }
}
```

## Performance Metrics

```typescript
export class LLMMetrics {
  async trackQuery(response: LLMResponse): Promise<void> {
    await Promise.all([
      this.trackCost(response),
      this.trackLatency(response),
      this.trackQuality(response),
    ]);
  }
  
  private async trackCost(response: LLMResponse): Promise<void> {
    const costPerToken = this.getCostPerToken(response.model);
    const cost = response.tokens * costPerToken;
    
    await db.insert(usageMetrics).values({
      model: response.model,
      tokens: response.tokens,
      cost,
      timestamp: new Date(),
    });
  }
  
  private getCostPerToken(model: string): number {
    const costs = {
      'gpt-4o-mini': 0.00015 / 1000, // $0.15 per 1M tokens
      'gpt-4o': 0.0025 / 1000, // $2.50 per 1M tokens
      'claude-3-haiku': 0.00025 / 1000, // $0.25 per 1M tokens
    };
    return costs[model] || 0.001 / 1000;
  }
}
```