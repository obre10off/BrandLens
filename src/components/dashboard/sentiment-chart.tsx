'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface SentimentChartProps {
  data: SentimentData[];
}

export default function SentimentChart({ data }: SentimentChartProps) {
  // Calculate the max value for scaling
  const maxValue = Math.max(...data.map(d => d.total), 1);

  // Get sentiment trend
  const getTrend = () => {
    if (data.length < 2) {
      return null;
    }

    const recent = data.slice(-7);
    const older = data.slice(-14, -7);

    const recentPositiveRate =
      recent.reduce((sum, d) => sum + d.positive / Math.max(d.total, 1), 0) /
      recent.length;
    const olderPositiveRate =
      older.reduce((sum, d) => sum + d.positive / Math.max(d.total, 1), 0) /
      older.length;

    const change =
      ((recentPositiveRate - olderPositiveRate) /
        Math.max(olderPositiveRate, 0.01)) *
      100;

    return {
      change,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral',
    };
  };

  const trend = getTrend();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-black">Sentiment Over Time</CardTitle>
            <CardDescription className="text-black">
              Daily sentiment analysis for the last 30 days
            </CardDescription>
          </div>
          {trend && (
            <div className="flex items-center gap-2">
              {trend.trend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : trend.trend === 'down' ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <Minus className="h-5 w-5 text-gray-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.trend === 'up'
                    ? 'text-green-600'
                    : trend.trend === 'down'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {Math.abs(trend.change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Simple bar chart */}
          <div className="flex items-end gap-1 h-40">
            {data.slice(-30).map((day, index) => {
              const height = (day.total / maxValue) * 100;
              const positiveHeight = (day.positive / maxValue) * 100;
              const neutralHeight = (day.neutral / maxValue) * 100;
              const negativeHeight = (day.negative / maxValue) * 100;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center"
                  title={`${day.date}: ${day.total} mentions`}
                >
                  <div
                    className="w-full bg-gray-200 rounded-t flex flex-col justify-end overflow-hidden"
                    style={{ height: `${height}%`, minHeight: '2px' }}
                  >
                    {negativeHeight > 0 && (
                      <div
                        className="w-full bg-red-500"
                        style={{
                          height: `${(negativeHeight / height) * 100}%`,
                        }}
                      />
                    )}
                    {neutralHeight > 0 && (
                      <div
                        className="w-full bg-gray-400"
                        style={{ height: `${(neutralHeight / height) * 100}%` }}
                      />
                    )}
                    {positiveHeight > 0 && (
                      <div
                        className="w-full bg-green-500"
                        style={{
                          height: `${(positiveHeight / height) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-black">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded" />
              <span className="text-xs text-black">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-xs text-black">Negative</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
