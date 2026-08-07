import mongoose, { Document, Schema } from "mongoose";

export interface ITraveler {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationality?: string;
  passportNumber?: string;
  email?: string;
  phone?: string;
}

export interface IBookingDetail extends Document {
  booking: mongoose.Types.ObjectId;
  travelers: ITraveler[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  dietaryRequirements?: string;
  medicalConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TravelerSchema = new Schema<ITraveler>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: Date,
    nationality: String,
    passportNumber: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const BookingDetailSchema = new Schema<IBookingDetail>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    travelers: [TravelerSchema],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    dietaryRequirements: String,
    medicalConditions: String,
  },
  { timestamps: true }
);

export const BookingDetail =
  mongoose.models.BookingDetail ||
  mongoose.model<IBookingDetail>("BookingDetail", BookingDetailSchema);
