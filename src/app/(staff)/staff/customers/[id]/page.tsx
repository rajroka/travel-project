"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft01Icon, Calendar03Icon, CreditCardIcon, UserAccountIcon } from "hugeicons-react";
import { formatUserName } from "@/lib/utils/formatters";

interface Customer {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  nationality?: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  bookingNumber: string;
  status: string;
  paymentStatus: string;
  travelDate: string;
  totalAmount: number;
  package: { title: string };
}

export default function StaffCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${id}`, { credentials: "include" }).then(r => r.json()),
      fetch(`/api/bookings?userId=${id}&limit=20`, { credentials: "include" }).then(r => r.json()),
    ]).then(([u, b]) => {
      if (u.success) setCustomer(u.data.user);
      if (b.success) setBookings(b.data.bookings);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>;

  if (!customer) return (
    <div className="flex flex-col items-center p-16 gap-3">
      <p className="text-gray-500">Customer not found.</p>
      <Link href="/staff/customers" className="text-sm text-blue-600 hover:underline">← All Customers</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft01Icon size={16} /> All Customers
      </button>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <UserAccountIcon size={24} className="text-blue-700" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{formatUserName(customer)}</h2>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {customer.phone && <div><p className="text-gray-400">Phone</p><p className="font-medium">{customer.phone}</p></div>}
              {customer.nationality && <div><p className="text-gray-400">Nationality</p><p className="font-medium">{customer.nationality}</p></div>}
              <div><p className="text-gray-400">Member since</p><p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Booking History ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-gray-400">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b._id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{b.package.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <Calendar03Icon size={12} />{new Date(b.travelDate).toLocaleDateString()}
                        <CreditCardIcon size={12} />${b.totalAmount}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-fit">
          <h2 className="mb-4 font-semibold text-gray-900">Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Bookings</span><span className="font-semibold">{bookings.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Spent</span><span className="font-semibold text-blue-700">${bookings.reduce((s, b) => s + b.totalAmount, 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Confirmed</span><span className="font-semibold text-green-600">{bookings.filter(b => b.status === "confirmed").length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
