// models/User.ts
import { Schema, model, Document, models } from 'mongoose';

export interface IUser extends Document {
  shopName: string;
  email: string;
  password: string;
  avatar?: string;                    // ← أضف هذا

  // نظام الاشتراكات
  plan: 'free' | 'basic' | 'pro';
  maxCustomers: number;
  subscriptionStart: Date;
  subscriptionEnd?: Date;
  isActive: boolean;
}

const UserSchema = new Schema({
  shopName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },

  // ← أضف هذا السطر
  avatar: { 
    type: String, 
    default: "/default-avatar.png" 
  },

  // نظام الاشتراكات
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro'],
    default: 'free'
  },
  maxCustomers: {
    type: Number,
    default: 10
  },
  subscriptionStart: {
    type: Date,
    default: Date.now
  },
  subscriptionEnd: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, 
{ timestamps: true });

UserSchema.index({ email: 1 });

export const User = models.User || model<IUser>("User", UserSchema);