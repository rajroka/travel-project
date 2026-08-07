import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: "customer" | "staff" | "admin";
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ["customer", "staff", "admin"],
      required: true,
      unique: true,
    },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export const Role =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
