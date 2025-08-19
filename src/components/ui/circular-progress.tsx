'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  showValue = true,
  color = 'primary',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    switch (color) {
      case 'success':
        return '#10B981'; // green-500
      case 'warning':
        return '#F59E0B'; // amber-500
      case 'destructive':
        return '#EF4444'; // red-500
      default:
        return '#2563EB'; // blue-600
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return 'text-green-600';
    }
    if (score >= 60) {
      return 'text-amber-600';
    }
    if (score >= 40) {
      return 'text-orange-600';
    }
    return 'text-red-600';
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ||
          (showValue && (
            <div className="text-center">
              <div className={cn('text-2xl font-bold', getScoreColor(value))}>
                {Math.round(value)}
              </div>
              <div className="text-xs text-gray-500 -mt-1">Score</div>
            </div>
          ))}
      </div>
    </div>
  );
}
