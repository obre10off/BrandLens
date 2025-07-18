# BrandLens Ship Fast Principles

## Core Philosophy

**Ship beats perfect. Every. Single. Time.**

Your competitors are overthinking. You're shipping. That's your advantage.

## Decision Framework

### The 80/20 Rule for Everything
```typescript
// ❌ DON'T: Build a perfect query builder UI
// ✅ DO: Hardcode 50 queries that cover 80% of use cases

// ❌ DON'T: ML-powered sentiment analysis
// ✅ DO: Keyword matching that's "good enough"

// ❌ DON'T: Real-time monitoring  
// ✅ DO: Weekly batch processing
```

### The "Can I Ship This Today?" Test
Before building any feature, ask:
1. Can I build a working version in <1 day?
2. Will it provide immediate value to users?
3. Can I iterate on it later?

If any answer is "no", simplify until all are "yes".

## What to Build vs Skip

### BUILD NOW (MVP)
```typescript
const mvpFeatures = {
  // Core value prop - can't skip
  mentionTracking: "This IS the product",
  basicDashboard: "Users need to see their data",
  emailReports: "Drives retention",
  billing: "Can't make money without it",
  
  // Trust builders
  authentication: "Users need to feel secure",
  basicOnboarding: "Reduce confusion",
  mobileView: "50% will check on phone",
};
```

### BUILD LATER
```typescript
const laterFeatures = {
  // Nice-to-haves
  customQueries: "50 presets are enough",
  slackIntegration: "Email works fine", 
  apiAccess: "Only if customers ask",
  teamFeatures: "Single user is simpler",
  
  // Premature optimization
  advancedFilters: "Basic search is enough",
  dataExportFormats: "CSV only",
  whiteLabeling: "Focus on your brand first",
};
```

### NEVER BUILD
```typescript
const neverBuild = {
  // Complexity traps
  visualQueryBuilder: "Too complex, low ROI",
  aiContentGenerator: "Different product",
  socialMediaMonitoring: "Scope creep",
  
  // Vanity features
  darkMode: "Unless users beg for it",
  customDashboards: "One good default > many options",
  mobileApp: "Web app is enough",
};
```

## Speed Hacks

### 1. Use What Exists
```typescript
// Authentication? Better Auth - done in 1 hour
// Payments? Stripe Checkout - done in 2 hours  
// Email? Resend templates - done in 30 minutes
// UI? shadcn/ui copy-paste - done instantly
```

### 2. Fake It Till You Make It
```typescript
// "AI-powered insights" = if/else statements
export function generateInsight(data: Metrics): string {
  if (data.growth > 20) return "You're gaining momentum!";
  if (data.sentiment < 0.5) return "Focus on improving perception";
  return "Keep monitoring your progress";
}

// "Machine learning" = regex patterns
export function detectMentionType(text: string): string {
  if (/recommend|best/i.test(text)) return "recommendation";
  if (/alternative/i.test(text)) return "comparison";
  return "mention";
}
```

### 3. Manual First, Automate Later
```typescript
// Week 1: Manually onboard each customer
// Week 4: Build self-serve onboarding
// Week 8: Automate the common paths

// This way you learn what to build
```

### 4. One Good Default
```typescript
// ❌ DON'T: Let users customize everything
// ✅ DO: One dashboard that works for everyone

// ❌ DON'T: 10 email template options
// ✅ DO: One template that converts

// ❌ DON'T: Flexible billing cycles
// ✅ DO: Monthly only (add annual later)
```

## Technical Debt That's OK

### Acceptable Shortcuts
```typescript
// 1. Hardcoded values
const SUPPORTED_MODELS = ['gpt-4o-mini', 'claude-3-haiku'];
const MAX_COMPETITORS = 5;
const REFRESH_RATE = 'weekly';

// 2. Simple algorithms
const sentiment = positiveWords > negativeWords ? 'positive' : 'negative';

// 3. Synchronous where async would be "better"
// If it works and is fast enough, ship it

// 4. Monolithic API routes
// One big handler > microservices for MVP

// 5. Basic error handling
try {
  // do thing
} catch (error) {
  console.error(error);
  return { error: 'Something went wrong' };
}
```

### Debt That's NOT OK
```typescript
// 1. Security shortcuts
// NEVER skip auth, NEVER store passwords in plain text

// 2. Payment processing
// MUST be rock solid from day 1

// 3. Data loss risks  
// Always have backups, even if manual

// 4. Legal compliance
// Terms of Service and Privacy Policy required
```

## Feature Prioritization Matrix

```
Impact ↑
High   │ 🚀 Do First     │ 📅 Do Next
       │ • Core tracking │ • Competitor
       │ • Dashboard     │   analysis
       │ • Billing       │ • Better UI
───────┼─────────────────┼──────────────
Low    │ ⏰ Do If Time   │ 🗑️ Don't Do
       │ • CSV export    │ • Dark mode
       │ • FAQ page      │ • API docs
       │                 │ • Mobile app
       └─────────────────┴──────────────
         Low              High    → Effort
```

## Customer-Driven Development

### Listen, Don't Assume
```typescript
// What users say: "I need Slack integration"
// What they mean: "I want notifications"
// What to build: Email alerts (faster to ship)

// What users say: "The UI needs work"  
// What they mean: "I can't find X feature"
// What to build: Better labels/tooltips
```

### The "Mom Test" for Features
Would you pay for this if it wasn't your product?
- If yes → Build it
- If maybe → Test with 5 customers first
- If no → Don't build it

## Iteration Cycles

### Daily
- Check error logs
- Respond to support
- Ship 1 small fix

### Weekly  
- Review metrics
- Call 3 customers
- Ship 1 feature

### Monthly
- Analyze churn
- Update pricing
- Major feature launch

## Code Patterns for Speed

### 1. Server Components Default
```tsx
// Default to server components
export default async function Dashboard() {
  const data = await getData();
  return <DashboardView data={data} />;
}

// Client only when needed
'use client';
export function InteractiveChart() {
  // Only for interactivity
}
```

### 2. Inline Everything
```tsx
// ❌ DON'T: Over-abstract too early
// ✅ DO: Inline until patterns emerge

// Start with this
export function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {/* inline everything */}
    </div>
  );
}

// Extract only when repeated 3+ times
```

### 3. Data Fetching Patterns
```typescript
// Simple and works
export async function getMentions(projectId: string) {
  return db.query.mentions.findMany({
    where: eq(mentions.projectId, projectId),
    limit: 100,
  });
}

// Don't overcomplicate with:
// - GraphQL
// - Complex caching
// - Pagination (until needed)
```

## Launch Week Mindset

### Monday
"What's the simplest version that provides value?"

### Tuesday  
"What can I cut and still ship today?"

### Wednesday
"Is this feature request actually important?"

### Thursday
"What would happen if I didn't build this?"

### Friday
"Ship it. Get feedback. Iterate Monday."

## The One Metric That Matters

**Time to Value: How fast can a new user see their first mention?**

Target: <5 minutes from signup

Everything else is secondary until you nail this.

## Final Wisdom

1. **Your first version will suck. Ship it anyway.**
2. **Customers don't care about your code quality.**
3. **Moving fast is a feature, not a bug.**
4. **Perfect is the enemy of profitable.**
5. **You can always refactor after you have revenue.**

Remember: You're not building the perfect product. You're building a product that's perfect for getting your first 100 customers. Everything else can wait.