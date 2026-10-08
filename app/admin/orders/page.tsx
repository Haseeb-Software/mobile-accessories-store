"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "badge-warning",
  CONFIRMED: "badge bg-blue-50 text-blue-700",
  PROCESSING: "badge bg-indigo-50 text-indigo-700",
  SHIPPED: "badge bg-purple-50 text-purple-700",
  DELIVERED: "badge-success",
  CANCELLED: "badge-danger",
  RETURNED: "badge bg-ink-100 text-ink-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setLoading(false);
  }, [search, status, from, to, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function exportExcel() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.open(`/api/orders/export?${params.toString()}`, "_blank");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">Orders</h1>
        <button onClick={exportExcel} className="btn-outline text-sm"><Download size={16} className="mr-1 inline" />Export to Excel</button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input className="input pl-9" placeholder="Search order #, name, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-400">No orders found.</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="cursor-pointer hover:bg-ink-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-brand-600">#{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-3 text-ink-700">{o.customerName}</td>
                <td className="px-4 py-3 text-ink-500">{o.phone}</td>
                <td className="px-4 py-3 text-ink-500">{o.items.reduce((s: number, i: any) => s + i.quantity, 0)}</td>
                <td className="px-4 py-3 font-medium text-ink-900">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 text-ink-500">{o.paymentMethod}</td>
                <td className="px-4 py-3"><span className={STATUS_STYLES[o.status]}>{o.status}</span></td>
                <td className="px-4 py-3 text-ink-400">{format(new Date(o.createdAt), "MMM d, yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline px-4 py-1.5 text-sm disabled:opacity-40">Previous</button>
          <span className="px-2 py-1.5 text-sm text-ink-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-4 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
