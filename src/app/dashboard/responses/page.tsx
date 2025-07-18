import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { db } from '@/lib/db';
import { brandMentions, queryExecutions, queries, projects } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, MessageSquare, Calendar, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default async function ResponsesPage({
  searchParams
}: {
  searchParams: { executionId?: string }
}) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  const organizations = await getUserOrganizations(session.user.id);
  const currentOrg = organizations[0];
  const currentProject = currentOrg?.projects?.[0];

  if (!currentProject) {
    redirect('/onboarding');
  }

  const executionId = searchParams?.executionId;

  // Build where clause
  let whereClause = eq(brandMentions.projectId, currentProject.id);
  if (executionId) {
    whereClause = and(
      eq(brandMentions.projectId, currentProject.id),
      eq(brandMentions.queryExecutionId, executionId)
    );
  }

  // Get brand mentions with execution details
  const mentions = await db
    .select({
      mention: brandMentions,
      execution: queryExecutions,
      query: queries,
    })
    .from(brandMentions)
    .leftJoin(queryExecutions, eq(brandMentions.queryExecutionId, queryExecutions.id))
    .leftJoin(queries, eq(queryExecutions.queryId, queries.id))
    .where(whereClause)
    .orderBy(desc(brandMentions.createdAt))
    .limit(50);

  // Calculate sentiment stats
  const sentimentStats = {
    positive: mentions.filter(m => m.mention.sentiment === 'positive').length,
    neutral: mentions.filter(m => m.mention.sentiment === 'neutral').length,
    negative: mentions.filter(m => m.mention.sentiment === 'negative').length,
    total: mentions.length,
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100';
      case 'negative':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-black">Brand Mentions</h1>
        <p className="text-black">
          {executionId 
            ? 'Mentions from selected query execution'
            : 'All brand mentions across AI platforms'
          }
        </p>
      </div>

      {/* Sentiment Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{sentimentStats.total}</div>
            <p className="text-xs text-black">Found in queries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Positive</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{sentimentStats.positive}</div>
            <p className="text-xs text-black">
              {sentimentStats.total > 0 
                ? `${Math.round((sentimentStats.positive / sentimentStats.total) * 100)}%`
                : '0%'
              } of mentions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Neutral</CardTitle>
            <Minus className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{sentimentStats.neutral}</div>
            <p className="text-xs text-black">
              {sentimentStats.total > 0 
                ? `${Math.round((sentimentStats.neutral / sentimentStats.total) * 100)}%`
                : '0%'
              } of mentions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Negative</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{sentimentStats.negative}</div>
            <p className="text-xs text-black">
              {sentimentStats.total > 0 
                ? `${Math.round((sentimentStats.negative / sentimentStats.total) * 100)}%`
                : '0%'
              } of mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mentions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black">Recent Mentions</CardTitle>
              <CardDescription className="text-black">
                How your brand appears in AI responses
              </CardDescription>
            </div>
            {executionId && (
              <Link href="/dashboard/responses">
                <Button variant="outline" size="sm">
                  View All Mentions
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mentions.length === 0 ? (
            <div className="text-center py-8 text-black">
              <p className="text-sm mb-4">No mentions found yet</p>
              <Link href="/dashboard/queries">
                <Button variant="outline">
                  Run Your First Query
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {mentions.map(({ mention, execution, query }) => (
                <div key={mention.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-full ${getSentimentColor(mention.sentiment)} flex items-center justify-center flex-shrink-0`}>
                        {getSentimentIcon(mention.sentiment)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-black line-clamp-2">
                              {mention.content}
                            </h4>
                            {mention.context && (
                              <p className="text-sm text-black mt-2 line-clamp-3">
                                {mention.context}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={
                              mention.sentiment === 'positive' ? 'default' :
                              mention.sentiment === 'negative' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {mention.sentiment}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-black">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {mention.platform}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(mention.createdAt).toLocaleDateString()}
                          </span>
                          {query && (
                            <>
                              <span>•</span>
                              <span className="text-muted-foreground">
                                Query: {query.name}
                              </span>
                            </>
                          )}
                        </div>

                        {mention.metadata && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {mention.metadata.competitors?.map((competitor: string) => (
                              <Badge key={competitor} variant="outline" className="text-xs">
                                vs {competitor}
                              </Badge>
                            ))}
                            {mention.metadata.features?.map((feature: string) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}