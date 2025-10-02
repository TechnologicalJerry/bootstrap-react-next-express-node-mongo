import { Request, Response } from "express";
import { omit } from "lodash";
import jwt from "jsonwebtoken";
import config from "config";
import UserModel, { UserDocument } from "../models/user.model";
import SessionModel from "../models/session.model";
import { CreateUserInput, LoginUserInput, ChangePasswordInput } from "../schema/user.schema";
import logger from "../utilitys/logger";

// Sign up user
export const signUpHandler = async (
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) => {
  try {
    const { passwordConfirmation, ...userData } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const user = await UserModel.create(userData);
    
    // Create session
    const session = await SessionModel.create({
      user: user._id,
      userAgent: req.get("User-Agent") || ""
    });
    
    // Create JWT token
    const accessToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      config.get<string>("jwtSecret"),
      { expiresIn: config.get<string>("jwtExpiresIn") }
    );
    
    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      config.get<string>("jwtRefreshSecret"),
      { expiresIn: config.get<string>("jwtRefreshExpiresIn") }
    );
    
    // Remove password from response
    const userResponse = omit(user.toJSON(), "password");
    
    logger.info(`User signed up successfully: ${user.email}`);
    
    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error: any) {
    logger.error(`Error signing up user: ${error.message}`);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Sign in user
export const signInHandler = async (
  req: Request<{}, {}, LoginUserInput["body"]>,
  res: Response
) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await UserModel.findOne({ email }).select("+password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    // Create session
    const session = await SessionModel.create({
      user: user._id,
      userAgent: req.get("User-Agent") || ""
    });
    
    // Create JWT token
    const accessToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      config.get<string>("jwtSecret"),
      { expiresIn: config.get<string>("jwtExpiresIn") }
    );
    
    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      config.get<string>("jwtRefreshSecret"),
      { expiresIn: config.get<string>("jwtRefreshExpiresIn") }
    );
    
    // Remove password from response
    const userResponse = omit(user.toJSON(), "password");
    
    logger.info(`User signed in successfully: ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error: any) {
    logger.error(`Error signing in user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Sign out user
export const signOutHandler = async (req: Request, res: Response) => {
  try {
    const sessionId = res.locals.user.sessionId;
    
    // Invalidate session
    await SessionModel.findByIdAndUpdate(sessionId, { valid: false });
    
    logger.info(`User signed out successfully: ${res.locals.user.email}`);
    
    res.status(200).json({
      success: true,
      message: "User signed out successfully"
    });
  } catch (error: any) {
    logger.error(`Error signing out user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Refresh token
export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required"
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      config.get<string>("jwtRefreshSecret")
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
        message: "Invalid refresh token"
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
    
    // Create new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      config.get<string>("jwtSecret"),
      { expiresIn: config.get<string>("jwtExpiresIn") }
    );
    
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error: any) {
    logger.error(`Error refreshing token: ${error.message}`);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
};

// Change password
export const changePasswordHandler = async (
  req: Request<{}, {}, ChangePasswordInput["body"]>,
  res: Response
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = res.locals.user._id;
    
    // Get user with password
    const user = await UserModel.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Invalidate all sessions except current one
    await SessionModel.updateMany(
      { user: userId, _id: { $ne: res.locals.user.sessionId } },
      { valid: false }
    );
    
    logger.info(`Password changed successfully for user: ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error: any) {
    logger.error(`Error changing password: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

