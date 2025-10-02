import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import log from "./logger";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Express Server API",
            version: "1.0.0",
            description: "Complete Express server with User CRUD, Product CRUD, JWT Authentication, and Session Management",
            contact: {
                name: "API Support",
                email: "support@example.com"
            }
        },
        servers: [
            {
                url: "http://localhost:5050",
                description: "Development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT Authorization header using the Bearer scheme"
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        email: { type: "string", format: "email" },
                        gender: { type: "string", enum: ["male", "female", "other"] },
                        role: { type: "string", enum: ["user", "admin"] },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                Product: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        price: { type: "number" },
                        category: { type: "string", enum: ["electronics", "clothing", "books", "home", "sports", "beauty", "automotive", "other"] },
                        brand: { type: "string" },
                        stock: { type: "number" },
                        images: { type: "array", items: { type: "string" } },
                        tags: { type: "array", items: { type: "string" } },
                        isActive: { type: "boolean" },
                        createdBy: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string" },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    message: { type: "string" }
                                }
                            }
                        }
                    }
                },
                Success: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string" },
                        data: { type: "object" }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routers/*.ts", "./src/controller/*.ts", "./src/schema/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Express Server API Documentation"
    }));
    
    app.get("/api-docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    log.info(`API Documentation available at http://localhost:${port}/api-docs`);
}

export default swaggerDocs;