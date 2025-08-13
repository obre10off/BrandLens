'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  BarChart3,
  Play,
  Plus,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QueryPerformanceData {
  id: string;
  name: string;
  category: string;
  template: string;
  executionCount: number;
  mentionCount: number;
  avgSentiment: number; // 0-100
  successRate: number; // percentage of executions that found mentions
  lastExecuted: Date;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  avgPosition: number; // Average mention position in responses
  competitorMentions: number;
  performanceScore: number; // 0-100 calculated score
  isActive: boolean;
}

interface QueryPerformanceProps {
  queries: QueryPerformanceData[];
  totalExecutions: number;
  totalMentions: number;
  className?: string;
  onRunQuery?: (queryId: string) => void;
}

export function QueryPerformance({ 
  queries, 
  totalExecutions, 
  totalMentions, 
  className,
  onRunQuery 
}: QueryPerformanceProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'comparison': 'bg-blue-100 text-blue-800',
      'recommendation': 'bg-green-100 text-green-800',
      'feature': 'bg-purple-100 text-purple-800',
      'alternative': 'bg-orange-100 text-orange-800',
      'integration': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  // Sort queries by performance score
  const sortedQueries = [...queries].sort((a, b) => b.performanceScore - a.performanceScore);

  const topPerformer = sortedQueries[0];
  const avgPerformanceScore = queries.length > 0 
    ? Math.round(queries.reduce((sum, q) => sum + q.performanceScore, 0) / queries.length)
    : 0;

  const formatLastExecuted = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <Card className={cn('query-performance', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Query Performance
            </CardTitle>
            <CardDescription className="text-black/70">
              {totalExecutions} executions across {queries.length} queries
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/queries">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Query
              </Button>
            </Link>
            <Link href="/dashboard/queries">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{avgPerformanceScore}</div>
            <div className="text-xs text-blue-800">Avg Performance</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
            <div className="text-2xl font-bold text-green-600">{totalMentions}</div>
            <div className="text-xs text-green-800">Total Mentions</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{queries.filter(q => q.isActive).length}</div>
            <div className="text-xs text-purple-800">Active Queries</div>
          </div>
        </div>

        {/* Top Performer Highlight */}
        {topPerformer && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-black">Top Performing Query</span>
              <Badge className="bg-blue-100 text-blue-800">#{1}</Badge>
            </div>
            <h4 className="font-semibold text-black mb-1">{topPerformer.name}</h4>
            <p className="text-sm text-black/70 mb-2">{topPerformer.template}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-600">{topPerformer.performanceScore}</div>
                <div className="text-xs text-black/70">Score</div>
              </div>
              <div>
                <div className="font-medium text-black">{topPerformer.mentionCount}</div>
                <div className="text-xs text-black/70">Mentions</div>
              </div>
              <div>
                <div className="font-medium text-black">{topPerformer.avgSentiment}%</div>
                <div className="text-xs text-black/70">Positive</div>
              </div>
            </div>
          </div>
        )}

        {/* Query List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-black">All Queries</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              Sort by Performance
            </Button>
          </div>

          {queries.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No queries configured</h3>
              <p className="text-black/70 mb-4">Create your first query to start monitoring</p>
              <Link href="/dashboard/queries">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Query
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedQueries.map((query, index) => (
                <div 
                  key={query.id}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                    query.isActive ? 'bg-white/50 border-gray-200 hover:bg-white' : 'bg-gray-50 border-gray-100'
                  )}
                >
                  {/* Rank */}
                  <div className="text-sm font-bold text-gray-500 w-6 text-center">
                    #{index + 1}
                  </div>

                  {/* Query Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-black truncate">{query.name}</h5>
                      <Badge size="sm" className={cn('px-2 py-0.5', getCategoryColor(query.category))}>
                        {query.category}
                      </Badge>
                      {!query.isActive && (
                        <Badge size="sm" variant="secondary">Paused</Badge>
                      )}
                    </div>
                    <p className="text-xs text-black/70 truncate">{query.template}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-black/70">
                      <span>{query.executionCount} runs</span>
                      <span>•</span>
                      <span>{query.mentionCount} mentions</span>
                      <span>•</span>
                      <span>{query.successRate}% success rate</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLastExecuted(query.lastExecuted)}
                      </span>
                    </div>
                  </div>

                  {/* Performance Score */}
                  <div className="text-center w-16">
                    <div className={cn('text-lg font-bold', getScoreColor(query.performanceScore))}>
                      {query.performanceScore}
                    </div>
                    <div className="text-xs text-black/70">Score</div>
                    <div className={cn('w-full h-1 rounded-full mt-1', getScoreBackground(query.performanceScore))}>
                      <div 
                        className="h-full rounded-full bg-current opacity-30"
                        style={{ width: `${query.performanceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="text-right w-20">
                    <div className="text-sm font-medium text-black">{query.avgSentiment}%</div>
                    <div className="text-xs text-black/70 mb-1">Positive</div>
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIcon(query.trend)}
                      <span className="text-xs text-black/70">
                        {query.trendValue > 0 ? '+' : ''}{query.trendValue}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-16">
                    {onRunQuery && query.isActive && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onRunQuery(query.id)}
                        className="p-2"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Link href="/dashboard/queries" className="flex-1">
            <Button variant="outline" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Manage Queries
            </Button>
          </Link>
          <Button onClick={() => {/* Run all active queries */}}>
            Run All Active
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}