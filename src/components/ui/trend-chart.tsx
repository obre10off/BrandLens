'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
}

export function TrendChart({
  data,
  className,
  width = 120,
  height = 40,
  color = '#2563EB',
  fillOpacity = 0.1,
  strokeWidth = 2,
}: TrendChartProps) {
  if (data.length < 2) {
    return null;
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  // Create SVG path
  const pathData = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create area path (filled)
  const areaData = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className={cn('inline-block', className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Filled area */}
        <path
          d={areaData}
          fill={color}
          fillOpacity={fillOpacity}
          className="transition-all duration-300"
        />
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((value - minValue) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={2}
              fill={color}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  trend: 'up' | 'down' | 'stable';
  className?: string;
}

export function Sparkline({ data, trend, className }: SparklineProps) {
  const getColor = () => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <TrendChart
      data={data}
      color={getColor()}
      width={60}
      height={24}
      strokeWidth={1.5}
      fillOpacity={0.2}
      className={className}
    />
  );
}
