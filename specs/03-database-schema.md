# BrandLens Database Schema

## Overview
Using PostgreSQL (Neon) with Drizzle ORM for type-safe database operations. Schema designed for multi-tenancy, efficient time-series queries, and scalability.

## Core Tables

### users
```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey(), // From Better Auth
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### organizations
```typescript
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  domain: text('domain').notNull().unique(),
  brandName: text('brand_name').notNull(), // Auto-detected or user-defined
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### organization_members
```typescript
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  userId: text('user_id').references(() => users.id),
  role: text('role').notNull().default('member'), // owner, admin, member
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### projects
```typescript
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### competitors
```typescript
export const competitors = pgTable('competitors', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id),
  name: text('name').notNull(),
  domain: text('domain'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### queries
```typescript
export const queries = pgTable('queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  category: text('category').notNull(), // 'crm', 'project-management', etc
  template: text('template').notNull(), // "best {category} software for {use_case}"
  variables: jsonb('variables'), // { category: 'CRM', use_case: 'startups' }
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### project_queries
```typescript
export const projectQueries = pgTable('project_queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id),
  queryId: uuid('query_id').references(() => queries.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### llm_responses
```typescript
export const llmResponses = pgTable('llm_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id),
  queryId: uuid('query_id').references(() => queries.id),
  model: text('model').notNull(), // 'gpt-4', 'claude-3', etc
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  responseMetadata: jsonb('response_metadata'), // tokens, latency, etc
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Index for time-series queries
export const llmResponsesCreatedAtIdx = index('llm_responses_created_at_idx')
  .on(llmResponses.createdAt);
```

### brand_mentions
```typescript
export const brandMentions = pgTable('brand_mentions', {
  id: uuid('id').defaultRandom().primaryKey(),
  responseId: uuid('response_id').references(() => llmResponses.id),
  brandName: text('brand_name').notNull(), // Could be org brand or competitor
  mentionType: text('mention_type').notNull(), // 'direct', 'indirect', 'feature'
  sentiment: text('sentiment'), // 'positive', 'neutral', 'negative'
  context: text('context'), // Surrounding text
  position: integer('position'), // Position in response (for ranking)
  confidence: real('confidence'), // 0-1 confidence score
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Composite index for efficient queries
export const brandMentionsIdx = index('brand_mentions_brand_created_idx')
  .on(brandMentions.brandName, brandMentions.createdAt);
```

### subscriptions
```typescript
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: text('status').notNull(), // 'active', 'canceled', 'past_due'
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### usage_tracking
```typescript
export const usageTracking = pgTable('usage_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  period: text('period').notNull(), // 'YYYY-MM'
  queriesUsed: integer('queries_used').default(0),
  competitorsTracked: integer('competitors_tracked').default(0),
  emailsSent: integer('emails_sent').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Unique constraint for org + period
export const usageTrackingUnique = uniqueIndex('usage_tracking_org_period_idx')
  .on(usageTracking.organizationId, usageTracking.period);
```

## Relationships

```typescript
// Drizzle Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  subscription: one(subscriptions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  competitors: many(competitors),
  queries: many(projectQueries),
  responses: many(llmResponses),
}));

export const llmResponsesRelations = relations(llmResponses, ({ one, many }) => ({
  project: one(projects, {
    fields: [llmResponses.projectId],
    references: [projects.id],
  }),
  mentions: many(brandMentions),
}));
```

## Migration Strategy

### Initial Migration
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables with proper constraints
-- Add indexes for performance
-- Set up foreign key relationships
```

### Data Seeding
```typescript
// Seed 50 pre-built queries
const seedQueries = [
  {
    category: 'crm',
    template: 'best CRM software for {industry}',
    variables: { industries: ['startups', 'sales teams', 'small business'] }
  },
  // ... more queries
];
```

## Performance Optimizations

### Indexes
- Time-based queries on `created_at` columns
- Brand name lookups for mention analysis
- Organization + period for usage tracking
- Response ID for mention aggregation

### Partitioning (Future)
- Partition `llm_responses` by month for better query performance
- Archive old data to cold storage after 90 days

### Query Patterns
```typescript
// Efficient mention counting
const mentionCounts = await db
  .select({
    brandName: brandMentions.brandName,
    count: count(),
  })
  .from(brandMentions)
  .where(
    and(
      eq(brandMentions.projectId, projectId),
      gte(brandMentions.createdAt, thirtyDaysAgo)
    )
  )
  .groupBy(brandMentions.brandName);

// Time-series data for charts
const timeSeriesData = await db
  .select({
    date: sql<string>`DATE(${brandMentions.createdAt})`,
    count: count(),
  })
  .from(brandMentions)
  .where(/* conditions */)
  .groupBy(sql`DATE(${brandMentions.createdAt})`);
```

## Data Retention

### Policy
- Raw responses: 90 days
- Aggregated metrics: Indefinite
- User data: Until account deletion
- Archived data: S3 cold storage

### Implementation
```typescript
// Scheduled job to clean old data
async function cleanOldData() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  await db
    .delete(llmResponses)
    .where(lt(llmResponses.createdAt, ninetyDaysAgo));
}
```