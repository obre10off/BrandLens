import { pgTable, text, timestamp, varchar, integer, boolean, uuid, decimal, jsonb, primaryKey, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (for Better Auth integration)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table (for Better Auth)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
}, (table) => ({
  userIdIdx: index('session_user_id_idx').on(table.userId),
}));

// Accounts table (for Better Auth OAuth)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('account_user_id_idx').on(table.userId),
  providerUserIdx: unique('account_provider_user_idx').on(table.providerId, table.userId),
}));

// Verification table (for Better Auth email verification)
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  identifierIdx: index('verification_identifier_idx').on(table.identifier),
}));

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  ownerIdIdx: index('org_owner_idx').on(table.ownerId),
}));

// Organization members
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('member'), // owner, admin, member
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  uniqueMember: unique('unique_org_member').on(table.organizationId, table.userId),
  orgIdx: index('member_org_idx').on(table.organizationId),
  userIdx: index('member_user_idx').on(table.userId),
}));

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  brandName: varchar('brand_name', { length: 255 }).notNull(),
  brandDomain: varchar('brand_domain', { length: 255 }),
  category: varchar('category', { length: 100 }), // SaaS category
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('project_org_idx').on(table.organizationId),
  activeIdx: index('project_active_idx').on(table.isActive),
}));

// Competitors table
export const competitors = pgTable('competitors', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('competitor_project_idx').on(table.projectId),
}));

// Query templates
export const queryTemplates = pgTable('query_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  category: varchar('category', { length: 100 }).notNull(), // general, use-case, feature, alternative, integration
  template: text('template').notNull(),
  variables: jsonb('variables').$type<string[]>(), // ['{category}', '{use_case}', etc]
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('query_template_category_idx').on(table.category),
  activeIdx: index('query_template_active_idx').on(table.isActive),
}));

// Queries (for the new query execution system)
export const queries = pgTable('queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  query: text('query').notNull(),
  category: varchar('category', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('query_project_idx').on(table.projectId),
  activeIdx: index('query_active_idx').on(table.isActive),
}));

// Query executions
export const queryExecutions = pgTable('query_executions', {
  id: uuid('id').defaultRandom().primaryKey(),
  queryId: uuid('query_id').references(() => queries.id).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // running, completed, failed
  provider: varchar('provider', { length: 50 }).notNull(), // openai, anthropic, etc
  results: jsonb('results'),
  resultCount: integer('result_count'),
  error: text('error'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  queryIdx: index('execution_query_idx').on(table.queryId),
  statusIdx: index('execution_status_idx').on(table.status),
  createdAtIdx: index('execution_created_idx').on(table.createdAt),
}));

// Project queries (instances of templates for specific projects)
export const projectQueries = pgTable('project_queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  templateId: uuid('template_id').references(() => queryTemplates.id),
  query: text('query').notNull(), // The actual query with variables filled
  isActive: boolean('is_active').default(true),
  customQuery: boolean('custom_query').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('project_query_project_idx').on(table.projectId),
  activeIdx: index('project_query_active_idx').on(table.isActive),
}));

// Brand mentions
export const brandMentions = pgTable('brand_mentions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  queryExecutionId: uuid('query_execution_id').references(() => queryExecutions.id),
  platform: varchar('platform', { length: 50 }).notNull(), // openai, anthropic, etc
  content: text('content').notNull(), // The mention content
  sentiment: varchar('sentiment', { length: 20 }), // positive, neutral, negative
  sentimentScore: decimal('sentiment_score', { precision: 3, scale: 2 }), // -1.00 to 1.00
  context: text('context'), // Additional context
  metadata: jsonb('metadata'), // Additional structured data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('mention_project_idx').on(table.projectId),
  executionIdx: index('mention_execution_idx').on(table.queryExecutionId),
  sentimentIdx: index('mention_sentiment_idx').on(table.sentiment),
  createdAtIdx: index('mention_created_idx').on(table.createdAt),
}));

// LLM responses (raw responses for reference)
export const llmResponses = pgTable('llm_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  queryId: uuid('query_id').references(() => projectQueries.id).notNull(),
  llmModel: varchar('llm_model', { length: 100 }).notNull(),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  metadata: jsonb('metadata'), // Token usage, response time, etc
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('response_project_idx').on(table.projectId),
  queryIdx: index('response_query_idx').on(table.queryId),
}));

// Subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull(), // starter, growth, scale
  status: varchar('status', { length: 50 }).notNull(), // active, canceled, past_due, etc
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('subscription_org_idx').on(table.organizationId),
  statusIdx: index('subscription_status_idx').on(table.status),
}));

// Usage tracking
export const usageTracking = pgTable('usage_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  period: varchar('period', { length: 7 }).notNull(), // YYYY-MM format
  queriesUsed: integer('queries_used').default(0),
  competitorsTracked: integer('competitors_tracked').default(0),
  projectCount: integer('project_count').default(0),
  responsesGenerated: integer('responses_generated').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniquePeriod: unique('unique_org_period').on(table.organizationId, table.period),
  orgIdx: index('usage_org_idx').on(table.organizationId),
}));

// Trials
export const trials = pgTable('trials', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull(), // active, expired, converted
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date').notNull(),
  queriesUsed: integer('queries_used').default(0),
  queriesLimit: integer('queries_limit').default(25),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('trial_org_idx').on(table.organizationId),
  statusIdx: index('trial_status_idx').on(table.status),
}));

// Email queue
export const emailQueue = pgTable('email_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  emailType: varchar('email_type', { length: 50 }).notNull(), // weekly-report, trial-ending, welcome
  subject: text('subject').notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  metadata: jsonb('metadata'),
  status: varchar('status', { length: 50 }).default('pending'), // pending, sent, failed
  scheduledFor: timestamp('scheduled_for').defaultNow(),
  sentAt: timestamp('sent_at'),
  attempts: integer('attempts').default(0),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('email_status_idx').on(table.status),
  scheduledIdx: index('email_scheduled_idx').on(table.scheduledFor),
}));

// API keys (for future API access)
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('api_key_org_idx').on(table.organizationId),
  keyIdx: index('api_key_idx').on(table.key),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  ownedOrganizations: many(organizations),
  memberships: many(organizationMembers),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
  members: many(organizationMembers),
  projects: many(projects),
  subscription: one(subscriptions),
  trial: one(trials),
  usage: many(usageTracking),
  apiKeys: many(apiKeys),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  competitors: many(competitors),
  queries: many(queries),
  projectQueries: many(projectQueries),
  mentions: many(brandMentions),
  llmResponses: many(llmResponses),
}));

export const competitorsRelations = relations(competitors, ({ one }) => ({
  project: one(projects, {
    fields: [competitors.projectId],
    references: [projects.id],
  }),
}));

export const projectQueriesRelations = relations(projectQueries, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectQueries.projectId],
    references: [projects.id],
  }),
  template: one(queryTemplates, {
    fields: [projectQueries.templateId],
    references: [queryTemplates.id],
  }),
  mentions: many(brandMentions),
  llmResponses: many(llmResponses),
}));

export const queriesRelations = relations(queries, ({ one, many }) => ({
  project: one(projects, {
    fields: [queries.projectId],
    references: [projects.id],
  }),
  executions: many(queryExecutions),
}));

export const queryExecutionsRelations = relations(queryExecutions, ({ one, many }) => ({
  query: one(queries, {
    fields: [queryExecutions.queryId],
    references: [queries.id],
  }),
  mentions: many(brandMentions),
}));

export const brandMentionsRelations = relations(brandMentions, ({ one }) => ({
  project: one(projects, {
    fields: [brandMentions.projectId],
    references: [projects.id],
  }),
  execution: one(queryExecutions, {
    fields: [brandMentions.queryExecutionId],
    references: [queryExecutions.id],
  }),
}));