import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { db } from '@/lib/db';
import { competitors, projects, brandMentions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CompetitorForm from '@/components/dashboard/competitor-form';

export default async function CompetitorsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const organizations = await getUserOrganizations(session.user.id);
  const currentOrg = organizations[0];

  if (!currentOrg || currentOrg.projectCount === 0) {
    redirect('/onboarding');
  }

  const [currentProject] = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, currentOrg.id))
    .limit(1);

  if (!currentProject) {
    redirect('/onboarding');
  }

  // Get competitors with their mention counts
  const competitorsWithStats = await db
    .select({
      competitor: competitors,
      mentionCount: sql<number>`count(distinct ${brandMentions.id})`,
      positiveMentions: sql<number>`count(distinct case when ${brandMentions.sentiment} = 'positive' then ${brandMentions.id} end)`,
      negativeMentions: sql<number>`count(distinct case when ${brandMentions.sentiment} = 'negative' then ${brandMentions.id} end)`,
    })
    .from(competitors)
    .leftJoin(
      brandMentions,
      and(
        eq(brandMentions.projectId, competitors.projectId),
        sql`${brandMentions.content} ILIKE '%' || ${competitors.name} || '%'`
      )
    )
    .where(eq(competitors.projectId, currentProject.id))
    .groupBy(competitors.id);

  // Check plan limits
  const competitorLimit =
    currentOrg.trial?.status === 'active'
      ? 3
      : currentOrg.subscription?.plan === 'starter'
        ? 5
        : currentOrg.subscription?.plan === 'growth'
          ? 15
          : -1; // unlimited for scale

  const canAddMore =
    competitorLimit === -1 || competitorsWithStats.length < competitorLimit;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Competitor Analysis</h1>
          <p className="text-black mt-2">
            Track and compare your brand against competitors
          </p>
        </div>
        <CompetitorForm
          projectId={currentProject.id}
          disabled={!canAddMore}
          limit={competitorLimit}
          currentCount={competitorsWithStats.length}
        />
      </div>

      {/* Plan Limit Alert */}
      {!canAddMore && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-black">
              Competitor Limit Reached
            </CardTitle>
            <CardDescription className="text-black">
              You&apos;ve reached the maximum of {competitorLimit} competitors
              for your current plan. Upgrade to track more competitors.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Competitors Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {competitorsWithStats.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="text-center py-12">
              <p className="text-black mb-4">No competitors added yet</p>
              <p className="text-sm text-black">
                Add competitors to track how your brand compares in AI
                conversations
              </p>
            </CardContent>
          </Card>
        ) : (
          competitorsWithStats.map(
            ({
              competitor,
              mentionCount,
              positiveMentions,
              negativeMentions,
            }) => {
              const sentimentScore =
                mentionCount > 0
                  ? Math.round((positiveMentions / mentionCount) * 100)
                  : 0;

              return (
                <Card key={competitor.id} className="card-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-black">
                          {competitor.name}
                        </CardTitle>
                        {competitor.domain && (
                          <CardDescription className="text-black">
                            <a
                              href={`https://${competitor.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {competitor.domain}
                            </a>
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {competitor.description && (
                        <p className="text-sm text-black">
                          {competitor.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-black">
                            Total Mentions
                          </p>
                          <p className="text-2xl font-bold text-black">
                            {mentionCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            Sentiment
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-black">
                              {sentimentScore}%
                            </p>
                            {mentionCount > 0 &&
                              (sentimentScore >= 70 ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : sentimentScore <= 30 ? (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              ) : (
                                <BarChart3 className="h-5 w-5 text-gray-600" />
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {positiveMentions} positive
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {negativeMentions} negative
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )
        )}
      </div>

      {/* Comparison Summary */}
      {competitorsWithStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Brand vs Competitors</CardTitle>
            <CardDescription className="text-black">
              How your brand compares in AI conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-black">
              Detailed comparison visualization coming soon...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
