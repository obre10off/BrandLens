'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Shield, 
  Eye, 
  Heart, 
  Target,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandHealthData {
  overallScore: number; // 0-100
  components: {
    visibility: number; // How often mentioned
    sentiment: number; // Positivity of mentions  
    authority: number; // Authority of mentions
    competitiveness: number; // vs competitors
    growth: number; // Trend direction
  };
  totalMentions: number;
  trend: 'up' | 'down' | 'stable';
  previousScore?: number;
}

interface BrandHealthScoreProps {
  data: BrandHealthData;
  className?: string;
}

export function BrandHealthScore({ data, className }: BrandHealthScoreProps) {
  const { overallScore, components, totalMentions, trend, previousScore } = data;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const scoreChange = previousScore ? overallScore - previousScore : 0;

  const componentDetails = [
    {
      key: 'visibility',
      label: 'Visibility',
      description: 'How often your brand is mentioned',
      icon: Eye,
      score: components.visibility,
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      description: 'Positivity of brand mentions',
      icon: Heart,
      score: components.sentiment,
    },
    {
      key: 'authority',
      label: 'Authority',
      description: 'Strength and credibility of mentions',
      icon: Shield,
      score: components.authority,
    },
    {
      key: 'competitiveness',
      label: 'Competitive Position',
      description: 'Performance vs competitors',
      icon: Target,
      score: components.competitiveness,
    },
    {
      key: 'growth',
      label: 'Growth Trend',
      description: 'Direction of brand perception',
      icon: TrendingUp,
      score: components.growth,
    },
  ];

  return (
    <Card className={cn('brand-health-card bg-gray-50/30 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200/40', className)}>
      <CardHeader className="pb-6 bg-white/60 rounded-t-lg border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Brand Health Score</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Overall AI visibility and perception across {totalMentions} mentions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
              {getScoreLabel(overallScore)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score with Circular Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Main Score */}
          <div className="text-center">
            <CircularProgress 
              value={overallScore} 
              size={140}
              strokeWidth={12}
              color={overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'destructive'}
              className="mx-auto mb-4"
            />
            {scoreChange !== 0 && (
              <div className={cn(
                'text-sm font-medium inline-flex items-center gap-1',
                scoreChange > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {getTrendIcon()}
                {scoreChange > 0 ? '+' : ''}{scoreChange} from last month
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{totalMentions}</div>
                <div className="text-xs text-blue-700">Total Mentions</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="text-2xl font-bold text-green-600">{components.sentiment}%</div>
                <div className="text-xs text-green-700">Positive Sentiment</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{components.visibility}%</div>
                <div className="text-xs text-purple-700">Brand Visibility</div>
              </div>
            </div>
            <div className="text-center">
              <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
                {getScoreLabel(overallScore)} Health
              </Badge>
            </div>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-black/70" />
            <h4 className="text-sm font-medium text-black">Score Components</h4>
          </div>
          
          <div className="grid gap-3">
            {componentDetails.map((component) => {
              const IconComponent = component.icon;
              return (
                <div key={component.key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-full bg-blue-100 border border-blue-200">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-800">{component.label}</h5>
                        <span className={cn('text-sm font-bold', getScoreColor(component.score))}>
                          {component.score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{component.description}</p>
                    </div>
                  </div>
                  <div className="w-16">
                    <Progress 
                      value={component.score} 
                      className="h-2"
                      style={{
                        background: `linear-gradient(to right, ${getProgressColor(component.score)} ${component.score}%, #e5e7eb ${component.score}%)`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Key Insights</h4>
          <div className="space-y-1 text-xs text-blue-800">
            {overallScore >= 80 && (
              <p>• Your brand has excellent AI visibility and positive sentiment</p>
            )}
            {overallScore < 80 && components.visibility < 60 && (
              <p>• Focus on increasing brand visibility through content optimization</p>
            )}
            {components.sentiment < 60 && (
              <p>• Consider addressing sentiment issues through better positioning</p>
            )}
            {components.competitiveness < 50 && (
              <p>• Competitors are outperforming you in AI mentions - analyze their strategy</p>
            )}
            {trend === 'up' && (
              <p>• Your brand perception is trending upward - maintain current strategy</p>
            )}
            {trend === 'down' && (
              <p>• Brand perception declining - review content and competitor activity</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}