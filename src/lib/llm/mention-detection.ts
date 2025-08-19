import { db } from '@/lib/db';
import { projects, competitors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface BrandMention {
  brandName: string;
  context: string;
  fullContext: string;
  competitors: string[];
  features: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export async function detectMentions(
  text: string,
  projectId: string
): Promise<BrandMention[]> {
  // Get project details
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Get competitors
  const projectCompetitors = await db.query.competitors.findMany({
    where: eq(competitors.projectId, projectId),
  });

  const competitorNames = projectCompetitors.map(c => c.name);
  const brandName = project.brandName;

  // Split text into sentences for context
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const mentions: BrandMention[] = [];

  // Check each sentence for brand mentions
  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    const lowerBrand = brandName.toLowerCase();

    // Check if brand is mentioned
    if (lowerSentence.includes(lowerBrand)) {
      // Get context (previous and next sentence)
      const contextStart = Math.max(0, index - 1);
      const contextEnd = Math.min(sentences.length - 1, index + 1);
      const fullContext = sentences
        .slice(contextStart, contextEnd + 1)
        .join(' ')
        .trim();

      // Check which competitors are mentioned in the context
      const mentionedCompetitors = competitorNames.filter(comp =>
        fullContext.toLowerCase().includes(comp.toLowerCase())
      );

      // Extract features mentioned (basic implementation)
      const features = extractFeatures(fullContext);

      mentions.push({
        brandName,
        context: sentence.trim(),
        fullContext,
        competitors: mentionedCompetitors,
        features,
      });
    }

    // Also check for competitor mentions without brand
    competitorNames.forEach(competitor => {
      if (
        lowerSentence.includes(competitor.toLowerCase()) &&
        !lowerSentence.includes(lowerBrand)
      ) {
        const contextStart = Math.max(0, index - 1);
        const contextEnd = Math.min(sentences.length - 1, index + 1);
        const fullContext = sentences
          .slice(contextStart, contextEnd + 1)
          .join(' ')
          .trim();

        const features = extractFeatures(fullContext);

        mentions.push({
          brandName: competitor,
          context: sentence.trim(),
          fullContext,
          competitors: [brandName], // Our brand is the competitor in this context
          features,
        });
      }
    });
  });

  return mentions;
}

function extractFeatures(text: string): string[] {
  const features: string[] = [];

  // Common feature keywords
  const featureKeywords = [
    'analytics',
    'dashboard',
    'automation',
    'integration',
    'API',
    'real-time',
    'collaboration',
    'security',
    'performance',
    'scalability',
    'reporting',
    'workflow',
    'AI',
    'machine learning',
    'ML',
    'cloud',
    'mobile',
    'enterprise',
    'customization',
    'support',
    'pricing',
    'free trial',
    'open source',
    'self-hosted',
    'SaaS',
    'user-friendly',
    'intuitive',
    'fast',
    'reliable',
    'robust',
  ];

  const lowerText = text.toLowerCase();

  featureKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      features.push(keyword);
    }
  });

  return [...new Set(features)]; // Remove duplicates
}
