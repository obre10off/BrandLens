'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Crown,
  Target,
  AlertTriangle,
  Plus,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { Sparkline } from '@/components/ui/trend-chart';
import { CircularProgress } from '@/components/ui/circular-progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CompetitorData {
  id: string;
  name: string;
  domain?: string;
  mentionCount: number;
  shareOfVoice: number; // percentage
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    average: number; // 0-100
  };
  trend: 'up' | 'down' | 'stable';
  trendValue: number; // percentage change
  position: number; // ranking position
  isYou?: boolean;
}

interface CompetitiveData {
  yourBrand: CompetitorData;
  competitors: CompetitorData[];
  totalMentions: number;
  marketInsights: {
    leader: string;
    fastestGrowing: string;
    biggestThreat: string;
    opportunities: string[];
  };
}

interface CompetitiveIntelligenceProps {
  data: CompetitiveData;
  className?: string;
}

export function CompetitiveIntelligence({ data, className }: CompetitiveIntelligenceProps) {
  const { yourBrand, competitors, totalMentions, marketInsights } = data;
  
  // Combine and sort all brands
  const allBrands = [yourBrand, ...competitors].sort((a, b) => b.shareOfVoice - a.shareOfVoice);
  
  const getPositionColor = (position: number) => {
    if (position === 1) return 'text-yellow-600';
    if (position <= 3) return 'text-green-600';
    if (position <= 5) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getTrendColor = (trend: string, value: number) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <Card className={cn('competitive-intelligence-card', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-black">Competitive Intelligence</CardTitle>
            <CardDescription className="text-black/70">
              AI share of voice across {totalMentions.toLocaleString()} total mentions
            </CardDescription>
          </div>
          <Link href="/dashboard/competitors">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Analysis
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Market Position Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-black">Market Leader</span>
            </div>
            <p className="text-lg font-bold text-black">{marketInsights.leader}</p>
            <p className="text-xs text-black/70">Highest share of voice</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-black">Fastest Growing</span>
            </div>
            <p className="text-lg font-bold text-black">{marketInsights.fastestGrowing}</p>
            <p className="text-xs text-black/70">Trending upward</p>
          </div>
        </div>

        {/* Your Position */}
        <div className="p-4 rounded-lg bg-blue-50/60 border-2 border-blue-200/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Your Position</h4>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              #{yourBrand.position} of {allBrands.length}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <CircularProgress 
                value={yourBrand.shareOfVoice} 
                size={80}
                strokeWidth={6}
                color="primary"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{yourBrand.shareOfVoice}%</div>
                  <div className="text-xs text-black/70 -mt-1">SoV</div>
                </div>
              </CircularProgress>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-black">{yourBrand.mentionCount}</div>
                  <div className="text-xs text-black/70">Mentions</div>
                </div>
                <div className="text-center">
                  <div className={cn('text-sm font-bold flex items-center justify-center gap-1', 
                    getTrendColor(yourBrand.trend, yourBrand.trendValue))}>
                    {getTrendIcon(yourBrand.trend)}
                    {yourBrand.trendValue > 0 ? '+' : ''}{yourBrand.trendValue}%
                  </div>
                  <div className="text-xs text-black/70">Trend</div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-black/70 mb-1">Position</div>
              <div className="text-3xl font-bold text-primary">#{yourBrand.position}</div>
              <div className="text-xs text-black/50">of {allBrands.length}</div>
            </div>
          </div>
        </div>

        {/* Competitor Rankings */}
        <div className="space-y-3">
          <h4 className="font-medium text-black flex items-center gap-2">
            <Users className="h-4 w-4" />
            Competitive Landscape
          </h4>
          
          <div className="space-y-2">
            {allBrands.map((brand, index) => (
              <div 
                key={brand.id} 
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  brand.isYou ? 'bg-primary/5 border-primary/20' : 'bg-white/50 border-gray-200'
                )}
              >
                {/* Position */}
                <div className={cn('font-bold text-lg w-8 text-center', getPositionColor(index + 1))}>
                  {index + 1}
                </div>

                {/* Brand Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('font-medium', brand.isYou ? 'text-primary' : 'text-black')}>
                      {brand.name}
                    </span>
                    {brand.isYou && (
                      <Badge variant="outline" size="sm" className="text-xs bg-primary/10">
                        You
                      </Badge>
                    )}
                    {brand.domain && (
                      <span className="text-xs text-black/50">({brand.domain})</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-black/70">
                    <span>{brand.mentionCount} mentions</span>
                    <Badge size="sm" className={cn('px-2 py-0.5', getSentimentColor(brand.sentiment.average))}>
                      {brand.sentiment.average}% positive
                    </Badge>
                  </div>
                </div>

                {/* Share of Voice */}
                <div className="text-right space-y-1 w-20">
                  <div className="text-sm font-bold text-black">{brand.shareOfVoice}%</div>
                  <Progress value={brand.shareOfVoice} className="h-2 w-16" />
                </div>

                {/* Trend */}
                <div className="flex items-center gap-2 w-24">
                  <Sparkline 
                    data={[
                      brand.shareOfVoice - Math.abs(brand.trendValue),
                      brand.shareOfVoice - Math.abs(brand.trendValue) * 0.5,
                      brand.shareOfVoice
                    ]}
                    trend={brand.trend}
                  />
                  <span className={cn('text-xs font-medium', getTrendColor(brand.trend, brand.trendValue))}>
                    {brand.trendValue > 0 ? '+' : ''}{brand.trendValue}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="space-y-4">
          {/* Biggest Threat */}
          {marketInsights.biggestThreat && marketInsights.biggestThreat !== yourBrand.name && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Competitive Threat</span>
              </div>
              <p className="text-sm text-red-800">
                <strong>{marketInsights.biggestThreat}</strong> is gaining market share and could impact your position
              </p>
            </div>
          )}

          {/* Opportunities */}
          {marketInsights.opportunities.length > 0 && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Opportunities</span>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                {marketInsights.opportunities.map((opportunity, index) => (
                  <li key={index}>• {opportunity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href="/dashboard/competitors" className="flex-1">
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Analyze Competitors
            </Button>
          </Link>
          <Link href="/dashboard/queries">
            <Button variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}