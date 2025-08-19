import { Worker, Job } from 'bullmq';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import {
  projects,
  brandMentions,
  emailQueue,
  organizations,
  users,
} from '@/lib/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { RedisCache, CACHE_PREFIXES } from '@/lib/redis';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailReportJob {
  projectId: string;
  recipientEmail: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  type: 'weekly' | 'monthly';
}

export function createEmailReportWorker() {
  return new Worker(
    'email-reports',
    async (job: Job<EmailReportJob>) => {
      const { projectId, recipientEmail, reportPeriod, type } = job.data;

      // Get project details
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          organization: {
            with: {
              owner: true,
            },
          },
          competitors: true,
        },
      });

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Get metrics for the period
      const metrics = await getProjectMetrics(projectId, reportPeriod);
      const insights = generateInsights(metrics, project);
      const recommendations = generateRecommendations(insights);

      // Generate email HTML
      const html = generateEmailHTML({
        recipientName: project.organization.owner.name || 'there',
        brandName: project.brandName,
        period: formatPeriod(reportPeriod, type),
        metrics,
        insights,
        recommendations,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${projectId}`,
      });

      // Store in email queue
      await db.insert(emailQueue).values({
        recipientEmail,
        emailType: `${type}-report`,
        subject: `Your AI Visibility Report - ${formatPeriod(reportPeriod, type)}`,
        htmlContent: html,
        textContent: generateTextVersion(html),
        metadata: {
          projectId,
          reportPeriod,
          metrics,
        },
        status: 'pending',
      });

      // Send email
      try {
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: recipientEmail,
          subject: `Your AI Visibility Report - ${formatPeriod(reportPeriod, type)}`,
          html,
        });

        if (error) {
          throw error;
        }

        // Update email status
        await db
          .update(emailQueue)
          .set({
            status: 'sent',
            sentAt: new Date(),
          })
          .where(eq(emailQueue.id, data?.id || ''));

        return {
          success: true,
          emailId: data?.id,
          metrics,
        };
      } catch (error) {
        // Update email status to failed
        await db
          .update(emailQueue)
          .set({
            status: 'failed',
            lastError: error instanceof Error ? error.message : 'Unknown error',
            attempts: sql`${emailQueue.attempts} + 1`,
          })
          .where(eq(emailQueue.recipientEmail, recipientEmail));

        throw error;
      }
    },
    {
      connection: {
        host: process.env
          .UPSTASH_REDIS_REST_URL!.replace('https://', '')
          .split('.')[0],
        port: 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        tls: {},
      },
      concurrency: 3,
      limiter: {
        max: 30,
        duration: 60000, // 30 emails per minute
      },
    }
  );
}

async function getProjectMetrics(
  projectId: string,
  period: { start: Date; end: Date }
) {
  // Check cache first
  const cacheKey = `${CACHE_PREFIXES.projectMetrics}${projectId}:${period.start.toISOString()}`;
  const cached = await RedisCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Get current period mentions
  const currentMentions = await db.query.brandMentions.findMany({
    where: and(
      eq(brandMentions.projectId, projectId),
      gte(brandMentions.createdAt, period.start)
    ),
  });

  // Get previous period mentions for comparison
  const previousPeriodStart = new Date(period.start);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
  const previousPeriodEnd = new Date(period.start);

  const previousMentions = await db.query.brandMentions.findMany({
    where: and(
      eq(brandMentions.projectId, projectId),
      gte(brandMentions.createdAt, previousPeriodStart)
    ),
  });

  // Calculate metrics
  const metrics = {
    totalMentions: currentMentions.length,
    previousMentions: previousMentions.length,
    mentionChange: calculatePercentageChange(
      previousMentions.length,
      currentMentions.length
    ),
    sentimentBreakdown: {
      positive: currentMentions.filter(m => m.sentiment === 'positive').length,
      neutral: currentMentions.filter(m => m.sentiment === 'neutral').length,
      negative: currentMentions.filter(m => m.sentiment === 'negative').length,
    },
    averageSentiment: calculateAverageSentiment(currentMentions),
    topQueries: await getTopPerformingQueries(projectId, currentMentions),
    competitorComparison: await getCompetitorComparison(projectId, period),
    mentionsByModel: groupMentionsByModel(currentMentions),
  };

  // Cache the metrics
  await RedisCache.set(cacheKey, metrics, 3600); // 1 hour cache

  return metrics;
}

function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function calculateAverageSentiment(mentions: any[]): number {
  if (mentions.length === 0) {
    return 0;
  }
  const sum = mentions.reduce(
    (acc, m) => acc + parseFloat(m.sentimentScore || '0.5'),
    0
  );
  return Math.round((sum / mentions.length) * 100);
}

async function getTopPerformingQueries(projectId: string, mentions: any[]) {
  const queryMentions = mentions.reduce(
    (acc, mention) => {
      acc[mention.queryId] = (acc[mention.queryId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topQueryIds = Object.entries(queryMentions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([queryId]) => queryId);

  const queries = await db.query.projectQueries.findMany({
    where: and(
      eq(brandMentions.projectId, projectId),
      sql`id IN (${sql.join(
        topQueryIds.map(id => sql`${id}`),
        sql`, `
      )})`
    ),
  });

  return queries.map(q => ({
    query: q.query,
    mentions: queryMentions[q.id] || 0,
  }));
}

async function getCompetitorComparison(
  projectId: string,
  period: { start: Date; end: Date }
) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: { competitors: true },
  });

  if (!project) {
    return [];
  }

  const allBrands = [
    project.brandName,
    ...project.competitors.map(c => c.name),
  ];
  const brandMentionCounts: Record<string, number> = {};

  for (const brand of allBrands) {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(brandMentions)
      .where(
        and(
          eq(brandMentions.projectId, projectId),
          eq(brandMentions.brandName, brand),
          gte(brandMentions.createdAt, period.start)
        )
      );

    brandMentionCounts[brand] = count[0]?.count || 0;
  }

  return Object.entries(brandMentionCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([brand, count]) => ({
      brand,
      mentions: count,
      isOwnBrand: brand === project.brandName,
    }));
}

function groupMentionsByModel(mentions: any[]) {
  return mentions.reduce(
    (acc, mention) => {
      acc[mention.llmModel] = (acc[mention.llmModel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

function generateInsights(metrics: any, project: any) {
  const insights = [];

  // Mention trend insight
  if (metrics.mentionChange > 20) {
    insights.push({
      type: 'positive',
      message: `Your brand mentions increased by ${metrics.mentionChange}% this week!`,
    });
  } else if (metrics.mentionChange < -20) {
    insights.push({
      type: 'warning',
      message: `Your brand mentions decreased by ${Math.abs(metrics.mentionChange)}% this week.`,
    });
  }

  // Sentiment insight
  if (metrics.averageSentiment > 75) {
    insights.push({
      type: 'positive',
      message: 'Your brand sentiment is excellent! Keep up the great work.',
    });
  } else if (metrics.averageSentiment < 40) {
    insights.push({
      type: 'warning',
      message:
        'Your brand sentiment could use improvement. Review negative mentions.',
    });
  }

  // Competitor insight
  const topCompetitor = metrics.competitorComparison.find(c => !c.isOwnBrand);
  const ownBrand = metrics.competitorComparison.find(c => c.isOwnBrand);

  if (ownBrand && topCompetitor && ownBrand.mentions < topCompetitor.mentions) {
    insights.push({
      type: 'warning',
      message: `${topCompetitor.brand} is getting more AI mentions than you.`,
    });
  }

  // Query performance insight
  if (metrics.topQueries.length > 0) {
    insights.push({
      type: 'info',
      message: `You're performing best on "${metrics.topQueries[0].query}" queries.`,
    });
  }

  return insights;
}

function generateRecommendations(insights: any[]) {
  const recommendations = [];

  // Add recommendations based on insights
  insights.forEach(insight => {
    if (insight.type === 'warning') {
      if (insight.message.includes('decreased')) {
        recommendations.push(
          'Consider creating new content targeting high-value queries'
        );
        recommendations.push(
          'Update your product pages with AI-friendly descriptions'
        );
      }
      if (insight.message.includes('sentiment')) {
        recommendations.push('Address negative feedback in your product');
        recommendations.push('Highlight positive customer testimonials');
      }
      if (insight.message.includes('getting more AI mentions')) {
        recommendations.push('Analyze competitor content strategies');
        recommendations.push(
          'Optimize for queries where competitors are winning'
        );
      }
    }
  });

  // Add general recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring your AI visibility trends');
    recommendations.push('Experiment with new content formats');
    recommendations.push('Consider expanding to more AI platforms');
  }

  return recommendations.slice(0, 3); // Limit to 3 recommendations
}

function formatPeriod(
  period: { start: Date; end: Date },
  type: string
): string {
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  if (type === 'weekly') {
    return `Week of ${period.start.toLocaleDateString('en-US', options)}`;
  } else {
    return period.start.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }
}

function generateEmailHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Visibility Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px; }
    .metric { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .metric-label { color: #666; font-size: 14px; }
    .change-positive { color: #10b981; }
    .change-negative { color: #ef4444; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .insights { background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .recommendation { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .recommendation:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your AI Visibility Report</h1>
      <p>${data.period}</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Here's how AI platforms saw <strong>${data.brandName}</strong> this week:</p>
      
      <div class="metric">
        <div class="metric-value">
          ${data.metrics.totalMentions}
          <span class="${data.metrics.mentionChange >= 0 ? 'change-positive' : 'change-negative'}">
            ${data.metrics.mentionChange >= 0 ? '↑' : '↓'} ${Math.abs(data.metrics.mentionChange)}%
          </span>
        </div>
        <div class="metric-label">Total Mentions</div>
      </div>
      
      <div class="metric">
        <div class="metric-value">${data.metrics.averageSentiment}%</div>
        <div class="metric-label">Positive Sentiment</div>
      </div>
      
      <div class="insights">
        <h3>Key Insights</h3>
        ${data.insights
          .map(
            insight => `
          <p>${insight.type === 'positive' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️'} ${insight.message}</p>
        `
          )
          .join('')}
      </div>
      
      <h3>Recommended Actions</h3>
      ${data.recommendations
        .map(
          rec => `
        <div class="recommendation">💡 ${rec}</div>
      `
        )
        .join('')}
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">View Full Report</a>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Best,<br>
        The BrandLens Team
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateTextVersion(html: string): string {
  // Simple HTML to text conversion
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
