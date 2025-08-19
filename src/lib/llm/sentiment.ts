import { openai } from '@ai-sdk/openai';
import { generateObject, jsonSchema } from 'ai';

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  keywords: string[];
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: jsonSchema({
        type: 'object',
        properties: {
          sentiment: {
            type: 'string',
            enum: ['positive', 'neutral', 'negative'],
            description: 'Overall sentiment of the text',
          },
          score: {
            type: 'number',
            minimum: -1,
            maximum: 1,
            description:
              'Sentiment score from -1 (most negative) to 1 (most positive)',
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Confidence level of the sentiment analysis',
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Key words/phrases that influenced the sentiment',
          },
        },
        required: ['sentiment', 'score', 'confidence', 'keywords'],
      }),
      prompt: `Analyze the sentiment of the following text about a brand or product. 
      Determine if the overall sentiment is positive, neutral, or negative.
      Provide a score from -1 (most negative) to 1 (most positive).
      Include your confidence level and key words/phrases that influenced your analysis.
      
      Text: "${text}"`,
    });

    return object as SentimentResult;
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    // Return neutral sentiment as fallback
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0.5,
      keywords: [],
    };
  }
}

// Simple rule-based sentiment analysis as fallback
export function analyzeSentimentSimple(text: string): SentimentResult {
  const lowerText = text.toLowerCase();

  const positiveWords = [
    'excellent',
    'amazing',
    'great',
    'fantastic',
    'wonderful',
    'best',
    'love',
    'perfect',
    'awesome',
    'outstanding',
    'superior',
    'recommend',
    'impressive',
    'brilliant',
    'exceptional',
    'remarkable',
    'reliable',
    'efficient',
    'powerful',
    'intuitive',
    'seamless',
    'innovative',
  ];

  const negativeWords = [
    'bad',
    'poor',
    'terrible',
    'awful',
    'worst',
    'hate',
    'disappointed',
    'frustrating',
    'annoying',
    'difficult',
    'complicated',
    'expensive',
    'slow',
    'buggy',
    'broken',
    'useless',
    'waste',
    'avoid',
    'problem',
    'issue',
    'lacks',
    'missing',
    'inferior',
    'outdated',
  ];

  let positiveCount = 0;
  let negativeCount = 0;
  const foundKeywords: string[] = [];

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      positiveCount++;
      foundKeywords.push(word);
    }
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      negativeCount++;
      foundKeywords.push(word);
    }
  });

  const totalWords = positiveCount + negativeCount;

  if (totalWords === 0) {
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0.7,
      keywords: [],
    };
  }

  const score = (positiveCount - negativeCount) / totalWords;
  let sentiment: 'positive' | 'neutral' | 'negative';

  if (score > 0.3) {
    sentiment = 'positive';
  } else if (score < -0.3) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    sentiment,
    score: Math.max(-1, Math.min(1, score)),
    confidence: Math.min(0.9, totalWords / 10), // Higher confidence with more sentiment words
    keywords: foundKeywords.slice(0, 5), // Return top 5 keywords
  };
}
