import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Booking } from "@/lib/db/models/Booking";
import { BookingDetail } from "@/lib/db/models/BookingDetail";
import { TourPackage } from "@/lib/db/models/TourPackage";
import { Notification } from "@/lib/db/models/Notification";
import { User } from "@/lib/db/models/User";
import { requireSession } from "@/lib/auth/session";
import { resolveMongoUser } from "@/lib/auth/resolve-user";
import { createBookingSchema, bookingQuerySchema } from "@/lib/validations/booking";
import { generateBookingNumber } from "@/lib/auth/auth";
import { paginate, paginationMeta } from "@/lib/utils/helpers";
import { sendMail, bookingConfirmationTemplate } from "@/lib/email/mailer";

// GET /api/bookings â€” customer sees own bookings; staff/admin sees all
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = bookingQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { page, limit, status, paymentStatus, packageId, destinationId, startDate, endDate, search, sort } = parsed.data;
    const { skip } = paginate(page, limit);

    const filter: Record<string, unknown> = {};

    // Customers only see their own bookings. Better Auth user ids are not the
    // same as the Mongoose User _id used by bookings, so resolve by email.
    if (session.role === "customer") {
      const mongoUser = await resolveMongoUser(session);
      filter.user = mongoUser._id;
    }

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (packageId) filter.package = packageId;

    if (destinationId) {
      const destPackages = await TourPackage.find({ destination: destinationId }).select("_id").lean();
      filter.package = { $in: destPackages.map((p) => p._id) };
      if (packageId) filter.package = packageId;
    }

    if (search) {
      if (session.role === "customer") {
        filter.bookingNumber = { $regex: search, $options: "i" };
      } else {
        const matchedUsers = await User.find({
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }).select("_id").lean();

        const matchedPackages = await TourPackage.find({
          title: { $regex: search, $options: "i" },
        }).select("_id").lean();

        filter.$or = [
          { bookingNumber: { $regex: search, $options: "i" } },
          { user: { $in: matchedUsers.map((u) => u._id) } },
          { package: { $in: matchedPackages.map((p) => p._id) } },
        ];
      }
    }

    if (startDate || endDate) {
      filter.travelDate = {};
      if (startDate) (filter.travelDate as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (filter.travelDate as Record<string, Date>).$lte = new Date(endDate);
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      travel_date: { travelDate: 1 },
      amount_high: { totalAmount: -1 },
      amount_low: { totalAmount: 1 },
    };

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort(sortMap[sort] ?? { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "firstName lastName email phone")
        .populate("package", "title slug coverImage price duration")
        .populate("approvedBy", "firstName lastName")
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return NextResponse.json(
      { success: true, data: { bookings, pagination: paginationMeta(total, page, limit) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("GET bookings error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/bookings â€” authenticated customers only
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    await connectDB();

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { packageId, travelDate, numberOfTravelers, specialRequests, travelers, emergencyContact, dietaryRequirements, medicalConditions } = parsed.data;

    // Resolve Mongoose user — creates record on first OAuth login
    const mongoUser = await resolveMongoUser(session);

    // Validate package exists and is active
    const pkg = await TourPackage.findById(packageId);
    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ success: false, message: "Package not found or unavailable" }, { status: 404 });
    }

    // Check traveler count
    if (numberOfTravelers > pkg.maxTravelers) {
      return NextResponse.json(
        { success: false, message: `Maximum ${pkg.maxTravelers} travelers allowed for this package` },
        { status: 400 }
      );
    }

    const effectivePrice = pkg.discountPrice ?? pkg.price;
    const totalAmount = effectivePrice * numberOfTravelers;
    const bookingNumber = generateBookingNumber();

    const booking = await Booking.create({
      bookingNumber,
      user: mongoUser._id,
      package: packageId,
      travelDate: new Date(travelDate),
      numberOfTravelers,
      totalAmount,
      specialRequests,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // Store traveler details
    await BookingDetail.create({
      booking: booking._id,
      travelers,
      emergencyContact,
      dietaryRequirements,
      medicalConditions,
    });

    // Increment totalBookings on package
    await TourPackage.findByIdAndUpdate(packageId, { $inc: { totalBookings: 1 } });

    // In-app notification for customer
    await Notification.create({
      user: mongoUser._id,
      type: "booking_confirmed",
      title: "Booking Received",
      message: `Your booking ${bookingNumber} for ${pkg.title} has been received and is pending confirmation.`,
      link: `/bookings/${booking._id}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    // Email confirmation
    const user = await User.findById(mongoUser._id);
    if (user) {
      sendMail({
        to: user.email,
        subject: `Booking Confirmation - ${bookingNumber}`,
        html: bookingConfirmationTemplate(
          user.firstName,
          bookingNumber,
          pkg.title,
          new Date(travelDate).toLocaleDateString(),
          totalAmount
        ),
        userId: String(mongoUser._id),
        templateType: "booking_confirmation",
      }).catch(console.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        data: { booking: { ...booking.toObject(), package: pkg } },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    console.error("POST booking error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
