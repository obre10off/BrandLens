'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

export function PlatformIcon({
  platform,
  size = 20,
  className,
}: PlatformIconProps) {
  const style = { width: size, height: size };

  switch (platform.toLowerCase()) {
    case 'openai':
    case 'gpt':
    case 'chatgpt':
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-md bg-green-100 text-green-700 border border-green-200',
            className
          )}
          style={style}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zm-2.4569-16.2321a4.4755 4.4755 0 0 1 2.3347-1.9728V5.226a.7806.7806 0 0 0 .3927.6813l5.8428 3.3685-2.02 1.1686a.0757.0757 0 0 1-.071 0L2.4928 7.2806a4.504 4.504 0 0 1-1.9161-5.7966zm16.5567 3.9931l-5.8428-3.3685L14.4827 5.226a.0757.0757 0 0 1 .071 0l4.8536 2.7998a4.4992 4.4992 0 0 1-1.6259 8.4126v-2.3324a.7948.7948 0 0 0-.3927-.6813zm2.4569 1.7956l-.1419-.0804-4.7783-2.7582a.7712.7712 0 0 0-.7806 0L9.74 12.7465V10.414a.0804.0804 0 0 1 .0332-.0615l4.8536-2.7998a4.504 4.504 0 0 1 6.6802 4.66zM8.3065 15.7193L6.2866 14.5507a.071.071 0 0 1-.038-.052V8.9729a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0804L8.704 8.3578a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3324l2.602-1.4998 2.6019 1.4998v2.9994l-2.6019 1.4998-2.602-1.4998z" />
          </svg>
        </div>
      );

    case 'anthropic':
    case 'claude':
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-md bg-orange-100 text-orange-700 border border-orange-200',
            className
          )}
          style={style}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      );

    case 'google':
    case 'gemini':
    case 'bard':
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-md bg-blue-100 text-blue-700 border border-blue-200',
            className
          )}
          style={style}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        </div>
      );

    default:
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-md bg-gray-100 text-gray-700',
            className
          )}
          style={style}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      );
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'openai':
    case 'gpt':
    case 'chatgpt':
      return 'text-green-600';
    case 'anthropic':
    case 'claude':
      return 'text-orange-600';
    case 'google':
    case 'gemini':
    case 'bard':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}
