import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { projects, competitors, organizationMembers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyInfo, personalInfo, analysisResult } = await request.json();

    // Get user's organization
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, session.user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Extract domain from website
    const domain = new URL(companyInfo.website).hostname.replace('www.', '');

    // Create the first project
    const [project] = await db
      .insert(projects)
      .values({
        organizationId: membership.organizationId,
        name: `${companyInfo.name} Brand Monitoring`,
        brandName: companyInfo.name,
        brandDomain: domain,
        category: analysisResult.industry,
        description: analysisResult.description,
        isActive: true,
      })
      .returning();

    // Add suggested competitors
    if (analysisResult.competitors && analysisResult.competitors.length > 0) {
      const competitorData = analysisResult.competitors.slice(0, 5).map((name: string) => ({
        projectId: project.id,
        name,
        description: `Competitor in the ${analysisResult.industry} space`,
      }));

      await db.insert(competitors).values(competitorData);
    }

    // Create initial queries for the brand
    const { queries: queriesTable } = await import('@/lib/db/schema');
    const initialQueries = [
      {
        projectId: project.id,
        name: `Best ${analysisResult.industry} tools`,
        query: `What are the best ${analysisResult.industry} tools and platforms? Include ${companyInfo.name}`,
        category: 'general',
        isActive: true,
      },
      {
        projectId: project.id,
        name: `${companyInfo.name} alternatives`,
        query: `What are the best alternatives to ${companyInfo.name}? How do they compare?`,
        category: 'alternative',
        isActive: true,
      },
      {
        projectId: project.id,
        name: `${companyInfo.name} features`,
        query: `What are the key features and capabilities of ${companyInfo.name}? What makes it unique?`,
        category: 'feature',
        isActive: true,
      },
    ];

    await db.insert(queriesTable).values(initialQueries);

    // Update user profile with personal info
    await db
      .update(users)
      .set({
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Store additional metadata (in a real app, you might have a user_profiles table)
    // For now, we'll just log it
    console.log('Onboarding completed for user:', {
      userId: session.user.id,
      personalInfo,
      analysisResult,
    });

    // Run initial queries in the background
    import('@/lib/initial-queries').then(({ runInitialQueries }) => {
      runInitialQueries(project.id).catch(error => {
        console.error('Failed to run initial queries:', error);
      });
    });

    return NextResponse.json({ 
      success: true,
      projectId: project.id,
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}