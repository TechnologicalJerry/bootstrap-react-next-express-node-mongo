import { Router } from "express";
import authRouter from "./auth.router";
import userRouter from "./user.router";
import productRouter from "./product.router";
import sessionRouter from "./session.router";

const router = Router();

// API version prefix
router.use("/api/v1", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Route all auth endpoints
router.use("/api/v1/auth", authRouter);

// Route all user endpoints
router.use("/api/v1/users", userRouter);

// Route all product endpoints
router.use("/api/v1/products", productRouter);

// Route all session endpoints
router.use("/api/v1/sessions", sessionRouter);

// API Documentation endpoint
router.get("/api/v1", (req, res) => {
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
      },
      sessions: {
        "GET /api/v1/sessions": "Get user sessions",
        "DELETE /api/v1/sessions/:sessionId": "Delete specific session",
        "DELETE /api/v1/sessions": "Delete all user sessions"
      }
    }
  });
});

export default router;
