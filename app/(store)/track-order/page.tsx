"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="container-app max-w-xl py-12">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Track Your Order</h1>
      <form onSubmit={search} className="flex gap-2">
        <input
          className="input"
          placeholder="Enter your order number, e.g. ORD-2026-00123"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <button className="btn-primary shrink-0" disabled={loading}>
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {order && (
        <div className="card mt-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-800">#{order.orderNumber}</span>
            <span className="badge-success">{order.status}</span>
          </div>

          {!["CANCELLED", "RETURNED"].includes(order.status) && (
            <div className="mb-5 flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${i <= currentStep ? "bg-brand-600" : "bg-ink-200"}`}
                  />
                  <span className="mt-1 text-center text-[10px] text-ink-500">{step}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-ink-600">{item.productTitle} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-ink-100 pt-3 text-base font-bold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
