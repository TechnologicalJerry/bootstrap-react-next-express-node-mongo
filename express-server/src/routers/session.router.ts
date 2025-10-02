import { Router } from "express";
import { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import { sessionParamsSchema } from "../schema/session.schems";
import SessionModel from "../models/session.model";
import logger from "../utilitys/logger";

const router = Router();

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get user sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user._id;
    
    const sessions = await SessionModel.find({ 
      user: userId, 
      valid: true 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: "Sessions retrieved successfully",
      data: {
        sessions: sessions.map(session => ({
          _id: session._id,
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          isCurrent: session._id.toString() === res.locals.user.sessionId
        }))
      }
    });
  } catch (error: any) {
    logger.error(`Error getting sessions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}));

/**
 * @swagger
 * /sessions/{sessionId}:
 *   delete:
 *     summary: Delete specific session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.delete("/:sessionId", authenticateToken, validate(sessionParamsSchema), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = res.locals.user._id;
    
    const session = await SessionModel.findOneAndUpdate(
      { 
        _id: sessionId, 
        user: userId, 
        valid: true 
      },
      { valid: false },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    
    logger.info(`Session invalidated: ${sessionId} for user: ${res.locals.user.email}`);
    
    res.status(200).json({
      success: true,
      message: "Session deleted successfully"
    });
  } catch (error: any) {
    logger.error(`Error deleting session: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}));

/**
 * @swagger
 * /sessions:
 *   delete:
 *     summary: Delete all user sessions (except current)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All other sessions deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.delete("/", authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user._id;
    const currentSessionId = res.locals.user.sessionId;
    
    // Invalidate all sessions except current one
    const result = await SessionModel.updateMany(
      { 
        user: userId, 
        _id: { $ne: currentSessionId },
        valid: true 
      },
      { valid: false }
    );
    
    logger.info(`All other sessions invalidated for user: ${res.locals.user.email}, affected: ${result.modifiedCount}`);
    
    res.status(200).json({
      success: true,
      message: "All other sessions deleted successfully",
      data: {
        deletedSessions: result.modifiedCount
      }
    });
  } catch (error: any) {
    logger.error(`Error deleting all sessions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}));

export default router;

