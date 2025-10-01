import mongoose, { Document, Schema } from "mongoose";

export interface SessionInput {
  user: string; // User ID
  userAgent: string;
  valid: boolean;
}

export interface SessionDocument extends SessionInput, Document {
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
    userAgent: {
      type: String,
      required: [true, "User agent is required"]
    },
    valid: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for better performance
sessionSchema.index({ user: 1 });
sessionSchema.index({ valid: 1 });

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default SessionModel;