import { Express, Request, Response } from "express";
import cors from "cors";
import config from "config";
import indexRouter from "./routers/index.router";

function routes(app: Express) {
  // CORS configuration
  app.use(cors({
    origin: config.get<string>("corsOrigin"),
    credentials: true
  }));

  // Health check
  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  // Use the main router
  app.use(indexRouter);
}

export default routes;