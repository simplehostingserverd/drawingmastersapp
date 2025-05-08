'use client';

import { trace, context } from '@opentelemetry/api';

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  traceId?: string;
  spanId?: string;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false,
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
};

class Logger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    if (this.config.enableRemote) {
      this.startFlushTimer();
    }
  }

  // Set configuration
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enableRemote) {
      this.startFlushTimer();
    } else if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Start flush timer
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Flush logs to remote endpoint
  private async flush(): Promise<void> {
    if (!this.config.enableRemote || this.logQueue.length === 0) return;
    
    const logs = [...this.logQueue];
    this.logQueue = [];
    
    try {
      await fetch(this.config.remoteEndpoint || '/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      // If sending fails, add logs back to queue
      this.logQueue = [...logs, ...this.logQueue];
      console.error('Failed to send logs to remote endpoint:', error);
    }
  }

  // Create a log entry
  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    // Get trace and span IDs from OpenTelemetry
    let traceId: string | undefined;
    let spanId: string | undefined;
    
    const span = trace.getSpan(context.active());
    if (span) {
      const spanContext = span.spanContext();
      traceId = spanContext.traceId;
      spanId = spanContext.spanId;
    }
    
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId,
      spanId,
    };
  }

  // Log a message
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Skip if level is below minimum
    if (this.getLevelValue(level) < this.getLevelValue(this.config.minLevel)) {
      return;
    }
    
    const entry = this.createLogEntry(level, message, context);
    
    // Log to console if enabled
    if (this.config.enableConsole) {
      const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                           level === LogLevel.WARN ? 'warn' : 
                           level === LogLevel.INFO ? 'info' : 'debug';
      
      console[consoleMethod](
        `[${entry.timestamp}] [${level.toUpperCase()}]${entry.traceId ? ` [trace=${entry.traceId.slice(0, 8)}...]` : ''} ${message}`,
        context || ''
      );
    }
    
    // Add to queue if remote logging is enabled
    if (this.config.enableRemote) {
      this.logQueue.push(entry);
      
      // Flush if queue is full
      if (this.logQueue.length >= (this.config.batchSize || 10)) {
        this.flush();
      }
    }
  }

  // Get numeric value for log level
  private getLevelValue(level: LogLevel): number {
    switch (level) {
      case LogLevel.DEBUG: return 0;
      case LogLevel.INFO: return 1;
      case LogLevel.WARN: return 2;
      case LogLevel.ERROR: return 3;
      default: return 1;
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorContext = error ? {
      ...context,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
    } : context;
    
    this.log(LogLevel.ERROR, message, errorContext);
  }
}

// Create a singleton instance
export const logger = new Logger();

export default logger;