import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { db } from '@/lib/db';
import { brandMentions, queryExecutions, queries, projects } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus, TrendingUp, Users, Target, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import SentimentChart from '@/components/dashboard/sentiment-chart';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  const organizations = await getUserOrganizations(session.user.id);
  const currentOrg = organizations[0]; // For now, use the first org

  // Check if user needs onboarding
  if (!currentOrg || currentOrg.projectCount === 0) {
    redirect('/onboarding');
  }

  // Fetch the projects for this organization
  const [currentProject] = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, currentOrg.id))
    .limit(1);

  if (!currentProject) {
    redirect('/onboarding');
  }

  // Fetch real statistics
  const [mentionsData] = await db
    .select({
      total: sql<number>`count(*)`,
      positive: sql<number>`count(case when sentiment = 'positive' then 1 end)`,
      neutral: sql<number>`count(case when sentiment = 'neutral' then 1 end)`,
      negative: sql<number>`count(case when sentiment = 'negative' then 1 end)`,
    })
    .from(brandMentions)
    .where(eq(brandMentions.projectId, currentProject.id));

  const stats = {
    totalMentions: mentionsData?.total || 0,
    sentimentScore: mentionsData?.total > 0 
      ? Math.round(((mentionsData.positive || 0) / mentionsData.total) * 100)
      : 0,
    positive: mentionsData?.positive || 0,
    neutral: mentionsData?.neutral || 0,
    negative: mentionsData?.negative || 0,
  };

  // Get recent query count
  const [queryStats] = await db
    .select({
      weeklyQueries: sql<number>`count(*)`,
    })
    .from(queryExecutions)
    .innerJoin(queries, eq(queryExecutions.queryId, queries.id))
    .where(
      sql`${queries.projectId} = ${currentProject.id} 
      AND ${queryExecutions.createdAt} > NOW() - INTERVAL '7 days'`
    );

  // Get recent mentions for activity feed
  const recentMentions = await db
    .select({
      mention: brandMentions,
      execution: queryExecutions,
      query: queries,
    })
    .from(brandMentions)
    .leftJoin(queryExecutions, eq(brandMentions.queryExecutionId, queryExecutions.id))
    .leftJoin(queries, eq(queryExecutions.queryId, queries.id))
    .where(eq(brandMentions.projectId, currentProject.id))
    .orderBy(desc(brandMentions.createdAt))
    .limit(5);

  // Get sentiment data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sentimentByDay = await db
    .select({
      date: sql<string>`DATE(${brandMentions.createdAt})`,
      positive: sql<number>`count(case when ${brandMentions.sentiment} = 'positive' then 1 end)`,
      neutral: sql<number>`count(case when ${brandMentions.sentiment} = 'neutral' then 1 end)`,
      negative: sql<number>`count(case when ${brandMentions.sentiment} = 'negative' then 1 end)`,
      total: sql<number>`count(*)`
    })
    .from(brandMentions)
    .where(
      sql`${brandMentions.projectId} = ${currentProject.id} 
      AND ${brandMentions.createdAt} >= ${thirtyDaysAgo}`
    )
    .groupBy(sql`DATE(${brandMentions.createdAt})`)
    .orderBy(sql`DATE(${brandMentions.createdAt})`);
  
  // Fill in missing days with zeros
  const sentimentData = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const existing = sentimentByDay.find(d => d.date === dateStr);
    sentimentData.push({
      date: dateStr,
      positive: existing?.positive || 0,
      neutral: existing?.neutral || 0,
      negative: existing?.negative || 0,
      total: existing?.total || 0,
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-black">Welcome back, {session.user.name || 'there'}!</h1>
        <p className="text-black">
          {currentOrg?.trial?.status === 'active' 
            ? `You're on a free trial with ${(currentOrg.trial?.queriesLimit || 25) - (currentOrg.trial?.queriesUsed || 0)} queries remaining`
            : 'Track your brand mentions across AI platforms'
          }
        </p>
      </div>

      {/* Brand Overview */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-black">Brand Overview</CardTitle>
          <CardDescription className="text-black">
            Monitoring AI conversations about {currentProject.brandName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-black mb-1">Brand Name</p>
              <p className="text-lg text-black">{currentProject.brandName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-black mb-1">Website</p>
              <p className="text-lg text-black">
                <a 
                  href={`https://${currentProject.brandDomain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {currentProject.brandDomain}
                </a>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-black mb-1">Industry</p>
              <p className="text-lg text-black">{currentProject.category || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-black mb-1">Description</p>
              <p className="text-sm text-black">{currentProject.description || 'No description available'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 quick-stats">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Mentions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.totalMentions}</div>
            <p className="text-xs text-black">Found across AI platforms</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Sentiment Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stats.totalMentions > 0 ? `${stats.sentimentScore}%` : 'N/A'}
            </div>
            <p className="text-xs text-black">
              {stats.positive} positive mentions
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Neutral/Negative</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.neutral + stats.negative}</div>
            <p className="text-xs text-black">
              {stats.neutral} neutral, {stats.negative} negative
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Queries Run</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{queryStats?.weeklyQueries || 0}</div>
            <p className="text-xs text-black">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Chart */}
      <SentimentChart data={sentimentData} />

      {/* Recent Activity */}
      <Card className="recent-activity">
        <CardHeader>
          <CardTitle className="text-black">Recent Brand Mentions</CardTitle>
          <CardDescription className="text-black">
            Latest mentions of your brand across AI platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentMentions.length === 0 ? (
            <div className="text-center py-8 text-black">
              <p className="text-sm mb-4">No mentions found yet</p>
              <p className="text-xs">Run queries to start tracking your brand</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMentions.map(({ mention, query }) => {
                const getSentimentColor = (sentiment: string) => {
                  switch (sentiment) {
                    case 'positive': return 'bg-green-100';
                    case 'negative': return 'bg-red-100';
                    default: return 'bg-gray-100';
                  }
                };
                
                const getSentimentIcon = (sentiment: string) => {
                  switch (sentiment) {
                    case 'positive': return <TrendingUp className="h-5 w-5 text-green-600" />;
                    case 'negative': return <TrendingDown className="h-5 w-5 text-red-600" />;
                    default: return <Minus className="h-5 w-5 text-gray-600" />;
                  }
                };
                
                const getSentimentTextColor = (sentiment: string) => {
                  switch (sentiment) {
                    case 'positive': return 'text-green-600';
                    case 'negative': return 'text-red-600';
                    default: return 'text-gray-600';
                  }
                };

                return (
                  <div key={mention.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`h-10 w-10 rounded-full ${getSentimentColor(mention.sentiment || 'neutral')} flex items-center justify-center`}>
                      {getSentimentIcon(mention.sentiment || 'neutral')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-black">{mention.content}</h4>
                      {mention.context && (
                        <p className="text-sm text-black mt-1 line-clamp-2">
                          {mention.context}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-black">
                        <span>{mention.platform}</span>
                        <span>•</span>
                        <span>{new Date(mention.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span className={getSentimentTextColor(mention.sentiment || 'neutral')}>
                          {mention.sentiment || 'neutral'}
                        </span>
                        {query && (
                          <>
                            <span>•</span>
                            <span>{query.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/dashboard/responses">
              <Button variant="outline">View All Mentions</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover run-analysis">
          <CardHeader>
            <CardTitle className="text-lg text-black">Run Analysis</CardTitle>
            <CardDescription className="text-black">
              Execute queries to get the latest brand mentions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/queries">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Run New Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg text-black">Competitor Report</CardTitle>
            <CardDescription className="text-black">
              See how you stack up against the competition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/competitors">
              <Button variant="outline" className="w-full">
                View Competitor Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}