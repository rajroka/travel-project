import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "staff" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  nationality?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: false, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    address: {
      street: String,
      city: String,
      country: String,
    },
    nationality: { type: String },
    dateOfBirth: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
