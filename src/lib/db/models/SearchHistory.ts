import mongoose, { Document, Schema } from "mongoose";

export interface ISearchHistory extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  query: string;
  searchType: "destination" | "package" | "general";
  filters?: Record<string, unknown>;
  resultsCount?: number;
  clickedResults?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    query: { type: String, required: true, trim: true, lowercase: true },
    searchType: {
      type: String,
      enum: ["destination", "package", "general"],
      default: "general",
    },
    filters: { type: Schema.Types.Mixed },
    resultsCount: { type: Number },
    clickedResults: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

SearchHistorySchema.index({ user: 1, createdAt: -1 });
SearchHistorySchema.index({ query: 1 });

export const SearchHistory =
  mongoose.models.SearchHistory ||
  mongoose.model<ISearchHistory>("SearchHistory", SearchHistorySchema);
