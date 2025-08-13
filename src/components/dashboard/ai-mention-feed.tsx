'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Bot,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw
} from 'lucide-react';
import { PlatformIcon, getPlatformColor } from '@/components/ui/platform-icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface MentionData {
  id: string;
  content: string; // The mention text
  context: string; // Surrounding context
  brandName: string;
  llmModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-haiku' | string;
  platform: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // 0-100
  mentionType: 'direct' | 'feature' | 'competitive';
  position: number; // Position in response
  queryCategory: string;
  createdAt: Date;
  responseText?: string; // Full LLM response
}

interface AIMentionFeedProps {
  mentions: MentionData[];
  totalMentions: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function AIMentionFeed({ 
  mentions, 
  totalMentions, 
  isLoading, 
  onRefresh, 
  className 
}: AIMentionFeedProps) {
  
  const getLLMIcon = (model: string) => {
    if (model.startsWith('gpt')) return '🤖';
    if (model.startsWith('claude')) return '🧠';
    if (model.startsWith('gemini')) return '💎';
    return '🔮';
  };

  const getLLMColor = (model: string) => {
    if (model.startsWith('gpt')) return 'bg-green-100 text-green-800';
    if (model.startsWith('claude')) return 'bg-purple-100 text-purple-800';
    if (model.startsWith('gemini')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMentionTypeColor = (type: string) => {
    switch (type) {
      case 'direct':
        return 'bg-blue-100 text-blue-800';
      case 'feature':
        return 'bg-yellow-100 text-yellow-800';
      case 'competitive':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const highlightBrand = (text: string, brandName: string) => {
    const regex = new RegExp(`(${brandName})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <Card className={cn('ai-mention-feed', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Mention Feed
            </CardTitle>
            <CardDescription className="text-black/70">
              Recent brand mentions from {totalMentions.toLocaleString()} AI conversations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Link href="/dashboard/responses">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {mentions.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No mentions yet</h3>
            <p className="text-black/70 mb-4">Run your first query to start tracking AI mentions</p>
            <Link href="/dashboard/queries">
              <Button>
                Start Monitoring
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mentions.map((mention) => (
              <div 
                key={mention.id}
                className="border rounded-lg p-4 hover:bg-white/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <PlatformIcon platform={mention.platform} size={24} />
                    <Badge size="sm" className={cn('px-2 py-1', getPlatformColor(mention.platform))}>
                      {mention.llmModel}
                    </Badge>
                    <Badge size="sm" className={cn('px-2 py-1', getMentionTypeColor(mention.mentionType))}>
                      {mention.mentionType}
                    </Badge>
                    <Badge size="sm" className={cn('px-2 py-1', getSentimentColor(mention.sentiment))}>
                      {getSentimentIcon(mention.sentiment)}
                      <span className="ml-1">{mention.sentiment}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/70">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(mention.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="text-black">
                    <h4 className="font-medium mb-1">Brand Mention:</h4>
                    <p 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: highlightBrand(mention.content, mention.brandName)
                      }}
                    />
                  </div>

                  {mention.context && (
                    <div className="text-black/80">
                      <h5 className="text-xs font-medium text-black/70 mb-1">Context:</h5>
                      <p className="text-sm leading-relaxed bg-gray-50 p-2 rounded text-black/80">
                        {truncateText(mention.context)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-black/70">
                    <span className="flex items-center gap-1">
                      <span>Position #{mention.position}</span>
                    </span>
                    <span>•</span>
                    <span>{mention.queryCategory}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      Score: {mention.sentimentScore}/100
                    </span>
                  </div>
                  
                  {mention.responseText && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Full Response
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Load More */}
            <div className="text-center pt-4">
              <Link href="/dashboard/responses">
                <Button variant="outline">
                  View All {totalMentions.toLocaleString()} Mentions
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}