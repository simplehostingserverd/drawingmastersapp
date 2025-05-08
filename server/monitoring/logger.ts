import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport for error logs
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
  exitOnError: false,
});

// Create console logger for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format,
    }),
  );
}

// HTTP request logger middleware
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  // Start timer
  const start = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    // Calculate response time
    const responseTime = Date.now() - start;
    
    // Get request method, URL, status code, and response time
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    // Create log message
    const message = `${method} ${originalUrl} ${statusCode} ${responseTime}ms`;
    
    // Determine log level based on status code
    const level = statusCode >= 500 ? 'error' : 
                 statusCode >= 400 ? 'warn' : 
                 'http';
    
    // Log with additional metadata
    logger.log(level, message, {
      method,
      url: originalUrl,
      statusCode,
      responseTime,
      ip,
      userAgent: req.headers['user-agent'],
    });
  });
  
  next();
};

// Error logger middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    error: {
      message: err.message,
      name: err.name,
      stack: err.stack,
    },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  next(err);
};

export default logger;