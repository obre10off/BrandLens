'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PieChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  className?: string;
  showLabels?: boolean;
  centerContent?: React.ReactNode;
}

export function PieChart({ 
  data, 
  size = 200, 
  className, 
  showLabels = false,
  centerContent 
}: PieChartProps) {
  // Calculate percentages and cumulative values
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const processedData = data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }));

  // Create pie segments
  const center = size / 2;
  const radius = size / 2 - 20; // Leave space for labels
  const innerRadius = size / 4; // For donut chart effect

  let cumulativePercentage = 0;
  const segments = processedData.map((item, index) => {
    const startAngle = (cumulativePercentage / 100) * 360 - 90; // Start from top
    const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360 - 90;
    
    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const x3 = center + innerRadius * Math.cos((endAngle * Math.PI) / 180);
    const y3 = center + innerRadius * Math.sin((endAngle * Math.PI) / 180);
    const x4 = center + innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const y4 = center + innerRadius * Math.sin((startAngle * Math.PI) / 180);

    const largeArcFlag = item.percentage > 50 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`, // Move to start point on outer circle
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc to end point on outer circle
      `L ${x3} ${y3}`, // Line to end point on inner circle
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Arc to start point on inner circle
      'Z' // Close path
    ].join(' ');

    cumulativePercentage += item.percentage;

    return {
      ...item,
      pathData,
      startAngle,
      endAngle
    };
  });

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} className="transform">
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={segment.pathData}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          </g>
        ))}
      </svg>
      
      {/* Center content */}
      {centerContent && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            width: innerRadius * 2, 
            height: innerRadius * 2, 
            left: center - innerRadius, 
            top: center - innerRadius 
          }}
        >
          {centerContent}
        </div>
      )}
      
      {/* Legend */}
      {showLabels && (
        <div className="mt-4 space-y-2">
          {processedData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.label}</span>
              <span className="text-gray-500 ml-auto">
                {Math.round(item.percentage || 0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DonutChartProps {
  data: PieChartData[];
  size?: number;
  className?: string;
  centerValue?: string | number;
  centerLabel?: string;
}

export function DonutChart({ 
  data, 
  size = 120, 
  className,
  centerValue,
  centerLabel
}: DonutChartProps) {
  const centerContent = centerValue && (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-800">{centerValue}</div>
      {centerLabel && <div className="text-xs text-gray-600 -mt-1">{centerLabel}</div>}
    </div>
  );

  return (
    <PieChart 
      data={data}
      size={size}
      className={className}
      centerContent={centerContent}
    />
  );
}