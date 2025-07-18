interface LogContext {
  userId?: string;
  organizationId?: string;
  projectId?: string;
  queryId?: string;
  executionId?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: string;
  environment: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty format for development
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context, null, 2)}` : '';
      const errorStr = entry.error ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : '';
      return `[${entry.level.toUpperCase()}] ${entry.message}${contextStr}${errorStr}`;
    }

    // Structured JSON for production
    return JSON.stringify(entry);
  }

  private createEntry(
    level: LogEntry['level'],
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context,
      error,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createEntry('info', message, context);
    console.log(this.formatLog(entry));
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.createEntry('warn', message, context);
    console.warn(this.formatLog(entry));
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const entry = this.createEntry('error', message, context, error);
    console.error(this.formatLog(entry));

    // In production, you might want to send to external service
    if (this.isProduction && process.env.SENTRY_DSN) {
      // Sentry integration would go here
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.createEntry('debug', message, context);
      console.debug(this.formatLog(entry));
    }
  }

  // Helper methods for common patterns
  queryExecution(message: string, queryId: string, executionId?: string, error?: Error): void {
    this.info(message, { queryId, executionId }, error);
  }

  userAction(message: string, userId: string, context?: LogContext): void {
    this.info(message, { userId, ...context });
  }

  systemHealth(message: string, context?: LogContext): void {
    this.info(message, { system: true, ...context });
  }

  payment(message: string, organizationId: string, context?: LogContext): void {
    this.info(message, { organizationId, payment: true, ...context });
  }
}

export const logger = new Logger();

// Export context type for use in other files
export type { LogContext };