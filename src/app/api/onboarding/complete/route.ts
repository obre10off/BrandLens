import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import {
  projects,
  competitors,
  organizationMembers,
  users,
} from '@/lib/db/schema';
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
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }

    // Extract domain from website with error handling
    let domain: string;
    try {
      domain = new URL(companyInfo.website).hostname.replace('www.', '');
    } catch (error) {
      console.error('Failed to parse website URL:', error);
      // Extract domain manually if URL parsing fails
      domain = companyInfo.website
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .split('?')[0]
        .toLowerCase();
    }

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

    // Add suggested competitors with error handling
    if (
      analysisResult?.competitors &&
      Array.isArray(analysisResult.competitors) &&
      analysisResult.competitors.length > 0
    ) {
      try {
        const competitorData = analysisResult.competitors
          .slice(0, 5)
          .filter(
            (name: any) =>
              name && typeof name === 'string' && name.trim().length > 0
          )
          .map((name: string) => ({
            projectId: project.id,
            name: name.trim(),
            description: `Competitor in the ${analysisResult.industry || 'business'} space`,
          }));

        if (competitorData.length > 0) {
          await db.insert(competitors).values(competitorData);
        }
      } catch (error) {
        console.error('Failed to insert competitors:', error);
        // Continue with onboarding even if competitors fail to insert
      }
    }

    // Create initial queries for the brand with error handling
    try {
      const { queries: queriesTable } = await import('@/lib/db/schema');
      const industry = analysisResult?.industry || 'business';
      const brandName = companyInfo.name;

      const initialQueries = [
        {
          projectId: project.id,
          name: `Best ${industry} tools`,
          query: `What are the best ${industry} tools and platforms? Include ${brandName} in your comparison.`,
          category: 'general',
          isActive: true,
        },
        {
          projectId: project.id,
          name: `${brandName} alternatives`,
          query: `What are the best alternatives to ${brandName}? How do they compare in features and pricing?`,
          category: 'alternative',
          isActive: true,
        },
        {
          projectId: project.id,
          name: `${brandName} features`,
          query: `What are the key features and capabilities of ${brandName}? What makes it unique in the market?`,
          category: 'feature',
          isActive: true,
        },
      ];

      await db.insert(queriesTable).values(initialQueries);
    } catch (error) {
      console.error('Failed to create initial queries:', error);
      // Continue with onboarding even if initial queries fail to create
    }

    // Update user profile with personal info
    try {
      await db
        .update(users)
        .set({
          name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));
    } catch (error) {
      console.error('Failed to update user profile:', error);
      // Continue with onboarding even if user profile update fails
    }

    // Store additional metadata (in a real app, you might have a user_profiles table)
    // For now, we'll just log it
    console.log('Onboarding completed for user:', {
      userId: session.user.id,
      personalInfo,
      analysisResult,
    });

    // Run initial queries in the background (non-blocking)
    try {
      import('@/lib/initial-queries').then(({ runInitialQueries }) => {
        runInitialQueries(project.id).catch(error => {
          console.error('Failed to run initial queries:', error);
          // Don't fail the onboarding if initial queries fail
        });
      });
    } catch (error) {
      console.warn('Could not start initial queries:', error);
      // Continue with successful onboarding even if queries can't start
    }

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
