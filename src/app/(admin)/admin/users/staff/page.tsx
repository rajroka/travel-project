"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserAccountIcon } from "hugeicons-react";

interface Staff {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

function getStaffName(s: { name?: string; firstName?: string; lastName?: string }): string {
  if (s?.name) return s.name;
  return `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.trim() || "—";
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/staff", { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setStaff(j.data.staff); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, current: boolean) {
    setUpdating(id);
    await fetch(`/api/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !current }),
    });
    setStaff(prev => prev.map(s => s._id === id ? { ...s, isActive: !current } : s));
    setUpdating(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Members</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your company staff</p>
        </div>
        <Link href="/admin/users/staff/new" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition">
          + Add Staff
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center py-14">
            <UserAccountIcon size={48} className="mb-3 text-gray-300" />
            <p className="text-gray-400 text-sm">No staff members yet.</p>
            <Link href="/admin/users/staff/new" className="mt-3 text-sm text-blue-600 hover:underline">Add your first staff member</Link>
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
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {s.name ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{s.email}</td>
                  <td className="px-5 py-3 text-gray-400">{s.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(s._id, s.isActive)} disabled={updating === s._id}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold text-white transition disabled:opacity-50 ${
                        s.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {updating === s._id ? "…" : s.isActive ? "Deactivate" : "Activate"}
                    </button>
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
