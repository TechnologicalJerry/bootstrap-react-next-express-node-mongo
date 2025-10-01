import mongoose, { Document, Schema } from "mongoose";

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
  createdBy: string; // User ID who created the product
}

export interface ProductDocument extends ProductInput, Document {
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Product description must be at least 10 characters"],
      maxlength: [1000, "Product description cannot exceed 1000 characters"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      enum: ["electronics", "clothing", "books", "home", "sports", "beauty", "automotive", "other"]
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
      minlength: [2, "Brand name must be at least 2 characters"],
      maxlength: [50, "Brand name cannot exceed 50 characters"]
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    images: [{
      type: String,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Image URL must be a valid image URL"
      }
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: [20, "Tag cannot exceed 20 characters"]
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product creator is required"]
    }
  },
  {
    timestamps: true
  }
);

// Index for better search performance
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdBy: 1 });

const ProductModel = mongoose.model<ProductDocument>("Product", productSchema);

export default ProductModel;
