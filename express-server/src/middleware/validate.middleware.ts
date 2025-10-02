import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import logger from "../utilitys/logger";

// Generic validation middleware
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join("."),
          message: err.message
        }));
        
        logger.warn(`Validation error: ${JSON.stringify(errors)}`);
        
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors
        });
      }
      
      next(error);
    }
  };
};

