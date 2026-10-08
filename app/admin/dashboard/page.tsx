"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  DollarSign, ShoppingCart, Clock, CheckCircle, XCircle, Package, AlertTriangle,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="input w-auto py-1.5 text-sm">
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {loading || !data ? (
        <p className="text-sm text-ink-500">Loading dashboard...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={DollarSign} label="Revenue" value={formatCurrency(data.revenue.total)} tone="success" />
            <StatCard icon={ShoppingCart} label="Total Orders" value={data.totals.totalOrders} />
            <StatCard icon={Clock} label="Pending Orders" value={data.totals.pendingOrders} tone="warning" />
            <StatCard icon={CheckCircle} label="Delivered Orders" value={data.totals.deliveredOrders} tone="success" />
            <StatCard icon={XCircle} label="Cancelled Orders" value={data.totals.cancelledOrders} tone="danger" />
            <StatCard icon={Package} label="Total Products" value={data.totals.totalProducts} />
            <StatCard icon={AlertTriangle} label="Low Stock Items" value={data.totals.lowStockCount} tone="warning" />
            <StatCard icon={DollarSign} label="Avg. Order Value" value={formatCurrency(data.revenue.averageOrderValue || 0)} />
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-500">Sales Overview</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Low Stock Products</h2>
              {data.lowStockProducts.length === 0 ? (
                <p className="text-sm text-ink-400">No low-stock products.</p>
              ) : (
                <div className="space-y-2">
                  {data.lowStockProducts.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-700">{p.title}</span>
                      <span className={p.stockQuantity === 0 ? "badge-danger" : "badge-warning"}>
                        {p.stockQuantity === 0 ? "Out of Stock" : `${p.stockQuantity} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">Recent Orders</h2>
                <Link href="/admin/orders" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {data.recentOrders.map((o: any) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-ink-50">
                    <span className="font-medium text-ink-800">#{o.orderNumber}</span>
                    <span className="text-ink-500">{o.customerName}</span>
                    <span className="font-semibold text-ink-900">{formatCurrency(o.total)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
