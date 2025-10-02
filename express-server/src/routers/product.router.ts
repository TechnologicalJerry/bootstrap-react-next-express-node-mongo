import { Router } from "express";
import {
  createProductHandler,
  getAllProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getProductsByCategoryHandler
} from "../controller/product.controller";
import { authenticateToken, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productParamsSchema,
  productQuerySchema
} from "../schema/product.schema";

const router = Router();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - brand
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               price:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *                 enum: [electronics, clothing, books, home, sports, beauty, automotive, other]
 *               brand:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               stock:
 *                 type: number
 *                 minimum: 0
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 20
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 */
router.post("/", authenticateToken, validate(createProductSchema), asyncHandler(createProductHandler));

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of products per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, description, or brand
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [electronics, clothing, books, home, sports, beauty, automotive, other]
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, updatedAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/", optionalAuth, validate(productQuerySchema), asyncHandler(getAllProductsHandler));

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [electronics, clothing, books, home, sports, beauty, automotive, other]
 *         description: Product category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/category/:category", optionalAuth, asyncHandler(getProductsByCategoryHandler));

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Product not found
 */
router.get("/:productId", optionalAuth, validate(productParamsSchema), asyncHandler(getProductHandler));

/**
 * @swagger
 * /products/{productId}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               price:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *                 enum: [electronics, clothing, books, home, sports, beauty, automotive, other]
 *               brand:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               stock:
 *                 type: number
 *                 minimum: 0
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 20
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You can only update your own products
 *       404:
 *         description: Product not found
 */
router.put("/:productId", authenticateToken, validate(updateProductSchema), validate(productParamsSchema), asyncHandler(updateProductHandler));

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You can only delete your own products
 *       404:
 *         description: Product not found
 */
router.delete("/:productId", authenticateToken, validate(productParamsSchema), asyncHandler(deleteProductHandler));

export default router;

