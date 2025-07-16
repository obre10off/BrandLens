# BrandLens MVP Requirements

## Core Value Proposition
BrandLens provides affordable Generative Engine Optimization (GEO) monitoring for SMB SaaS companies. We track how AI platforms mention your brand compared to competitors, offering the same insights as enterprise tools at 60% less cost.

## MVP Features

### 1. Brand Mention Tracking
- **Platforms**: ChatGPT and Claude (2 LLMs only for MVP)
- **Query Types**: 50 pre-built SaaS-specific queries
- **Refresh Rate**: Weekly for all plans initially
- **Data Points**: Brand mentions, sentiment, context

### 2. Competitor Analysis
- **Competitors**: Track up to 5 competitors
- **Metrics**: Share of voice, mention frequency, sentiment comparison
- **Visualization**: Simple bar charts and trend lines

### 3. Dashboard
- **Overview**: Key metrics at a glance
- **Mention Feed**: Recent AI responses mentioning your brand
- **Trends**: 30-day historical data
- **Export**: CSV download of raw data

### 4. Email Reports
- **Frequency**: Weekly summary emails
- **Content**: Top mentions, competitor changes, actionable insights
- **Customization**: Choose which metrics to include

## User Journey

### Signup → First Insight (Target: <5 minutes)

1. **Landing Page** (30s)
   - Clear value prop: "See how AI sees your brand"
   - Pricing visible upfront
   - "Start Free Trial" CTA

2. **Signup** (1 min)
   - Email/password via Better Auth
   - Company name and website URL
   - Auto-detect brand name from URL

3. **Onboarding** (2 min)
   - AI suggests 3-5 competitors based on your domain
   - Select relevant queries from pre-built list
   - Click "Start Monitoring"

4. **First Results** (1 min)
   - Show sample data immediately (pre-cached results)
   - Schedule first real scan
   - Prompt to explore dashboard

## Success Criteria for Launch

### Technical
- [ ] Authentication works smoothly
- [ ] LLM queries process without errors
- [ ] Dashboard loads in <2 seconds
- [ ] Email reports deliver reliably

### Business
- [ ] 50+ signups in first week
- [ ] 10+ paid conversions in first month
- [ ] <5% churn in first 30 days
- [ ] NPS score >40

### User Experience
- [ ] Onboarding completion rate >80%
- [ ] Time to first insight <5 minutes
- [ ] Support tickets <5% of active users
- [ ] Mobile responsive (read-only is fine)

## What We're NOT Building (Yet)

1. **Advanced Features**
   - Custom queries
   - Real-time monitoring
   - API access
   - Team collaboration

2. **Integrations**
   - Slack notifications
   - CRM connections
   - Marketing automation

3. **Content Tools**
   - AI content generator
   - SEO recommendations
   - Comparison page builder

## Technical Constraints

- **API Limits**: Respect rate limits, batch queries efficiently
- **Cost Control**: Cache aggressively, process in batches
- **Data Storage**: 90-day retention for MVP
- **Scale**: Built for 100 active customers initially

## Pricing Tiers (MVP)

### Starter - $39/month
- 1 project
- 50 tracked queries
- 2 competitors
- Weekly updates

### Growth - $79/month
- 2 projects
- 150 tracked queries
- 5 competitors
- Weekly updates

### Scale - $149/month
- 5 projects
- 350 tracked queries
- 10 competitors
- Daily updates (post-MVP)

## Launch Checklist

- [ ] Landing page live
- [ ] Payment processing working
- [ ] 50 test queries validated
- [ ] Email templates created
- [ ] Basic documentation written
- [ ] Customer support email set up
- [ ] Analytics tracking implemented
- [ ] Error monitoring configured