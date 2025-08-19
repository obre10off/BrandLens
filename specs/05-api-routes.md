# BrandLens API Routes

## Overview

RESTful API built with Next.js API Routes. All routes require authentication except public endpoints.

## Authentication

### Setup with Better Auth

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### Middleware

```typescript
// src/middleware.ts
export { authMiddleware } from 'better-auth/next-js';

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
```

## API Routes Structure

### Authentication Routes

```typescript
// Handled by Better Auth automatically
POST / api / auth / signup;
POST / api / auth / signin;
POST / api / auth / signout;
GET / api / auth / session;
POST / api / auth / forgot - password;
POST / api / auth / reset - password;
```

### Organization Routes

```typescript
// GET /api/organizations
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response('Unauthorized', { status: 401 });

  const orgs = await db.query.organizations.findMany({
    where: eq(organizations.userId, session.user.id),
  });

  return Response.json(orgs);
}

// POST /api/organizations
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { name, domain } = await request.json();

  // Auto-detect brand name from domain
  const brandName = await detectBrandName(domain);

  const org = await db
    .insert(organizations)
    .values({
      name,
      domain,
      brandName,
      ownerId: session.user.id,
    })
    .returning();

  return Response.json(org[0]);
}
```

### Project Routes

```typescript
// GET /api/projects
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId');

  const projects = await db.query.projects.findMany({
    where: eq(projects.organizationId, orgId),
    with: {
      competitors: true,
      queries: true,
    },
  });

  return Response.json(projects);
}

// POST /api/projects
export async function POST(request: Request) {
  const { organizationId, name, description } = await request.json();

  // Check user has access to org
  const hasAccess = await checkOrgAccess(session.user.id, organizationId);
  if (!hasAccess) return new Response('Forbidden', { status: 403 });

  const project = await db
    .insert(projects)
    .values({
      organizationId,
      name,
      description,
    })
    .returning();

  // Add default queries
  await addDefaultQueries(project[0].id);

  return Response.json(project[0]);
}

// PATCH /api/projects/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updates = await request.json();

  const project = await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, params.id))
    .returning();

  return Response.json(project[0]);
}
```

### Query Management Routes

```typescript
// GET /api/queries/available
// Returns all available pre-built queries
export async function GET() {
  const queries = await db.query.queries.findMany({
    where: eq(queries.isActive, true),
    orderBy: [queries.category, queries.template],
  });

  return Response.json(queries);
}

// POST /api/projects/[id]/queries
// Add queries to a project
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { queryIds } = await request.json();

  const projectQueries = await db
    .insert(projectQueries)
    .values(
      queryIds.map((queryId: string) => ({
        projectId: params.id,
        queryId,
      }))
    )
    .returning();

  return Response.json(projectQueries);
}
```

### Mention Tracking Routes

```typescript
// GET /api/projects/[id]/mentions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const brandName = searchParams.get('brand');

  const mentions = await db.query.brandMentions.findMany({
    where: and(
      eq(brandMentions.projectId, params.id),
      brandName ? eq(brandMentions.brandName, brandName) : undefined,
      gte(brandMentions.createdAt, daysAgo(days))
    ),
    with: {
      response: {
        with: {
          query: true,
        },
      },
    },
    orderBy: desc(brandMentions.createdAt),
  });

  return Response.json(mentions);
}

// POST /api/projects/[id]/scan
// Trigger a manual scan
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check rate limits
  const canScan = await checkScanRateLimit(params.id);
  if (!canScan) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Queue scan job
  await scanQueue.add('project-scan', {
    projectId: params.id,
    priority: 'manual',
  });

  return Response.json({ message: 'Scan queued successfully' });
}
```

### Analytics Routes

```typescript
// GET /api/projects/[id]/analytics
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';

  const [mentionStats, sentimentStats, competitorStats, trendData] =
    await Promise.all([
      getMentionStats(params.id, period),
      getSentimentBreakdown(params.id, period),
      getCompetitorComparison(params.id, period),
      getMentionTrends(params.id, period),
    ]);

  return Response.json({
    mentions: mentionStats,
    sentiment: sentimentStats,
    competitors: competitorStats,
    trends: trendData,
  });
}

// GET /api/projects/[id]/analytics/export
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await exportProjectData(params.id);

  return new Response(data, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="brandlens-export-${Date.now()}.csv"`,
    },
  });
}
```

### Subscription & Billing Routes

```typescript
// POST /api/create-checkout-session
export async function POST(request: Request) {
  const { priceId, organizationId } = await request.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    metadata: {
      organizationId,
      userId: session.user.id,
    },
  });

  return Response.json({ sessionId: session.id });
}

// POST /api/webhooks/stripe
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
  }

  return new Response(null, { status: 200 });
}

// GET /api/billing/portal
export async function GET(request: Request) {
  const org = await getCurrentOrg(session.user.id);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`,
  });

  return Response.json({ url: portalSession.url });
}
```

## Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  }),

  scan: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(1, '1 h'), // 1 scan per hour
  }),

  export: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10, '1 d'), // 10 exports per day
  }),
};

// Usage in API route
export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await rateLimiter.api.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // Handle request...
}
```

## Error Handling

```typescript
// src/lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// Global error handler
export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Response Formats

### Success Response

```json
{
  "data": {...},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Pagination

```typescript
// GET /api/mentions?page=1&limit=20
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '20');
const offset = (page - 1) * limit;

const items = await db.query.mentions.findMany({
  limit,
  offset,
});

const total = await db.select({ count: count() }).from(mentions);

return Response.json({
  data: items,
  meta: { page, limit, total: total[0].count },
});
```
