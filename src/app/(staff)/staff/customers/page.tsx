"use client";

import { useEffect, useState } from "react";
import { UserGroupIcon } from "hugeicons-react";
import { formatUserName } from "@/lib/utils/formatters";

interface Customer {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function fetchCustomers(q: string) {
    setLoading(true);
    const params = new URLSearchParams({ role: "customer", limit: "100" });
    if (q) params.set("search", q);
    fetch(`/api/users?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.success) setCustomers(j.data.users); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCustomers(""); }, []);

  function getName(c: Customer): string {
    return formatUserName(c);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">{customers.length} registered customers</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(search); }} className="mb-5 flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        <button type="submit" className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition">
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center py-14">
            <UserGroupIcon size={48} className="mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">No customers found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-900">{getName(c)}</td>
                  <td className="px-5 py-3 text-gray-500">{c.email}</td>
                  <td className="px-5 py-3 text-gray-400">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
