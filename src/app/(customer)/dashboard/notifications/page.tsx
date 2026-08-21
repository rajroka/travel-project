"use client";

import { useEffect, useState } from "react";
import { Notification01Icon, Tick01Icon } from "hugeicons-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications?limit=30", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setNotifications(json.data.notifications); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH", credentials: "include" });
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <Tick01Icon size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-white py-14 text-center shadow-sm">
          <Notification01Icon size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`cursor-pointer rounded-xl border p-4 transition hover:bg-gray-50 ${
                n.isRead ? "border-gray-100 bg-white" : "border-blue-100 bg-blue-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${n.isRead ? "text-gray-700" : "text-gray-900"}`}>{n.title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                </div>
                {!n.isRead && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />}
              </div>
              <p className="mt-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
