# BrandLens Technical Stack

## Core Technologies

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend

- **Runtime**: Bun
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Drizzle ORM
- **Queue**: BullMQ with Redis (Upstash)
- **Cache**: Redis (Upstash)

### Authentication & Payments

- **Auth**: Better Auth
- **Payments**: Stripe Checkout
- **Email**: Resend

### Infrastructure

- **Hosting**: Vercel
- **Database**: Neon (Postgres)
- **Redis**: Upstash
- **Monitoring**: Vercel Analytics + Sentry
- **CDN**: Vercel Edge Network

### External APIs

- **OpenAI**: ChatGPT queries
- **Anthropic**: Claude queries
- **Stripe**: Payment processing
- **Resend**: Transactional emails

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   Vercel Edge   │
│  (React + TS)   │     │    Functions    │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   API Routes    │
         │              │  (Bun Runtime)  │
         │              └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Better Auth   │     │   Neon DB       │
│  (NextAuth v5)  │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
                ┌─────────────┐   ┌─────────────┐
                │   BullMQ    │   │  Upstash    │
                │   Queue     │   │   Redis     │
                └─────────────┘   └─────────────┘
                        │
                        ▼
                ┌─────────────┐
                │ LLM Worker  │
                │ (ChatGPT +  │
                │   Claude)   │
                └─────────────┘
```

## Key Design Decisions

### Why Next.js App Router?

- Server Components for better performance
- Built-in API routes
- Excellent Vercel integration
- Great DX with hot reload

### Why Neon DB?

- Serverless Postgres
- Automatic scaling
- Connection pooling built-in
- Great free tier

### Why Drizzle ORM?

- Type-safe queries
- Lightweight (vs Prisma)
- Great migration tools
- Works well with edge runtime

### Why Better Auth?

- Modern auth solution
- Built for Next.js
- Supports passwordless
- Easy social logins

### Why Upstash Redis?

- Serverless Redis
- Pay-per-request pricing
- Global replication
- Works at edge

## Development Workflow

### Local Development

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

### Database Management

```bash
# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio
```

### Testing

```bash
# Run unit tests
bun test

# Run integration tests
bun test:integration

# Run E2E tests (Playwright)
bun test:e2e
```

## Environment Variables

```env
# Database
DATABASE_URL=

# Authentication
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# LLM APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_DSN=
```

## Security Considerations

### API Security

- Rate limiting on all endpoints
- API key rotation schedule
- Request signing for webhooks
- CORS properly configured

### Data Security

- All passwords hashed with bcrypt
- API keys encrypted at rest
- PII data minimized
- GDPR compliance built-in

### Infrastructure Security

- Environment variables in Vercel
- Database connection via SSL
- No secrets in code
- Regular dependency updates

## Performance Targets

### Frontend

- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90

### Backend

- API response time: <200ms (p95)
- Database queries: <50ms (p95)
- LLM processing: <30s per query

### Scalability

- Handle 10,000 queries/day
- Support 1,000 concurrent users
- 99.9% uptime target
