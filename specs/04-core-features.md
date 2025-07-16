# BrandLens Core Features

## 1. Brand Mention Tracking

### Overview
Track how ChatGPT and Claude mention your brand across 50+ pre-built SaaS queries. Automated weekly scans with intelligent mention detection and sentiment analysis.

### Implementation Details

#### Query Execution Flow
```typescript
interface QueryExecutor {
  // 1. Get active queries for project
  getActiveQueries(projectId: string): Query[];
  
  // 2. Generate prompts with brand context
  generatePrompts(queries: Query[], brandName: string): Prompt[];
  
  // 3. Execute across LLMs
  executeLLMQueries(prompts: Prompt[]): Promise<LLMResponse[]>;
  
  // 4. Parse and store responses
  processResponses(responses: LLMResponse[]): Promise<BrandMention[]>;
}
```

#### Mention Detection Algorithm
```typescript
class MentionDetector {
  // Direct mentions: "Slack is the best..."
  detectDirectMentions(text: string, brandName: string): Mention[];
  
  // Feature mentions: "real-time messaging like in Slack"
  detectFeatureMentions(text: string, brandFeatures: string[]): Mention[];
  
  // Competitive mentions: "Unlike Slack, Teams offers..."
  detectCompetitiveMentions(text: string, competitors: string[]): Mention[];
  
  // Sentiment analysis using simple keyword matching for MVP
  analyzeSentiment(context: string): 'positive' | 'neutral' | 'negative';
}
```

#### Pre-built Query Categories
1. **General Comparison**: "best [category] software 2024"
2. **Use Case Specific**: "best [category] for [use case]"
3. **Feature Focused**: "[feature] tools for [industry]"
4. **Alternative Searches**: "[competitor] alternatives"
5. **Integration Queries**: "[category] that integrates with [tool]"

### User Experience

#### Dashboard View
```
┌─────────────────────────────────────────┐
│  Your Brand Mentions (Last 30 Days)     │
├─────────────────────────────────────────┤
│  Total Mentions: 127 (↑ 23%)            │
│  Positive: 89 | Neutral: 31 | Neg: 7    │
│                                         │
│  📊 Mention Trend [chart]               │
│                                         │
│  Recent Mentions:                       │
│  • "Slack remains the gold standard..." │
│    - ChatGPT, 2 days ago, Positive     │
│  • "For teams under 10, consider..."   │
│    - Claude, 3 days ago, Neutral       │
└─────────────────────────────────────────┘
```

## 2. Competitor Analysis

### Overview
Compare your brand's AI visibility against up to 5 competitors. See who's winning the AI mention battle and identify opportunities.

### Features

#### Share of Voice
```typescript
interface ShareOfVoice {
  brand: string;
  mentionCount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Calculate share of voice
function calculateShareOfVoice(mentions: BrandMention[]): ShareOfVoice[] {
  const brandCounts = groupBy(mentions, 'brandName');
  const total = mentions.length;
  
  return Object.entries(brandCounts).map(([brand, brandMentions]) => ({
    brand,
    mentionCount: brandMentions.length,
    percentage: (brandMentions.length / total) * 100,
    trend: calculateTrend(brand, previousPeriod)
  }));
}
```

#### Competitive Positioning Matrix
```
         Positive Sentiment →
    ┌────────────────────────────┐
  F │ ⚠️ At Risk    │ 🌟 Leader │
  r │               │           │
  e │ You○         │    Comp1○ │
  q ├───────────────┼───────────┤
  u │ 💤 Invisible  │ 📈 Rising │
  e │               │           │
  n │      Comp2○   │    Comp3○ │
  c └────────────────────────────┘
  y
```

#### Gap Analysis
- Queries where competitors appear but you don't
- Features competitors are known for that you aren't
- Integration mentions you're missing

### Implementation

#### Competitor Tracking
```typescript
class CompetitorTracker {
  // Auto-suggest competitors based on domain
  async suggestCompetitors(domain: string): Promise<string[]> {
    // Use a pre-built database of SaaS companies
    const category = await detectCategory(domain);
    return getTopCompetitorsInCategory(category);
  }
  
  // Track mentions across all competitors
  async trackAllMentions(projectId: string): Promise<CompetitorData[]> {
    const competitors = await getProjectCompetitors(projectId);
    const mentions = await getMentionsForBrands([...competitors, ownBrand]);
    
    return competitors.map(competitor => ({
      name: competitor.name,
      mentions: filterMentions(mentions, competitor.name),
      sentiment: calculateAverageSentiment(mentions),
      queries: getUniqueQueries(mentions)
    }));
  }
}
```

## 3. Dashboard & Visualizations

### Overview
Clean, actionable dashboard showing key metrics and trends. Built for quick insights, not data overload.

### Key Sections

#### Metrics Overview
```typescript
interface DashboardMetrics {
  totalMentions: number;
  mentionChange: number; // % vs last period
  averageSentiment: number; // 0-100 score
  shareOfVoice: number; // % vs competitors
  topCompetitor: string;
  gapCount: number; // Queries where you're not mentioned
}
```

#### Visualization Components

1. **Mention Timeline**
   - 30-day line chart
   - Toggle between daily/weekly view
   - Overlay competitor data

2. **Sentiment Breakdown**
   - Donut chart of positive/neutral/negative
   - Click to see example mentions

3. **Query Performance**
   - Which queries drive most mentions
   - Identify high-value queries

4. **Competitor Comparison**
   - Side-by-side bar charts
   - Sortable by metric

### Technical Implementation

#### Real-time Updates
```typescript
// Use Server-Sent Events for live updates
export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const updates = await getLatestMentions();
        controller.enqueue(`data: ${JSON.stringify(updates)}\n\n`);
      }, 30000); // Every 30 seconds
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 4. Email Reports

### Overview
Weekly email summaries delivered every Monday at 9 AM. Actionable insights without overwhelming data.

### Email Structure

```
Subject: Your AI Visibility Report - Week of [Date]

Hi [Name],

Here's how AI saw your brand this week:

📊 Quick Stats
• Total Mentions: 42 (↑ 15% from last week)
• Sentiment: 78% positive
• You vs. Top Competitor: 42 vs. 38 mentions

🎯 Key Insights
1. You're gaining ground on "best CRM for startups" queries
2. Competitor X was mentioned more for "integration capabilities"
3. New opportunity: You're not appearing in "AI-powered CRM" searches

📈 Top Performing Queries
• "Best CRM software 2024" - 8 mentions
• "Salesforce alternatives" - 6 mentions
• "CRM for small teams" - 5 mentions

💡 Recommended Actions
• Create content about your AI features
• Update your integration page to highlight key partners
• Consider targeting "CRM with workflow automation" queries

View Full Report → [Dashboard Link]

Best,
The BrandLens Team
```

### Implementation

#### Email Queue System
```typescript
class EmailReportService {
  async queueWeeklyReports() {
    const activeProjects = await getActiveProjects();
    
    for (const project of activeProjects) {
      await emailQueue.add('weekly-report', {
        projectId: project.id,
        recipientEmail: project.ownerEmail,
        reportPeriod: getLastWeekPeriod(),
      }, {
        delay: getNextMondayDelay(),
        attempts: 3,
      });
    }
  }
  
  async generateReport(projectId: string, period: DateRange) {
    const metrics = await calculateWeeklyMetrics(projectId, period);
    const insights = await generateInsights(metrics);
    const html = await renderEmailTemplate('weekly-report', {
      metrics,
      insights,
      recommendations: generateRecommendations(insights),
    });
    
    return html;
  }
}
```

### Customization Options
- Choose email frequency (weekly/bi-weekly)
- Select which metrics to include
- Set mention threshold alerts
- Add team members to reports

## MVP Feature Priorities

### Phase 1 (Launch)
1. Basic mention tracking (ChatGPT + Claude)
2. Simple sentiment analysis
3. Competitor comparison
4. Email reports

### Phase 2 (Post-Launch)
1. Advanced sentiment analysis
2. Custom query builder
3. Slack notifications
4. API access

### Phase 3 (Growth)
1. More LLM platforms
2. Real-time monitoring
3. Content recommendations
4. Team collaboration