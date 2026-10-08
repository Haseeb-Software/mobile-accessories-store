"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function fetchOrder() {
    setLoading(true);
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    setOrder(data.order);
    setLoading(false);
  }

  useEffect(() => { fetchOrder(); }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data.order);
      toast.success(`Order marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) return <p className="text-sm text-ink-500">Loading order...</p>;

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Order #{order.orderNumber}</h1>
        <span className="text-sm text-ink-400">{format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
      </div>

      <div className="card mb-4 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={updating || order.status === s}
              onClick={() => updateStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                order.status === s ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Customer</h2>
          <p className="text-sm font-medium text-ink-800">{order.customerName}</p>
          <p className="text-sm text-ink-500">{order.phone}</p>
          {order.email && <p className="text-sm text-ink-500">{order.email}</p>}
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Shipping Address</h2>
          <p className="text-sm text-ink-700">{order.address}</p>
          <p className="text-sm text-ink-700">{order.city}, {order.province} {order.postalCode}</p>
          {order.notes && <p className="mt-1 text-xs text-ink-400">Note: {order.notes}</p>}
        </div>
      </div>

      <div className="card mt-4 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Items</h2>
        <div className="space-y-2 text-sm">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between border-b border-ink-100 pb-2">
              <span className="text-ink-700">{item.productTitle} {item.variantLabel && `(${item.variantLabel})`} × {item.quantity}</span>
              <span className="font-medium text-ink-900">{formatCurrency(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-ink-600"><span>Shipping</span><span>{formatCurrency(order.shippingFee)}</span></div>
          {Number(order.discount) > 0 && <div className="flex justify-between text-emerald-600"><span>Discount ({order.couponCode})</span><span>-{formatCurrency(order.discount)}</span></div>}
          <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-bold text-ink-900"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
      </div>

      <div className="card mt-4 p-5 text-sm text-ink-600">
        <span className="font-medium text-ink-800">Payment:</span> {order.paymentMethod} — <span className="font-medium text-ink-800">{order.paymentStatus}</span>
      </div>
    </div>
  );
}
