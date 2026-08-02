// models/TeamMember.ts
import mongoose, { Schema, model, models, Document } from "mongoose";

export type TeamRole = "admin" | "member";

export interface ITeamMember extends Document {
  ownerId:   mongoose.Types.ObjectId; // صاحب المتجر
  email:     string;
  name:      string;
  role:      TeamRole;
  status:    "pending" | "active" | "disabled";
  password:  string | null;           
  inviteToken: string | null;           
  inviteExpires: Date | null;
  createdAt: Date;
}

const TeamMemberSchema = new Schema(
  {
    ownerId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    email: {
      type:      String,
      required:  true,
      lowercase: true,
      trim:      true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    role: {
      type:    String,
      enum:    ["admin", "member"],
      default: "member",
    },
    status: {
      type:    String,
      enum:    ["pending", "active", "disabled"],
      default: "pending",
    },
    password: {
      type:    String,
      default: null,
    },
    inviteToken: {
      type:    String,
      default: null,
    },
    inviteExpires: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true }
);

// منع تكرار نفس الإيميل في نفس المتجر
TeamMemberSchema.index({ ownerId: 1, email: 1 }, { unique: true });

export const TeamMember =
  models.TeamMember || model<ITeamMember>("TeamMember", TeamMemberSchema);