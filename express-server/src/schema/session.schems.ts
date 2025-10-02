import { object, string, TypeOf } from "zod";

// Session creation schema
export const createSessionSchema = object({
  body: object({
    email: string({
      required_error: "Email is required"
    }).email("Please provide a valid email address"),
    
    password: string({
      required_error: "Password is required"
    }).min(1, "Password is required")
  })
});

// Session params schema
export const sessionParamsSchema = object({
  params: object({
    sessionId: string({
      required_error: "Session ID is required"
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID format")
  })
});

export type CreateSessionInput = TypeOf<typeof createSessionSchema>;
export type SessionParamsInput = TypeOf<typeof sessionParamsSchema>;

