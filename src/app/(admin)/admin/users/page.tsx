"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserGroupIcon } from "hugeicons-react";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: "customer" | "staff" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700",
  staff: "bg-purple-50 text-purple-700",
  admin: "bg-red-50 text-red-600",
};

function getUserName(user: { name?: string; firstName?: string; lastName?: string }): string {
  if (user?.name) return user.name;
  return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "—";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  function fetchUsers(role: string, q: string) {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (role !== "all") params.set("role", role);
    if (q) params.set("search", q);
    fetch(`/api/users?${params}`, { credentials: "include" })
      .then(r => r.json())
      .then(j => { if (j.success) setUsers(j.data.users); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchUsers(roleFilter, search); }, [roleFilter]);

  async function toggleActive(id: string, current: boolean) {
    setUpdating(id);
    await fetch(`/api/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !current }),
    });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !current } : u));
    setUpdating(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all system users</p>
        </div>
        <Link href="/admin/users/staff/new" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition">
          + Add Staff
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {["all", "customer", "staff", "admin"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                roleFilter === r ? "bg-blue-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >{r}</button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); fetchUsers(roleFilter, search); }} className="flex flex-1 gap-2">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button type="submit" className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition">Search</button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <UserGroupIcon size={48} className="mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {getUserName(u)}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(u._id, u.isActive)}
                        disabled={updating === u._id}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold text-white transition disabled:opacity-50 ${
                          u.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {updating === u._id ? "…" : u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
