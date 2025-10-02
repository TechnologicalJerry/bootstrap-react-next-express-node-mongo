import { Request, Response } from "express";
import ProductModel, { ProductDocument } from "../models/product.model";
import { CreateProductInput, UpdateProductInput, ProductParamsInput, ProductQueryInput } from "../schema/product.schema";
import logger from "../utilitys/logger";

// Create product
export const createProductHandler = async (
  req: Request<{}, {}, CreateProductInput["body"]>,
  res: Response
) => {
  try {
    const productData = {
      ...req.body,
      createdBy: res.locals.user._id
    };
    
    const product = await ProductModel.create(productData);
    
    logger.info(`Product created successfully: ${product.name} by ${res.locals.user.email}`);
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error: any) {
    logger.error(`Error creating product: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all products with filtering and pagination
export const getAllProductsHandler = async (
  req: Request<{}, {}, {}, ProductQueryInput["query"]>,
  res: Response
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter object
    const filter: any = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    const products = await ProductModel.find(filter)
      .populate("createdBy", "firstName lastName email")
      .skip(skip)
      .limit(limitNum)
      .sort(sort);
    
    const total = await ProductModel.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    logger.error(`Error getting products: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get product by ID
export const getProductHandler = async (
  req: Request<ProductParamsInput["params"]>,
  res: Response
) => {
  try {
    const { productId } = req.params;
    
    const product = await ProductModel.findById(productId)
      .populate("createdBy", "firstName lastName email");
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product
    });
  } catch (error: any) {
    logger.error(`Error getting product: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Update product
export const updateProductHandler = async (
  req: Request<ProductParamsInput["params"], {}, UpdateProductInput["body"]>,
  res: Response
) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    
    // Check if user is the creator or admin
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    if (product.createdBy.toString() !== res.locals.user._id && res.locals.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products"
      });
    }
    
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "firstName lastName email");
    
    logger.info(`Product updated successfully: ${updatedProduct?.name}`);
    
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error: any) {
    logger.error(`Error updating product: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Delete product
export const deleteProductHandler = async (
  req: Request<ProductParamsInput["params"]>,
  res: Response
) => {
  try {
    const { productId } = req.params;
    
    // Check if user is the creator or admin
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    if (product.createdBy.toString() !== res.locals.user._id && res.locals.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products"
      });
    }
    
    await ProductModel.findByIdAndDelete(productId);
    
    logger.info(`Product deleted successfully: ${product.name}`);
    
    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error: any) {
    logger.error(`Error deleting product: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get products by category
export const getProductsByCategoryHandler = async (
  req: Request<{ category: string }>,
  res: Response
) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const products = await ProductModel.find({ 
      category, 
      isActive: true 
    })
      .populate("createdBy", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await ProductModel.countDocuments({ category, isActive: true });
    
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    logger.error(`Error getting products by category: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

