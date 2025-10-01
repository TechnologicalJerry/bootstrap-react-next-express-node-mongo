import { Express, Request, Response } from "express";
import cors from "cors";
import config from "config";

// Import controllers
import {
  createUserHandler,
  getAllUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getCurrentUserHandler
} from "./controller/user.cpmtroller";

import {
  createProductHandler,
  getAllProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getProductsByCategoryHandler
} from "./controller/product.controller";

import {
  signUpHandler,
  signInHandler,
  signOutHandler,
  refreshTokenHandler,
  changePasswordHandler
} from "./controller/auth.controller";

// Import middleware
import { authenticateToken, requireAdmin, optionalAuth } from "./middleware/auth.middleware";
import { validate } from "./middleware/validate.middleware";
import { asyncHandler } from "./middleware/error.middleware";

// Import schemas
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userParamsSchema
} from "./schema/user.schema";

import {
  createProductSchema,
  updateProductSchema,
  productParamsSchema,
  productQuerySchema
} from "./schema/product.schema";

import { createSessionSchema } from "./schema/session.schems";

function routes(app: Express) {
  // CORS configuration
  app.use(cors({
    origin: config.get<string>("corsOrigin"),
    credentials: true
  }));

  // Health check
  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  // API Routes
  app.use("/api/v1", (req: Request, res: Response, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
  });

  // Authentication routes
  app.post("/api/v1/auth/signup", validate(createUserSchema), asyncHandler(signUpHandler));
  app.post("/api/v1/auth/signin", validate(loginUserSchema), asyncHandler(signInHandler));
  app.post("/api/v1/auth/signout", authenticateToken, asyncHandler(signOutHandler));
  app.post("/api/v1/auth/refresh", asyncHandler(refreshTokenHandler));
  app.post("/api/v1/auth/change-password", authenticateToken, validate(changePasswordSchema), asyncHandler(changePasswordHandler));

  // User routes
  app.get("/api/v1/users", authenticateToken, requireAdmin, asyncHandler(getAllUsersHandler));
  app.get("/api/v1/users/me", authenticateToken, asyncHandler(getCurrentUserHandler));
  app.get("/api/v1/users/:userId", authenticateToken, validate(userParamsSchema), asyncHandler(getUserHandler));
  app.put("/api/v1/users/:userId", authenticateToken, validate(updateUserSchema), validate(userParamsSchema), asyncHandler(updateUserHandler));
  app.delete("/api/v1/users/:userId", authenticateToken, requireAdmin, validate(userParamsSchema), asyncHandler(deleteUserHandler));

  // Product routes
  app.post("/api/v1/products", authenticateToken, validate(createProductSchema), asyncHandler(createProductHandler));
  app.get("/api/v1/products", optionalAuth, validate(productQuerySchema), asyncHandler(getAllProductsHandler));
  app.get("/api/v1/products/category/:category", optionalAuth, asyncHandler(getProductsByCategoryHandler));
  app.get("/api/v1/products/:productId", optionalAuth, validate(productParamsSchema), asyncHandler(getProductHandler));
  app.put("/api/v1/products/:productId", authenticateToken, validate(updateProductSchema), validate(productParamsSchema), asyncHandler(updateProductHandler));
  app.delete("/api/v1/products/:productId", authenticateToken, validate(productParamsSchema), asyncHandler(deleteProductHandler));

  // API Documentation
  app.get("/api/v1", (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Express Server API",
      version: "1.0.0",
      endpoints: {
        auth: {
          "POST /api/v1/auth/signup": "Register a new user",
          "POST /api/v1/auth/signin": "Login user",
          "POST /api/v1/auth/signout": "Logout user",
          "POST /api/v1/auth/refresh": "Refresh access token",
          "POST /api/v1/auth/change-password": "Change user password"
        },
        users: {
          "GET /api/v1/users": "Get all users (admin only)",
          "GET /api/v1/users/me": "Get current user profile",
          "GET /api/v1/users/:userId": "Get user by ID",
          "PUT /api/v1/users/:userId": "Update user",
          "DELETE /api/v1/users/:userId": "Delete user (admin only)"
        },
        products: {
          "POST /api/v1/products": "Create product",
          "GET /api/v1/products": "Get all products with filtering",
          "GET /api/v1/products/category/:category": "Get products by category",
          "GET /api/v1/products/:productId": "Get product by ID",
          "PUT /api/v1/products/:productId": "Update product",
          "DELETE /api/v1/products/:productId": "Delete product"
        }
      }
    });
  });
}

export default routes;