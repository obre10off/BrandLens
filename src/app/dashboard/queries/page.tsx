import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { db } from '@/lib/db';
import { queries, queryExecutions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { QueryRunner } from '@/components/dashboard/query-runner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function QueriesPage() {
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

  // Get recent query executions
  const recentExecutions = await db
    .select()
    .from(queryExecutions)
    .innerJoin(queries, eq(queryExecutions.queryId, queries.id))
    .where(eq(queries.projectId, currentProject.id))
    .orderBy(desc(queryExecutions.createdAt))
    .limit(10);

  // Get query statistics
  const executions = recentExecutions.map(row => ({
    ...row.query_executions,
    query: row.queries
  }));
  
  const stats = {
    totalQueries: executions.length,
    successRate: executions.length > 0 
      ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
      : 0,
    averageMentions: executions
      .filter(e => e.status === 'completed' && e.resultCount)
      .reduce((sum, e) => sum + (e.resultCount || 0), 0) / (executions.filter(e => e.status === 'completed').length || 1),
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-black">Brand Queries</h1>
        <p className="text-black">
          Run queries to discover how AI platforms mention your brand
        </p>
      </div>

      {/* Query Limits Alert */}
      {currentOrg?.trial?.status === 'active' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-black">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Trial Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-black">
              You have <strong>{currentOrg.trial.queriesLimit - (currentOrg.trial.queriesUsed || 0)}</strong> queries 
              remaining in your trial. 
              <Link href="/dashboard/billing" className="ml-1 text-primary hover:underline">
                Upgrade to continue
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Queries Run</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.totalQueries}</div>
            <p className="text-xs text-black">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.successRate}%</div>
            <p className="text-xs text-black">Query completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Avg. Mentions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.averageMentions.toFixed(1)}</div>
            <p className="text-xs text-black">Per query</p>
          </CardContent>
        </Card>
      </div>

      {/* Query Runner */}
      <QueryRunner 
        projectId={currentProject.id} 
        onQueryComplete={() => {
          // This will trigger a page refresh to show new data
          window.location.reload();
        }}
      />

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Recent Query Executions</CardTitle>
          <CardDescription className="text-black">
            Your latest brand monitoring queries and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-8 text-black">
              <p className="text-sm mb-4">No queries run yet</p>
              <p className="text-xs">Use the query runner above to start monitoring your brand</p>
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <div key={execution.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{execution.query.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-black">
                      <span>{new Date(execution.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="capitalize">{execution.provider}</span>
                      {execution.status === 'completed' && execution.resultCount !== null && (
                        <>
                          <span>•</span>
                          <span>{execution.resultCount} mentions</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        execution.status === 'completed' ? 'default' : 
                        execution.status === 'failed' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {execution.status}
                    </Badge>
                    {execution.status === 'completed' && (
                      <Link href={`/dashboard/responses?executionId=${execution.id}`}>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </Link>
                    )}
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