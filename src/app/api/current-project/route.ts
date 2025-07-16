import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizations = await getUserOrganizations(session.user.id);
    const currentOrg = organizations[0];

    if (!currentOrg || currentOrg.projectCount === 0) {
      return NextResponse.json({ error: 'No projects found' }, { status: 404 });
    }

    // Get the first project
    const [currentProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, currentOrg.id))
      .limit(1);

    if (!currentProject) {
      return NextResponse.json({ error: 'No project found' }, { status: 404 });
    }

    // Determine queries limit based on subscription status
    let queriesLimit = 0;
    let queriesUsed = 0;
    
    if (currentOrg.trial?.status === 'active') {
      queriesLimit = currentOrg.trial.queriesLimit || 25;
      queriesUsed = currentOrg.trial.queriesUsed || 0;
    } else if (currentOrg.subscription) {
      // Based on subscription plan
      switch (currentOrg.subscription.plan) {
        case 'starter':
          queriesLimit = 100; // Starter plan limit
          break;
        case 'growth':
          queriesLimit = 500; // Growth plan limit
          break;
        case 'scale':
          queriesLimit = -1; // Unlimited
          break;
      }
      queriesUsed = currentOrg.subscription.queriesUsed || 0;
    }

    return NextResponse.json({
      name: currentProject.name,
      brandName: currentProject.brandName,
      queriesUsed,
      queriesLimit,
      hasTrial: currentOrg.trial?.status === 'active',
      hasSubscription: !!currentOrg.subscription,
      subscriptionPlan: currentOrg.subscription?.plan,
    });
  } catch (error) {
    console.error('Failed to fetch current project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}