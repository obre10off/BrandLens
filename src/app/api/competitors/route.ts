import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';
import { db } from '@/lib/db';
import { competitors, projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createCompetitorSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  domain: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createCompetitorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { projectId, name, domain, description } = validation.data;

    // Verify user has access to the project
    const organizations = await getUserOrganizations(session.user.id);
    const hasAccess = organizations.some(org =>
      org.projects?.some(p => p.id === projectId)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check competitor limits based on plan
    const org = organizations.find(o =>
      o.projects?.some(p => p.id === projectId)
    );
    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get current competitor count
    const existingCompetitors = await db
      .select()
      .from(competitors)
      .where(eq(competitors.projectId, projectId));

    let competitorLimit = 3; // default trial limit
    if (org.subscription?.status === 'active') {
      switch (org.subscription.plan) {
        case 'starter':
          competitorLimit = 5;
          break;
        case 'growth':
          competitorLimit = 15;
          break;
        case 'scale':
          competitorLimit = -1; // unlimited
          break;
      }
    }

    if (
      competitorLimit !== -1 &&
      existingCompetitors.length >= competitorLimit
    ) {
      return NextResponse.json(
        {
          error: `Competitor limit reached. Your plan allows ${competitorLimit} competitors.`,
        },
        { status: 403 }
      );
    }

    // Create the competitor
    const [newCompetitor] = await db
      .insert(competitors)
      .values({
        projectId,
        name,
        domain: domain || null,
        description: description || null,
      })
      .returning();

    return NextResponse.json(newCompetitor);
  } catch (error) {
    console.error('Error creating competitor:', error);
    return NextResponse.json(
      { error: 'Failed to create competitor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const competitorId = searchParams.get('id');

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID required' },
        { status: 400 }
      );
    }

    // Get the competitor to check project access
    const [competitor] = await db
      .select()
      .from(competitors)
      .where(eq(competitors.id, competitorId))
      .limit(1);

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Verify user has access to the project
    const organizations = await getUserOrganizations(session.user.id);
    const hasAccess = organizations.some(org =>
      org.projects?.some(p => p.id === competitor.projectId)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the competitor
    await db.delete(competitors).where(eq(competitors.id, competitorId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      { error: 'Failed to delete competitor' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, domain, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Competitor ID required' },
        { status: 400 }
      );
    }

    // Get the competitor to check project access
    const [competitor] = await db
      .select()
      .from(competitors)
      .where(eq(competitors.id, id))
      .limit(1);

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Verify user has access to the project
    const organizations = await getUserOrganizations(session.user.id);
    const hasAccess = organizations.some(org =>
      org.projects?.some(p => p.id === competitor.projectId)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the competitor
    const [updated] = await db
      .update(competitors)
      .set({
        name: name || competitor.name,
        domain: domain !== undefined ? domain : competitor.domain,
        description:
          description !== undefined ? description : competitor.description,
      })
      .where(eq(competitors.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating competitor:', error);
    return NextResponse.json(
      { error: 'Failed to update competitor' },
      { status: 500 }
    );
  }
}
