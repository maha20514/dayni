// models/User.ts
import { Schema, model, Document, models } from 'mongoose';

export interface IUser extends Document {
  shopName: string;
  email: string;
  password: string;
  avatar?: string;                   

  plan: 'free' | 'basic' | 'pro';
  maxCustomers: number;
  subscriptionStart: Date;
  subscriptionEnd?: Date;
  isActive: boolean;
  lemonCustomerId?: string;
  lemonSubscriptionId?: string;
  provider: "credentials" | "google";
  isVerified: boolean,
  
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
    required: false,
    default: null 
  },

  avatar: { 
    type: String, 
    default: null,
  },

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
  },
  lemonCustomerId: {
  type: String,
  default: null,
},

lemonSubscriptionId: {
  type: String,
  default: null,
},
provider: {
  type: String,
  enum: ["credentials", "google"],
  default: "credentials",
},
isVerified: {
  type: Boolean,
  default: false,   
},
}, 
{ timestamps: true });


export const User = models.User || model<IUser>("User", UserSchema);