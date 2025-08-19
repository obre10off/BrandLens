// Subscription plan limits
export const planLimits = {
  trial: {
    queriesPerMonth: 25,
    competitors: 3,
    emailReports: 'weekly',
    apiAccess: false,
    customTemplates: false,
    prioritySupport: false,
  },
  starter: {
    queriesPerMonth: 100,
    competitors: 5,
    emailReports: 'weekly',
    apiAccess: false,
    customTemplates: false,
    prioritySupport: false,
  },
  growth: {
    queriesPerMonth: 500,
    competitors: 15,
    emailReports: 'daily',
    apiAccess: true,
    customTemplates: true,
    prioritySupport: true,
  },
  scale: {
    queriesPerMonth: -1, // Unlimited
    competitors: -1, // Unlimited
    emailReports: 'realtime',
    apiAccess: true,
    customTemplates: true,
    prioritySupport: true,
  },
} as const;

export type PlanType = keyof typeof planLimits;

/**
 * Check if a user has reached their query limit
 */
export async function checkQueryLimit(
  plan: PlanType,
  currentMonthQueries: number
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const limit = planLimits[plan].queriesPerMonth;

  // Unlimited queries for scale plan
  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  const allowed = currentMonthQueries < limit;
  const remaining = Math.max(0, limit - currentMonthQueries);

  return { allowed, limit, remaining };
}

/**
 * Check if a user can track a competitor
 */
export function checkCompetitorLimit(
  plan: PlanType,
  currentCompetitors: number
): boolean {
  const limit = planLimits[plan].competitors;

  // Unlimited competitors for scale plan
  if (limit === -1) {
    return true;
  }

  return currentCompetitors < limit;
}

/**
 * Get the billing period start date (first day of current month)
 */
export function getBillingPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get the billing period end date (last day of current month)
 */
export function getBillingPeriodEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}
