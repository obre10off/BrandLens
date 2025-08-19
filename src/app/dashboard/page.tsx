import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { db } from '@/lib/db';
import {
  brandMentions,
  queryExecutions,
  queries,
  projects,
  competitors,
} from '@/lib/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

// Import new dashboard components
import { BrandHealthScore } from '@/components/dashboard/brand-health-score';
import { CompetitiveIntelligence } from '@/components/dashboard/competitive-intelligence';
import { AIMentionFeed } from '@/components/dashboard/ai-mention-feed';
import { GEOInsights } from '@/components/dashboard/geo-insights';
import { QueryPerformance } from '@/components/dashboard/query-performance';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const organizations = await getUserOrganizations(session.user.id);
  const currentOrg = organizations[0];

  if (!currentOrg || currentOrg.projectCount === 0) {
    redirect('/onboarding');
  }

  // Get current project
  const [currentProject] = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, currentOrg.id))
    .limit(1);

  if (!currentProject) {
    redirect('/onboarding');
  }

  // Fetch comprehensive dashboard data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Brand Health Data
  const [brandStats] = await db
    .select({
      totalMentions: sql<number>`count(*)`,
      positive: sql<number>`count(case when sentiment = 'positive' then 1 end)`,
      neutral: sql<number>`count(case when sentiment = 'neutral' then 1 end)`,
      negative: sql<number>`count(case when sentiment = 'negative' then 1 end)`,
    })
    .from(brandMentions)
    .where(
      and(
        eq(brandMentions.projectId, currentProject.id),
        gte(brandMentions.createdAt, thirtyDaysAgo)
      )
    );

  // Calculate brand health score
  const totalMentions = brandStats?.totalMentions || 0;
  const visibilityScore = Math.min(100, (totalMentions / 50) * 100); // Target 50 mentions/month
  const sentimentScore =
    totalMentions > 0
      ? Math.round(((brandStats.positive || 0) / totalMentions) * 100)
      : 50;
  const authorityScore = 70; // Mock data - would be calculated from mention positioning
  const growthScore = 75; // Mock data - would be calculated from trend analysis
  const competitiveScore = 65; // Mock data - would be calculated from competitor analysis

  const overallScore = Math.round(
    visibilityScore * 0.3 +
      sentimentScore * 0.25 +
      authorityScore * 0.2 +
      competitiveScore * 0.15 +
      growthScore * 0.1
  );

  const brandHealthData = {
    overallScore,
    components: {
      visibility: visibilityScore,
      sentiment: sentimentScore,
      authority: authorityScore,
      competitiveness: competitiveScore,
      growth: growthScore,
    },
    totalMentions,
    trend: 'up' as const,
    previousScore: overallScore - 5,
  };

  // Competitive Intelligence Data
  const projectCompetitors = await db
    .select()
    .from(competitors)
    .where(eq(competitors.projectId, currentProject.id))
    .limit(5);

  const competitiveData = {
    yourBrand: {
      id: currentProject.id,
      name: currentProject.brandName,
      domain: currentProject.brandDomain || undefined,
      mentionCount: totalMentions,
      shareOfVoice: totalMentions > 0 ? 35 : 0, // Mock calculation
      sentiment: {
        positive: brandStats?.positive || 0,
        neutral: brandStats?.neutral || 0,
        negative: brandStats?.negative || 0,
        average: sentimentScore,
      },
      trend: 'up' as const,
      trendValue: 12,
      position: 2,
      isYou: true,
    },
    competitors: projectCompetitors.slice(0, 4).map((comp, index) => ({
      id: comp.id,
      name: comp.name,
      domain: comp.domain || undefined,
      mentionCount: Math.floor(Math.random() * 100) + 20,
      shareOfVoice: Math.floor(Math.random() * 30) + 10,
      sentiment: {
        positive: Math.floor(Math.random() * 20) + 10,
        neutral: Math.floor(Math.random() * 15) + 5,
        negative: Math.floor(Math.random() * 5) + 1,
        average: Math.floor(Math.random() * 30) + 60,
      },
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as
        | 'up'
        | 'down'
        | 'stable',
      trendValue: Math.floor(Math.random() * 20) - 10,
      position: index + (index >= 1 ? 2 : 1), // Skip position 2 (our brand)
    })),
    totalMentions: totalMentions + 200, // Mock total market mentions
    marketInsights: {
      leader: projectCompetitors[0]?.name || 'Market Leader',
      fastestGrowing: projectCompetitors[1]?.name || 'Growing Competitor',
      biggestThreat: projectCompetitors[2]?.name || 'Threat Competitor',
      opportunities: [
        'Increase visibility in "best CRM" queries',
        'Improve sentiment around pricing discussions',
        'Target small business segment queries',
      ],
    },
  };

  // Recent Mentions Data
  const recentMentions = await db
    .select({
      mention: brandMentions,
      execution: queryExecutions,
      query: queries,
    })
    .from(brandMentions)
    .leftJoin(
      queryExecutions,
      eq(brandMentions.queryExecutionId, queryExecutions.id)
    )
    .leftJoin(queries, eq(queryExecutions.queryId, queries.id))
    .where(eq(brandMentions.projectId, currentProject.id))
    .orderBy(desc(brandMentions.createdAt))
    .limit(10);

  const aiMentionData = recentMentions.map(({ mention, query }) => ({
    id: mention.id,
    content: mention.content || 'Brand mentioned in AI response',
    context: mention.context || '',
    brandName: currentProject.brandName,
    llmModel: 'gpt-4', // Mock data - would come from metadata
    platform: mention.platform || 'OpenAI',
    sentiment:
      (mention.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral',
    sentimentScore: parseFloat(mention.sentimentScore || '0.5') * 100,
    mentionType: 'direct' as const, // Mock data - would come from metadata
    position: 1, // Mock data - would come from metadata
    queryCategory: query?.category || 'general',
    createdAt: mention.createdAt,
    responseText: mention.content, // Use content as response text
  }));

  // GEO Insights Data (mock data for now)
  const geoInsights = [
    {
      id: '1',
      type: 'opportunity' as const,
      priority: 'high' as const,
      title: 'Improve API Documentation Mentions',
      description:
        'Your API documentation is rarely mentioned in developer tool recommendations. Creating comprehensive guides could improve visibility.',
      impact: 'Could increase mentions by 25-30% in developer queries',
      effort: 'medium' as const,
      category: 'content' as const,
      actionable: true,
      cta: {
        label: 'Review Content Strategy',
        href: '/dashboard/content',
      },
      metrics: {
        current: totalMentions,
        target: Math.round(totalMentions * 1.3),
        unit: ' mentions',
      },
      timeframe: '4-6 weeks',
      confidence: 85,
    },
    {
      id: '2',
      type: 'threat' as const,
      priority: 'medium' as const,
      title: 'Competitor Gaining in Integration Queries',
      description:
        'A competitor is increasingly mentioned in integration-focused queries where you previously dominated.',
      impact: 'Risk of losing 15% share in integration recommendations',
      effort: 'high' as const,
      category: 'competitive' as const,
      actionable: true,
      cta: {
        label: 'Analyze Competitor Strategy',
        href: '/dashboard/competitors',
      },
      timeframe: '2-3 weeks',
      confidence: 78,
    },
  ];

  // Query Performance Data
  const activeQueries = await db
    .select()
    .from(queries)
    .where(eq(queries.projectId, currentProject.id))
    .limit(10);

  const queryPerformanceData = activeQueries.map(query => ({
    id: query.id,
    name: query.name,
    category: query.category || 'general',
    template: query.query,
    executionCount: Math.floor(Math.random() * 20) + 5,
    mentionCount: Math.floor(Math.random() * 15) + 2,
    avgSentiment: Math.floor(Math.random() * 40) + 60,
    successRate: Math.floor(Math.random() * 30) + 70,
    lastExecuted: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ),
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as
      | 'up'
      | 'down'
      | 'stable',
    trendValue: Math.floor(Math.random() * 20) - 10,
    avgPosition: Math.floor(Math.random() * 3) + 1,
    competitorMentions: Math.floor(Math.random() * 10) + 3,
    performanceScore: Math.floor(Math.random() * 40) + 60,
    isActive: query.isActive || false,
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Brand Intelligence Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Comprehensive AI visibility insights for{' '}
            <span className="font-semibold text-primary">
              {currentProject.brandName}
            </span>
          </p>
        </div>

        {/* Top Row - Brand Health & Competitive Intelligence */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <BrandHealthScore
              data={brandHealthData}
              className="h-full shadow-lg border-0"
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <CompetitiveIntelligence
              data={competitiveData}
              className="h-full shadow-lg border-0"
            />
          </div>
        </div>

        {/* Second Row - Query Performance & GEO Insights */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <QueryPerformance
              queries={queryPerformanceData}
              totalExecutions={queryPerformanceData.reduce(
                (sum, q) => sum + q.executionCount,
                0
              )}
              totalMentions={totalMentions}
              className="h-full shadow-lg border-0"
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <GEOInsights
              insights={geoInsights}
              className="h-full shadow-lg border-0"
            />
          </div>
        </div>

        {/* Bottom Row - AI Mention Feed */}
        <div className="transform hover:scale-105 transition-transform duration-300">
          <AIMentionFeed
            mentions={aiMentionData}
            totalMentions={totalMentions}
            className="shadow-lg border-0"
          />
        </div>
      </div>
    </div>
  );
}
