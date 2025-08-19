'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Users,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface InsightData {
  id: string;
  type: 'opportunity' | 'threat' | 'optimization' | 'trend' | 'achievement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string; // Expected business impact
  effort: 'low' | 'medium' | 'high';
  category:
    | 'visibility'
    | 'sentiment'
    | 'competitive'
    | 'content'
    | 'technical';
  actionable: boolean;
  cta?: {
    label: string;
    href: string;
  };
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
  timeframe?: string;
  confidence: number; // 0-100
}

interface GEOInsightsProps {
  insights: InsightData[];
  className?: string;
}

export function GEOInsights({ insights, className }: GEOInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'threat':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 bg-green-50';
      case 'threat':
        return 'border-red-200 bg-red-50';
      case 'optimization':
        return 'border-blue-200 bg-blue-50';
      case 'trend':
        return 'border-purple-200 bg-purple-50';
      case 'achievement':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'visibility':
        return <BarChart3 className="h-3 w-3" />;
      case 'sentiment':
        return <Star className="h-3 w-3" />;
      case 'competitive':
        return <Users className="h-3 w-3" />;
      case 'content':
        return <MessageSquare className="h-3 w-3" />;
      case 'technical':
        return <Zap className="h-3 w-3" />;
      default:
        return <Lightbulb className="h-3 w-3" />;
    }
  };

  // Sort insights by priority and actionability
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (a.actionable && !b.actionable) {
      return -1;
    }
    if (!a.actionable && b.actionable) {
      return 1;
    }

    return b.confidence - a.confidence;
  });

  const highPriorityCount = insights.filter(i => i.priority === 'high').length;
  const actionableCount = insights.filter(i => i.actionable).length;

  return (
    <Card className={cn('geo-insights', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              GEO Insights
            </CardTitle>
            <CardDescription className="text-black/70">
              AI-powered recommendations for brand optimization
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {highPriorityCount > 0 && (
              <Badge variant="destructive">
                {highPriorityCount} High Priority
              </Badge>
            )}
            <Badge variant="outline">{actionableCount} Actionable</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">
              No insights yet
            </h3>
            <p className="text-black/70 mb-4">
              Insights will appear as we analyze your brand data
            </p>
            <Button>Run Analysis</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedInsights.map(insight => (
              <div
                key={insight.id}
                className={cn(
                  'border rounded-lg p-4 transition-all hover:shadow-sm',
                  getInsightColor(insight.type)
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-black">
                          {insight.title}
                        </h4>
                        <Badge
                          size="sm"
                          className={cn(
                            'px-2 py-1',
                            getPriorityColor(insight.priority)
                          )}
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-black/80 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-black/70 mb-1">
                      Confidence: {insight.confidence}%
                    </div>
                    <div className="flex items-center gap-1 text-xs text-black/70">
                      {getCategoryIcon(insight.category)}
                      <span>{insight.category}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                {insight.metrics && (
                  <div className="mb-3 p-3 rounded-md bg-white/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/70">
                        Current: {insight.metrics.current}
                        {insight.metrics.unit}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-black">
                        Target: {insight.metrics.target}
                        {insight.metrics.unit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Impact & Effort */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-black/80">
                    <strong>Impact:</strong> {insight.impact}
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <span className="text-black/70">Effort:</span>
                    <span
                      className={cn(
                        'font-medium',
                        getEffortColor(insight.effort)
                      )}
                    >
                      {insight.effort}
                    </span>
                  </div>
                </div>

                {/* Timeframe */}
                {insight.timeframe && (
                  <div className="flex items-center gap-1 text-xs text-black/70 mb-3">
                    <Clock className="h-3 w-3" />
                    <span>Expected timeframe: {insight.timeframe}</span>
                  </div>
                )}

                {/* Action */}
                {insight.actionable && insight.cta && (
                  <div className="flex justify-end">
                    <Link href={insight.cta.href}>
                      <Button
                        size="sm"
                        variant={
                          insight.priority === 'high' ? 'default' : 'outline'
                        }
                      >
                        {insight.cta.label}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Summary */}
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 Quick Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <div className="font-medium">
                    {actionableCount} Actions Available
                  </div>
                  <div className="text-blue-700">Ready to implement now</div>
                </div>
                <div>
                  <div className="font-medium">
                    {highPriorityCount} High Priority Items
                  </div>
                  <div className="text-blue-700">Focus on these first</div>
                </div>
              </div>

              {highPriorityCount > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <Button size="sm" className="w-full">
                    Start with High Priority Actions
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
