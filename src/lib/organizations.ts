import { db } from './db';
import {
  organizations,
  organizationMembers,
  subscriptions,
  trials,
  projects,
  users,
} from './db/schema';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import { logger } from './logger';

export async function createDefaultOrganization(
  userId: string,
  userEmail: string
) {
  try {
    // Extract organization name from email domain
    const domain = userEmail.split('@')[1];
    const orgName = domain ? domain.split('.')[0] : 'My Organization';

    // Create organization
    const [org] = await db
      .insert(organizations)
      .values({
        name: orgName.charAt(0).toUpperCase() + orgName.slice(1),
        domain,
        ownerId: userId,
      })
      .returning();

    // Add owner as member
    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId,
      role: 'owner',
    });

    // Start trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    await db
      .insert(trials)
      .values({
        organizationId: org.id,
        status: 'active' as const,
        endDate: trialEndDate,
        queriesLimit: 25,
        queriesUsed: 0,
      })
      .returning();

    return org;
  } catch (error) {
    logger.error(
      'Failed to create default organization',
      { userId, userEmail },
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

export async function getUserOrganizations(userId: string) {
  // Get all organization memberships for the user with related data
  const memberships = await db
    .select({
      // Organization data
      id: organizations.id,
      name: organizations.name,
      domain: organizations.domain,
      ownerId: organizations.ownerId,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      // Membership data
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      // Trial data
      trial: {
        id: trials.id,
        status: trials.status,
        startDate: trials.startDate,
        endDate: trials.endDate,
        queriesUsed: trials.queriesUsed,
        queriesLimit: trials.queriesLimit,
      },
      // Subscription data
      subscription: {
        id: subscriptions.id,
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      },
    })
    .from(organizationMembers)
    .leftJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id)
    )
    .leftJoin(trials, eq(organizations.id, trials.organizationId))
    .leftJoin(subscriptions, eq(organizations.id, subscriptions.organizationId))
    .where(eq(organizationMembers.userId, userId));

  // Get project counts for each organization
  const orgIds = memberships.map(m => m.id).filter(Boolean) as string[];
  const projectCounts =
    orgIds.length > 0
      ? await db
          .select({
            organizationId: projects.organizationId,
            count: sql<number>`count(${projects.id})`.as('count'),
          })
          .from(projects)
          .where(
            and(
              eq(projects.isActive, true),
              inArray(projects.organizationId, orgIds)
            )
          )
          .groupBy(projects.organizationId)
      : [];

  const projectCountMap = new Map(
    projectCounts.map(pc => [pc.organizationId, pc.count])
  );

  // Get projects for each organization
  const orgProjects =
    orgIds.length > 0
      ? await db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.isActive, true),
              inArray(projects.organizationId, orgIds)
            )
          )
      : [];

  const projectMap = new Map<string, typeof orgProjects>();
  orgProjects.forEach(project => {
    const orgId = project.organizationId;
    if (!projectMap.has(orgId)) {
      projectMap.set(orgId, []);
    }
    projectMap.get(orgId)!.push(project);
  });

  return memberships.map(membership => ({
    id: membership.id!,
    name: membership.name!,
    domain: membership.domain,
    ownerId: membership.ownerId!,
    createdAt: membership.createdAt!,
    updatedAt: membership.updatedAt!,
    role: membership.role,
    joinedAt: membership.joinedAt,
    trial: membership.trial?.id ? membership.trial : null,
    subscription: membership.subscription?.id ? membership.subscription : null,
    projects: projectMap.get(membership.id!) || [],
    projectCount: projectCountMap.get(membership.id!) || 0,
  }));
}

export async function getOrganization(orgId: string, userId: string) {
  // Check if user has access
  const [member] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1);

  if (!member) {
    throw new Error('Access denied');
  }

  // Get organization with all related data
  const [org] = await db
    .select()
    .from(organizations)
    .leftJoin(trials, eq(organizations.id, trials.organizationId))
    .leftJoin(subscriptions, eq(organizations.id, subscriptions.organizationId))
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw new Error('Organization not found');
  }

  // Get members
  const members = await db
    .select({
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
      },
    })
    .from(organizationMembers)
    .leftJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, orgId));

  // Get projects
  const orgProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, orgId));

  return {
    ...org.organizations,
    trial: org.trials,
    subscription: org.subscriptions,
    members,
    projects: orgProjects,
  };
}

export async function updateOrganization(
  orgId: string,
  userId: string,
  data: Partial<{
    name: string;
    domain: string;
  }>
) {
  // Check if user is owner or admin
  const [member] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId),
        or(
          eq(organizationMembers.role, 'owner'),
          eq(organizationMembers.role, 'admin')
        )
      )
    )
    .limit(1);

  if (!member) {
    throw new Error('Permission denied');
  }

  const [updated] = await db
    .update(organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId))
    .returning();

  return updated;
}

export async function inviteToOrganization(
  orgId: string,
  inviterId: string,
  inviteeEmail: string,
  role: 'admin' | 'member' = 'member'
) {
  // Check if inviter has permission
  const [inviter] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, inviterId),
        or(
          eq(organizationMembers.role, 'owner'),
          eq(organizationMembers.role, 'admin')
        )
      )
    )
    .limit(1);

  if (!inviter) {
    throw new Error('Permission denied');
  }

  // Check if user exists
  const [invitee] = await db
    .select()
    .from(users)
    .where(eq(users.email, inviteeEmail))
    .limit(1);

  if (!invitee) {
    // TODO: Send invitation email
    throw new Error('User not found. Invitation system not yet implemented.');
  }

  // Check if already a member
  const [existingMember] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, invitee.id)
      )
    )
    .limit(1);

  if (existingMember) {
    throw new Error('User is already a member');
  }

  // Add to organization
  await db.insert(organizationMembers).values({
    organizationId: orgId,
    userId: invitee.id,
    role,
  });

  return { success: true };
}

export async function removeFromOrganization(
  orgId: string,
  removerId: string,
  userIdToRemove: string
) {
  // Check if remover has permission
  const [remover] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, removerId),
        or(
          eq(organizationMembers.role, 'owner'),
          eq(organizationMembers.role, 'admin')
        )
      )
    )
    .limit(1);

  if (!remover) {
    throw new Error('Permission denied');
  }

  // Can't remove the owner
  const [memberToRemove] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userIdToRemove)
      )
    )
    .limit(1);

  if (memberToRemove?.role === 'owner') {
    throw new Error('Cannot remove organization owner');
  }

  // Remove member
  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userIdToRemove)
      )
    );

  return { success: true };
}

export async function checkOrganizationLimits(orgId: string) {
  const [org] = await db
    .select({
      id: organizations.id,
      trial: trials,
      subscription: subscriptions,
    })
    .from(organizations)
    .leftJoin(trials, eq(organizations.id, trials.organizationId))
    .leftJoin(subscriptions, eq(organizations.id, subscriptions.organizationId))
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw new Error('Organization not found');
  }

  // Count active projects
  const [projectCount] = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(projects)
    .where(
      and(eq(projects.organizationId, orgId), eq(projects.isActive, true))
    );

  // Check if on trial
  if (org.trial && org.trial.status === 'active') {
    const now = new Date();
    if (now > org.trial.endDate) {
      // Trial expired
      await db
        .update(trials)
        .set({ status: 'expired' })
        .where(eq(trials.organizationId, orgId));

      return {
        hasAccess: false,
        reason: 'trial_expired',
        limits: null,
      };
    }

    return {
      hasAccess: true,
      reason: 'trial',
      limits: {
        projects: 1,
        queries: org.trial.queriesLimit,
        competitors: 2,
        currentProjects: projectCount.count,
      },
    };
  }

  // Check subscription
  if (!org.subscription || org.subscription.status !== 'active') {
    return {
      hasAccess: false,
      reason: 'no_subscription',
      limits: null,
    };
  }

  // Get limits based on subscription tier
  const tierLimits = await getTierLimits(org.subscription.stripePriceId!);

  return {
    hasAccess: true,
    reason: 'subscription',
    limits: {
      ...tierLimits,
      currentProjects: projectCount.count,
    },
  };
}

async function getTierLimits(_stripePriceId: string) {
  // This would normally look up the tier from the pricing configuration
  // For now, returning default limits
  return {
    projects: 5,
    queries: 350,
    competitors: 10,
  };
}
