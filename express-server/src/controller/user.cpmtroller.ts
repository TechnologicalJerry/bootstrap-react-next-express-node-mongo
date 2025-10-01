import { Request, Response } from "express";
import { omit } from "lodash";
import UserModel, { UserDocument } from "../models/user.model";
import { CreateUserInput, UpdateUserInput, UserParamsInput } from "../schema/user.schema";
import logger from "../utilitys/logger";

// Create user
export const createUserHandler = async (
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
    
    // Remove password from response
    const userResponse = omit(user.toJSON(), "password");
    
    logger.info(`User created successfully: ${user.email}`);
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse
    });
  } catch (error: any) {
    logger.error(`Error creating user: ${error.message}`);
    
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

// Get all users (admin only)
export const getAllUsersHandler = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const users = await UserModel.find({})
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await UserModel.countDocuments();
    
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    logger.error(`Error getting users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get user by ID
export const getUserHandler = async (
  req: Request<UserParamsInput["params"]>,
  res: Response
) => {
  try {
    const { userId } = req.params;
    
    const user = await UserModel.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user
    });
  } catch (error: any) {
    logger.error(`Error getting user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Update user
export const updateUserHandler = async (
  req: Request<UserParamsInput["params"], {}, UpdateUserInput["body"]>,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const user = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    logger.info(`User updated successfully: ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error: any) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Delete user
export const deleteUserHandler = async (
  req: Request<UserParamsInput["params"]>,
  res: Response
) => {
  try {
    const { userId } = req.params;
    
    const user = await UserModel.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    logger.info(`User deleted successfully: ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error: any) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get current user profile
export const getCurrentUserHandler = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user
    });
  } catch (error: any) {
    logger.error(`Error getting current user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
