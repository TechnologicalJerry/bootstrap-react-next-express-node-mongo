import { object, string, TypeOf, z, number } from "zod";

// Product creation schema
export const createProductSchema = object({
  body: object({
    name: string({
      required_error: "Product name is required"
    }).min(2, "Product name must be at least 2 characters")
      .max(100, "Product name cannot exceed 100 characters"),
    
    description: string({
      required_error: "Product description is required"
    }).min(10, "Product description must be at least 10 characters")
      .max(1000, "Product description cannot exceed 1000 characters"),
    
    price: number({
      required_error: "Product price is required"
    }).min(0, "Price cannot be negative"),
    
    category: z.enum([
      "electronics", 
      "clothing", 
      "books", 
      "home", 
      "sports", 
      "beauty", 
      "automotive", 
      "other"
    ], {
      required_error: "Product category is required"
    }),
    
    brand: string({
      required_error: "Product brand is required"
    }).min(2, "Brand name must be at least 2 characters")
      .max(50, "Brand name cannot exceed 50 characters"),
    
    stock: number({
      required_error: "Stock quantity is required"
    }).min(0, "Stock cannot be negative"),
    
    images: z.array(string().url("Image must be a valid URL")).optional(),
    
    tags: z.array(string().max(20, "Tag cannot exceed 20 characters")).optional(),
    
    isActive: z.boolean().optional()
  })
});

// Product update schema
export const updateProductSchema = object({
  body: object({
    name: string().min(2, "Product name must be at least 2 characters")
      .max(100, "Product name cannot exceed 100 characters").optional(),
    
    description: string().min(10, "Product description must be at least 10 characters")
      .max(1000, "Product description cannot exceed 1000 characters").optional(),
    
    price: number().min(0, "Price cannot be negative").optional(),
    
    category: z.enum([
      "electronics", 
      "clothing", 
      "books", 
      "home", 
      "sports", 
      "beauty", 
      "automotive", 
      "other"
    ]).optional(),
    
    brand: string().min(2, "Brand name must be at least 2 characters")
      .max(50, "Brand name cannot exceed 50 characters").optional(),
    
    stock: number().min(0, "Stock cannot be negative").optional(),
    
    images: z.array(string().url("Image must be a valid URL")).optional(),
    
    tags: z.array(string().max(20, "Tag cannot exceed 20 characters")).optional(),
    
    isActive: z.boolean().optional()
  })
});

// Product params schema
export const productParamsSchema = object({
  params: object({
    productId: string({
      required_error: "Product ID is required"
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format")
  })
});

// Product query schema for filtering and pagination
export const productQuerySchema = object({
  query: object({
    page: string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: string().regex(/^\d+$/, "Limit must be a number").optional(),
    search: string().optional(),
    category: z.enum([
      "electronics", 
      "clothing", 
      "books", 
      "home", 
      "sports", 
      "beauty", 
      "automotive", 
      "other"
    ]).optional(),
    minPrice: string().regex(/^\d+(\.\d+)?$/, "Min price must be a number").optional(),
    maxPrice: string().regex(/^\d+(\.\d+)?$/, "Max price must be a number").optional(),
    brand: string().optional(),
    sortBy: z.enum(["name", "price", "createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});

export type CreateProductInput = TypeOf<typeof createProductSchema>;
export type UpdateProductInput = TypeOf<typeof updateProductSchema>;
export type ProductParamsInput = TypeOf<typeof productParamsSchema>;
export type ProductQueryInput = TypeOf<typeof productQuerySchema>;

