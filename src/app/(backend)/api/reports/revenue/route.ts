import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Payment } from "@/lib/db/models/Payment";
import { requireRole } from "@/lib/auth/session";
import type { PipelineStage } from "mongoose";

// GET /api/reports/revenue?period=monthly|daily|yearly&year=2026&month=8
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, "admin");
    await connectDB();

    const period = req.nextUrl.searchParams.get("period") ?? "monthly";
    const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
    const month = Number(req.nextUrl.searchParams.get("month") ?? new Date().getMonth() + 1);

    let matchStage: PipelineStage.Match["$match"];
    let groupStage: PipelineStage.Group["$group"];

    if (period === "daily") {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      matchStage = { paymentStatus: "paid", createdAt: { $gte: startDate, $lte: endDate } };
      groupStage = {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      };
    } else if (period === "yearly") {
      matchStage = { paymentStatus: "paid" };
      groupStage = {
        _id: { year: { $year: "$createdAt" } },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      };
    } else {
      // monthly — default
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      matchStage = { paymentStatus: "paid", createdAt: { $gte: startDate, $lte: endDate } };
      groupStage = {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ];

    const [revenueByPeriod, totalRevenue, totalRefunds, methodBreakdown] = await Promise.all([
      Payment.aggregate(pipeline),
      Payment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: "refunded" } },
        { $group: { _id: null, total: { $sum: "$refundAmount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          revenueByPeriod,
          summary: {
            totalRevenue: totalRevenue[0]?.total ?? 0,
            totalTransactions: totalRevenue[0]?.count ?? 0,
            totalRefunds: totalRefunds[0]?.total ?? 0,
            refundCount: totalRefunds[0]?.count ?? 0,
            netRevenue: (totalRevenue[0]?.total ?? 0) - (totalRefunds[0]?.total ?? 0),
          },
          methodBreakdown,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
