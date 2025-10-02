import express, { Request, Response } from "express";
import config from "config";
import indexRouter from "./routers/index.router";
import swaggerDocs from "./utilitys/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Use the main router
app.use(indexRouter);

// Swagger documentation
swaggerDocs(app, config.get<number>("port"));

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
