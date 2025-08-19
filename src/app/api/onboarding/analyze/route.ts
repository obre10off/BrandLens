import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject, jsonSchema } from 'ai';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth/middleware';

const analysisSchema = z.object({
  description: z
    .string()
    .describe('A concise description of what the company does'),
  industry: z
    .string()
    .describe('The primary industry or sector the company operates in'),
  keyFeatures: z
    .array(z.string())
    .describe('3-5 key features or capabilities of the product/service'),
  competitors: z
    .array(z.string())
    .describe('3-5 main competitors in the same space'),
  icp: z
    .string()
    .describe(
      'Ideal Customer Profile - who would benefit most from this product'
    ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyInfo, personalInfo } = await request.json();

    // Extract domain from website URL
    const domain = new URL(companyInfo.website).hostname.replace('www.', '');

    // Analyze company using AI
    const prompt = `
Analyze the following company and provide structured information:

Company Name: ${companyInfo.name}
Website: ${companyInfo.website}
Domain: ${domain}
Industry Context: The person is a ${personalInfo.role} at a company with ${personalInfo.companySize} employees.

Based on the company name, website domain, and context, provide:
1. A brief description of what the company likely does
2. The primary industry they operate in
3. 3-5 key features or capabilities they might offer
4. 3-5 main competitors in their space
5. Their ideal customer profile

Focus on SaaS/tech companies and be specific but concise.
`;

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: jsonSchema({
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'A concise description of what the company does',
          },
          industry: {
            type: 'string',
            description:
              'The primary industry or sector the company operates in',
          },
          keyFeatures: {
            type: 'array',
            items: { type: 'string' },
            description:
              '3-5 key features or capabilities of the product/service',
          },
          competitors: {
            type: 'array',
            items: { type: 'string' },
            description: '3-5 main competitors in the same space',
          },
          icp: {
            type: 'string',
            description:
              'Ideal Customer Profile - who would benefit most from this product',
          },
        },
        required: [
          'description',
          'industry',
          'keyFeatures',
          'competitors',
          'icp',
        ],
      }),
      prompt,
    });

    // Store the analysis in the session or database
    // For now, we'll just return it
    return NextResponse.json(object);
  } catch (error) {
    console.error('Analysis error:', error);

    // Fallback analysis if AI fails
    const fallbackAnalysis = {
      description: 'A modern SaaS platform helping businesses grow and succeed',
      industry: 'Software as a Service (SaaS)',
      keyFeatures: [
        'Cloud-based solution',
        'Real-time analytics',
        'Team collaboration',
        'API integrations',
        'Custom workflows',
      ],
      competitors: [
        'Competitor A',
        'Competitor B',
        'Competitor C',
        'Competitor D',
      ],
      icp: 'Small to medium-sized businesses looking to streamline their operations and improve efficiency',
    };

    return NextResponse.json(fallbackAnalysis);
  }
}
