import express, { Request, Response } from "express";
import config from "config";
import connect from "./utilitys/connectDb";
import routes from "./routes";
import swaggerDocs from "./utilitys/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = config.get<number>("port");

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

app.listen(PORT, async () => {
  console.log(`Server is running on PORT = ${PORT}`);
  console.log(`Environment: ${config.get<string>("nodeEnv")}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  
  await connect();
  routes(app);
  swaggerDocs(app, PORT);
  
  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);
});
