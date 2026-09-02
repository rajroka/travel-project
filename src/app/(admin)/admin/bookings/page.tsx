"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar03Icon,
  EyeIcon,
  Download01Icon,
  FilterIcon,
  UserIcon,
  PackageIcon,
  DollarCircleIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
} from "hugeicons-react";
import { formatUserName } from "@/lib/utils/formatters";

interface Booking {
  _id: string;
  bookingNumber: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: string;
  numberOfTravelers: number;
  totalAmount: number;
  travelDate: string;
  createdAt: string;
  specialRequests?: string;
  emergencyContact?: { name: string; phone: string };
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    phone?: string;
  } | null;
  package: {
    title: string;
    duration: { days: number; nights: number };
    destination?: { name: string };
  } | null;
  travelers?: Array<{
    firstName: string;
    lastName: string;
    age: number;
    passportNumber?: string;
  }>;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

const PAYMENT_STYLES: Record<string, string> = {
  unpaid: "bg-red-50 text-red-600",
  paid: "bg-green-50 text-green-700",
  partial: "bg-yellow-50 text-yellow-700",
  refunded: "bg-gray-100 text-gray-600",
};

function getUserName(user: Booking["user"]): string {
  return formatUserName(user, "N/A");
}

function exportToCSV(bookings: Booking[]) {
  const headers = [
    "Booking Number",
    "Customer Name",
    "Email",
    "Phone",
    "Package",
    "Travel Date",
    "Travelers",
    "Total Amount",
    "Payment Status",
    "Booking Status",
    "Special Requests",
    "Emergency Contact",
    "Booked On",
  ];

  const rows = bookings.map((b) => [
    b.bookingNumber,
    b.user ? getUserName(b.user) : "N/A",
    b.user?.email || "N/A",
    b.user?.phone || "N/A",
    b.package?.title || "N/A",
    new Date(b.travelDate).toLocaleDateString(),
    b.numberOfTravelers.toString(),
    `$${b.totalAmount}`,
    b.paymentStatus,
    b.status,
    b.specialRequests || "None",
    b.emergencyContact ? `${b.emergencyContact.name} (${b.emergencyContact.phone})` : "N/A",
    new Date(b.createdAt).toLocaleDateString(),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [packages, setPackages] = useState<Array<{ _id: string; title: string }>>([]);
  const [destinations, setDestinations] = useState<Array<{ _id: string; name: string }>>([]);

  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");
  const [exportStatus, setExportStatus] = useState("all");
  const [exportPayment, setExportPayment] = useState("all");
  const [exportPackage, setExportPackage] = useState("all");
  const [exportDestination, setExportDestination] = useState("all");

  const activeExtraFilters = useMemo(() => {
    let count = 0;
    if (packageFilter !== "all") count += 1;
    if (destinationFilter !== "all") count += 1;
    if (startDate) count += 1;
    if (endDate) count += 1;
    if (sort !== "newest") count += 1;
    return count;
  }, [packageFilter, destinationFilter, startDate, endDate, sort]);

  function fetchBookings() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "100");
    params.set("sort", sort);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter);
    if (packageFilter !== "all") params.set("packageId", packageFilter);
    if (destinationFilter !== "all") params.set("destinationId", destinationFilter);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    fetch(`/api/bookings?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setBookings(j.data.bookings);
          setSelectedIds([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/packages?limit=1000", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setPackages(j.data.packages);
      })
      .catch(console.error);

    fetch("/api/destinations?limit=1000", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setDestinations(j.data.destinations);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBookings(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentFilter, packageFilter, destinationFilter, startDate, endDate, sort, searchQuery]);

  async function updateStatus(id: string, status: string, cancelReason?: string) {
    setUpdating(id);
    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, cancelReason }),
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  async function bulkUpdateStatus(status: "confirmed" | "cancelled") {
    if (selectedIds.length === 0) return;
    let cancelReason: string | undefined;
    if (status === "cancelled") {
      const reason = window.prompt("Cancellation reason (optional):");
      if (reason === null) return;
      cancelReason = reason || undefined;
    }

    setBulkUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/bookings/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status, cancelReason }),
          })
        )
      );
      fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkUpdating(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookings.map((b) => b._id));
    }
  }

  function clearExtraFilters() {
    setPackageFilter("all");
    setDestinationFilter("all");
    setStartDate("");
    setEndDate("");
    setSort("newest");
  }

  async function handleExport() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "10000");

    if (exportStatus !== "all") params.set("status", exportStatus);
    if (exportPayment !== "all") params.set("paymentStatus", exportPayment);
    if (exportPackage !== "all") params.set("packageId", exportPackage);
    if (exportDestination !== "all") params.set("destinationId", exportDestination);
    if (exportDateFrom) params.set("startDate", exportDateFrom);
    if (exportDateTo) params.set("endDate", exportDateTo);

    try {
      const res = await fetch(`/api/bookings?${params}`, { credentials: "include" });
      const j = await res.json();
      if (j.success && j.data.bookings) {
        exportToCSV(j.data.bookings);
        setShowExportModal(false);
        setExportDateFrom("");
        setExportDateTo("");
        setExportStatus("all");
        setExportPayment("all");
        setExportPackage("all");
        setExportDestination("all");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review pending bookings, confirm trips, and export records
          </p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
        >
          <Download01Icon size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats — clickable filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Bookings",
            value: stats.total,
            icon: <Calendar03Icon size={28} className="text-blue-500" />,
            onClick: () => setStatusFilter("all"),
            active: statusFilter === "all",
          },
          {
            label: "Pending",
            value: stats.pending,
            valueClass: "text-yellow-600",
            icon: <Calendar03Icon size={28} className="text-yellow-500" />,
            onClick: () => setStatusFilter("pending"),
            active: statusFilter === "pending",
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            valueClass: "text-green-600",
            icon: <Calendar03Icon size={28} className="text-green-500" />,
            onClick: () => setStatusFilter("confirmed"),
            active: statusFilter === "confirmed",
          },
          {
            label: "Paid Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            valueClass: "text-teal-600",
            icon: <DollarCircleIcon size={28} className="text-teal-500" />,
            onClick: () => setPaymentFilter(paymentFilter === "paid" ? "all" : "paid"),
            active: paymentFilter === "paid",
          },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={card.onClick}
            className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-teal-300 ${
              card.active ? "border-teal-400 ring-2 ring-teal-100" : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`mt-1 text-2xl font-bold ${card.valueClass ?? "text-gray-900"}`}>
                  {card.value}
                </p>
              </div>
              {card.icon}
            </div>
          </button>
        ))}
      </div>

      {/* Search + compact filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search booking #, customer, email, or package..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-teal-400 sm:w-40"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-teal-400 sm:w-40"
            aria-label="Filter by payment"
          >
            <option value="all">All payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
          <button
            type="button"
            onClick={() => setShowMoreFilters((v) => !v)}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
              showMoreFilters || activeExtraFilters > 0
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FilterIcon size={15} />
            {activeExtraFilters > 0 ? `More (${activeExtraFilters})` : "More"}
          </button>
        </div>

        {showMoreFilters && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Sort by</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="travel_date">Travel date</option>
                  <option value="amount_high">Amount: high to low</option>
                  <option value="amount_low">Amount: low to high</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Travel from</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Travel to</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400"
                />
              </div>
              {packages.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Package</label>
                  <select
                    value={packageFilter}
                    onChange={(e) => setPackageFilter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400"
                  >
                    <option value="all">All packages</option>
                    {packages.map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {destinations.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Destination</label>
                  <select
                    value={destinationFilter}
                    onChange={(e) => setDestinationFilter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400"
                  >
                    <option value="all">All destinations</option>
                    {destinations.map((dest) => (
                      <option key={dest._id} value={dest._id}>
                        {dest.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {activeExtraFilters > 0 && (
              <button
                type="button"
                onClick={clearExtraFilters}
                className="mt-3 text-sm font-medium text-teal-600 hover:underline"
              >
                Clear extra filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.length} selected
          </span>
          <button
            type="button"
            disabled={bulkUpdating}
            onClick={() => bulkUpdateStatus("confirmed")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckmarkCircle01Icon size={14} />
            Confirm selected
          </button>
          <button
            type="button"
            disabled={bulkUpdating}
            onClick={() => bulkUpdateStatus("cancelled")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Cancel01Icon size={14} />
            Cancel selected
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs font-medium text-blue-700 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar03Icon size={48} className="mb-3 text-gray-300" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === bookings.length && bookings.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Select all bookings"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Booking #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Travel Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b._id)}
                        onChange={() => toggleSelect(b._id)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Select ${b.bookingNumber}`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {b.bookingNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <UserIcon size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {b.user ? getUserName(b.user) : "N/A"}
                          </p>
                          <p className="truncate text-xs text-gray-500">{b.user?.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <PackageIcon size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-medium text-gray-900">
                            {b.package?.title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {b.package?.duration?.days || 0}D / {b.package?.duration?.nights || 0}N ·{" "}
                            {b.numberOfTravelers} travelers
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(b.travelDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        ${b.totalAmount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium capitalize ${
                          PAYMENT_STYLES[b.paymentStatus] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b._id, e.target.value)}
                        disabled={updating === b._id}
                        className={`cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-medium capitalize outline-none transition ${STATUS_STYLES[b.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          <EyeIcon size={14} />
                          View
                        </button>
                        {b.status === "pending" && (
                          <button
                            type="button"
                            disabled={updating === b._id}
                            onClick={() => updateStatus(b._id, "confirmed")}
                            className="rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Customer Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.user ? getUserName(selectedBooking.user) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.user?.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.user?.email || "N/A"}
                    </p>
                  </div>
                  {selectedBooking.emergencyContact && (
                    <div>
                      <p className="text-xs text-gray-500">Emergency Contact</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.emergencyContact.name} -{" "}
                        {selectedBooking.emergencyContact.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Package Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Package Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.package?.title || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.package?.duration?.days || 0} Days /{" "}
                      {selectedBooking.package?.duration?.nights || 0} Nights
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Travel Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBooking.travelDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Number of Travelers</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.numberOfTravelers}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBooking.travelers && selectedBooking.travelers.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Travelers</h3>
                  <div className="space-y-2">
                    {selectedBooking.travelers.map((traveler, idx) => (
                      <div key={idx} className="rounded-lg bg-white p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {formatUserName(traveler)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Age: {traveler.age}{" "}
                          {traveler.passportNumber && `• Passport: ${traveler.passportNumber}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.specialRequests && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Special Requests</h3>
                  <p className="text-sm text-gray-700">{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Booking Summary</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Booking Number</p>
                    <p className="font-mono font-medium text-gray-900">
                      {selectedBooking.bookingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-teal-600">
                      ${selectedBooking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Status</p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium capitalize ${
                        PAYMENT_STYLES[selectedBooking.paymentStatus]
                      }`}
                    >
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Booking Status</p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[selectedBooking.status]
                      }`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Booked On</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBooking.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateStatus(selectedBooking._id, "confirmed");
                      setSelectedBooking(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <CheckmarkCircle01Icon size={16} />
                    Confirm booking
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = window.prompt("Cancellation reason (optional):");
                      if (reason === null) return;
                      updateStatus(selectedBooking._id, "cancelled", reason || undefined);
                      setSelectedBooking(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Cancel01Icon size={16} />
                    Cancel booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Export Bookings</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="mb-6 text-sm text-gray-600">
              Choose filters for the CSV export. Leave blank to export all bookings.
            </p>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    value={exportDateFrom}
                    onChange={(e) => setExportDateFrom(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    value={exportDateTo}
                    onChange={(e) => setExportDateTo(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Booking Status</label>
                <select
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment Status</label>
                <select
                  value={exportPayment}
                  onChange={(e) => setExportPayment(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {packages.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Package</label>
                  <select
                    value={exportPackage}
                    onChange={(e) => setExportPackage(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="all">All Packages</option>
                    {packages.map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {destinations.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Destination</label>
                  <select
                    value={exportDestination}
                    onChange={(e) => setExportDestination(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="all">All Destinations</option>
                    {destinations.map((dest) => (
                      <option key={dest._id} value={dest._id}>
                        {dest.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50"
                >
                  <Download01Icon size={16} />
                  {loading ? "Exporting..." : "Export CSV"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
