# BrandLens Deployment Guide

## Deployment Platform: Vercel

### Why Vercel?

- Perfect for Next.js apps
- Automatic deployments from Git
- Edge functions for API routes
- Built-in analytics
- Generous free tier
- Automatic SSL

## Environment Setup

### Required Environment Variables

```bash
# .env.local (for development)
# .env.production (for Vercel)

# Database (Neon)
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com

# LLM APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=hello@brandlens.ai

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App Config
NEXT_PUBLIC_APP_URL=https://brandlens.ai

# Monitoring (Optional for MVP)
SENTRY_DSN=https://...@sentry.io/...
VERCEL_ANALYTICS_ID=...
```

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "src/app/api/llm/process/route.ts": {
      "maxDuration": 60
    },
    "src/app/api/webhooks/stripe/route.ts": {
      "maxDuration": 30
    }
  },
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://brandlens.ai"
        }
      ]
    }
  ]
}
```

## Database Setup

### Neon Database Configuration

```bash
# 1. Create Neon project
# 2. Get connection string
# 3. Enable connection pooling

# Run migrations
bun run db:generate
bun run db:migrate

# Seed initial data
bun run db:seed
```

### Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Deployment Process

### Initial Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Set environment variables
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# ... add all required env vars

# 5. Deploy to production
vercel --prod
```

### Automated Deployments

```yaml
# GitHub Actions (.github/workflows/deploy.yml)
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: bun run db:migrate

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Pre-deployment Checklist

```typescript
// scripts/pre-deploy.ts
export async function preDeployChecks() {
  const checks = [
    checkEnvVars(),
    checkDatabaseConnection(),
    checkRedisConnection(),
    checkStripeWebhook(),
    checkEmailConfig(),
  ];

  const results = await Promise.all(checks);
  const failed = results.filter(r => !r.success);

  if (failed.length > 0) {
    console.error('Pre-deploy checks failed:', failed);
    process.exit(1);
  }

  console.log('✅ All pre-deploy checks passed');
}
```

## Production Configuration

### Security Headers

```typescript
// src/middleware.ts
export function middleware(request: Request) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline';"
  );

  return response;
}
```

### Performance Optimization

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['brandlens.ai'],
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
};
```

### Error Monitoring

```typescript
// src/app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## Monitoring & Alerts

### Vercel Analytics

```typescript
// Automatically enabled with Vercel deployment
// View at: https://vercel.com/[team]/[project]/analytics
```

### Custom Monitoring

```typescript
// src/lib/monitoring.ts
export class Monitor {
  static async trackEvent(event: string, properties?: any) {
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ event, properties }),
      });
    }
  }

  static async trackError(error: Error, context?: any) {
    console.error('Error:', error, context);
    Sentry.captureException(error, { extra: context });
  }
}
```

### Health Checks

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    stripe: await checkStripe(),
  };

  const healthy = Object.values(checks).every(c => c.status === 'ok');

  return Response.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
```

## Scaling Considerations

### Edge Functions

```typescript
// Use edge runtime for lightweight endpoints
export const runtime = 'edge';

export async function GET(request: Request) {
  // Runs at edge locations globally
  // Perfect for auth checks, redirects, etc.
}
```

### Caching Strategy

```typescript
// Aggressive caching for static content
export const revalidate = 3600; // 1 hour

// Dynamic caching for API responses
const cached = await redis.get(cacheKey);
if (cached) return Response.json(cached);

// Cache miss - fetch and store
const data = await fetchData();
await redis.set(cacheKey, data, { ex: 300 }); // 5 minutes
```

### Database Connection Pooling

```typescript
// Neon automatically handles connection pooling
// Use the pooled connection string for serverless
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
  schema,
});
```

## Backup & Disaster Recovery

### Database Backups

- Neon provides automatic daily backups
- Enable point-in-time recovery
- Test restore process monthly

### Code Backups

- Git repository (GitHub)
- Vercel stores deployment history
- Can rollback instantly

### Data Export

```typescript
// Allow users to export their data
export async function exportUserData(userId: string) {
  const data = await db.query.organizations.findMany({
    where: eq(organizations.ownerId, userId),
    with: {
      projects: {
        with: {
          mentions: true,
          competitors: true,
        },
      },
    },
  });

  return {
    format: 'json',
    data,
    exportedAt: new Date().toISOString(),
  };
}
```

## Launch Day Checklist

### Technical

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Stripe webhooks configured
- [ ] Email sending tested
- [ ] SSL certificate active
- [ ] Analytics tracking working
- [ ] Error monitoring active
- [ ] Health endpoint responding

### Business

- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Support email configured
- [ ] Documentation written
- [ ] FAQ page created

### Marketing

- [ ] Social media accounts ready
- [ ] Product Hunt draft prepared
- [ ] Launch email drafted
- [ ] Press kit available

## Post-Launch Monitoring

### First 24 Hours

- Monitor error rates closely
- Check conversion funnel
- Respond to support quickly
- Watch server resources
- Track signup sources

### First Week

- Daily error report review
- Performance optimization
- User feedback collection
- Feature usage analytics
- Churn analysis

### Ongoing

- Weekly performance review
- Monthly security updates
- Quarterly dependency updates
- Annual disaster recovery test
