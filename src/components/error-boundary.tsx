'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with structured logging
    logger.error('React error boundary caught error', {
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
      errorStack: error.stack,
    }, error);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">Error Details:</p>
              <p className="text-xs text-gray-600 mt-1 font-mono">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={resetError} 
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Query-specific error boundary for better UX
export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={QueryErrorFallback}
      onError={(error, errorInfo) => {
        logger.error('Query execution error boundary triggered', {
          errorName: error.name,
          errorMessage: error.message,
          componentStack: errorInfo.componentStack,
        }, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function QueryErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Query execution failed</p>
            <p className="text-sm text-red-600">
              {error.message || 'An unexpected error occurred while running your query.'}
            </p>
          </div>
        </div>
        <Button 
          onClick={resetError} 
          variant="outline" 
          size="sm" 
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Query
        </Button>
      </CardContent>
    </Card>
  );
}