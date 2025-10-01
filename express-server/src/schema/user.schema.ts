import { object, string, TypeOf, z } from "zod";

// User registration schema
export const createUserSchema = object({
  body: object({
    firstName: string({
      required_error: "First name is required"
    }).min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters"),
    
    lastName: string({
      required_error: "Last name is required"
    }).min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters"),
    
    email: string({
      required_error: "Email is required"
    }).email("Please provide a valid email address"),
    
    password: string({
      required_error: "Password is required"
    }).min(6, "Password must be at least 6 characters"),
    
    passwordConfirmation: string({
      required_error: "Password confirmation is required"
    }),
    
    gender: z.enum(["male", "female", "other"], {
      required_error: "Gender is required"
    })
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"]
  })
});

// User login schema
export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required"
    }).email("Please provide a valid email address"),
    
    password: string({
      required_error: "Password is required"
    }).min(1, "Password is required")
  })
});

// User update schema
export const updateUserSchema = object({
  body: object({
    firstName: string().min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters").optional(),
    
    lastName: string().min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters").optional(),
    
    gender: z.enum(["male", "female", "other"]).optional(),
    
    role: z.enum(["user", "admin"]).optional()
  })
});

// Change password schema
export const changePasswordSchema = object({
  body: object({
    currentPassword: string({
      required_error: "Current password is required"
    }),
    
    newPassword: string({
      required_error: "New password is required"
    }).min(6, "New password must be at least 6 characters"),
    
    newPasswordConfirmation: string({
      required_error: "New password confirmation is required"
    })
  }).refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "New passwords do not match",
    path: ["newPasswordConfirmation"]
  })
});

// User params schema
export const userParamsSchema = object({
  params: object({
    userId: string({
      required_error: "User ID is required"
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
  })
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>;
export type UpdateUserInput = TypeOf<typeof updateUserSchema>;
export type ChangePasswordInput = TypeOf<typeof changePasswordSchema>;
export type UserParamsInput = TypeOf<typeof userParamsSchema>;