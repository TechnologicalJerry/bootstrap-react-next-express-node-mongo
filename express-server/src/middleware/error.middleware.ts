import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import logger from "../utilitys/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  
  // Log error
  logger.error(`Error: ${message}`, {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent")
  });
  
  // Handle specific error types
  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    
    const errors = error.errors.map(err => ({
      field: err.path.join("."),
      message: err.message
    }));
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }
  
  // Handle MongoDB duplicate key error
  if (error.name === "MongoError" && (error as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
  }
  
  // Handle MongoDB validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }
  
  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  
  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  
  // Handle cast error (invalid ObjectId)
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      error: error.message
    })
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
