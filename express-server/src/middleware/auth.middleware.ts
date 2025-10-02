import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";
import UserModel from "../models/user.model";
import SessionModel from "../models/session.model";
import logger from "../utilitys/logger";

export interface AuthRequest extends Request {
  user?: any;
}

// JWT Authentication middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required"
      });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token,
      config.get<string>("jwtSecret")
    ) as { userId: string; sessionId: string };
    
    // Check if session is valid
    const session = await SessionModel.findOne({
      _id: decoded.sessionId,
      user: decoded.userId,
      valid: true
    });
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session"
      });
    }
    
    // Get user
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Add user and session info to request
    req.user = {
      ...user.toJSON(),
      sessionId: session._id
    };
    
    next();
  } catch (error: any) {
    logger.error(`Authentication error: ${error.message}`);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Admin authorization middleware
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }
  
  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(
      token,
      config.get<string>("jwtSecret")
    ) as { userId: string; sessionId: string };
    
    // Check if session is valid
    const session = await SessionModel.findOne({
      _id: decoded.sessionId,
      user: decoded.userId,
      valid: true
    });
    
    if (session) {
      // Get user
      const user = await UserModel.findById(decoded.userId).select("-password");
      if (user) {
        req.user = {
          ...user.toJSON(),
          sessionId: session._id
        };
      }
    }
    
    next();
  } catch (error: any) {
    // Continue without authentication if token is invalid
    next();
  }
};

