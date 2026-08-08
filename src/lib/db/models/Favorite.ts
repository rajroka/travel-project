import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  destination: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ user: 1, destination: 1 }, { unique: true });

export const Favorite =
  mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);
