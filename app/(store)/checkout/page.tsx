"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils";

const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Kashmir", "Islamabad Capital Territory"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "Punjab",
    postalCode: "",
    notes: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount?: number; error?: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState<{ fee: number; freeThreshold: number } | null>(null);

  const sub = subtotal();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        setShipping({
          fee: s ? Number(s.standardShippingFee) : 200,
          freeThreshold: s ? Number(s.freeShippingThreshold) : 5000,
        });
      })
      .catch(() => setShipping({ fee: 200, freeThreshold: 5000 }));
  }, []);

  const shippingFee = shipping ? (sub >= shipping.freeThreshold ? 0 : shipping.fee) : 0;
  const discount = couponResult?.valid ? couponResult.discount || 0 : 0;
  const total = Math.max(0, sub + shippingFee - discount);

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: sub }),
      });
      const data = await res.json();
      setCouponResult(data);
      if (data.valid) toast.success("Coupon applied!");
      else toast.error(data.error || "Invalid coupon");
    } catch {
      toast.error("Could not validate coupon");
    } finally {
      setCheckingCoupon(false);
    }
  }

  function updateField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (form.customerName.trim().length < 2) errs.customerName = "Full name is required";
    if (!/^[0-9+\-\s]{10,}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (form.address.trim().length < 5) errs.address = "Complete address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.province) errs.province = "Province is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          couponCode: couponResult?.valid ? couponCode : undefined,
          items: items.map((i) => ({
            productId: i.productId,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clearCart();
      router.push(`/order-success/${data.order.orderNumber}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-24 text-center">
        <p className="text-ink-500">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-4 inline-block">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Checkout</h1>

      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-4 p-5">
            <h2 className="text-base font-bold text-ink-900">Contact & Shipping Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
                {errors.customerName && <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>}
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input className="input" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="03XX-XXXXXXX" />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email (optional)</label>
              <input className="input" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Complete Address *</label>
              <textarea className="input" rows={2} value={form.address} onChange={(e) => updateField("address", e.target.value)} />
              {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">City *</label>
                <input className="input" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="label">Province *</label>
                <select className="input" value={form.province} onChange={(e) => updateField("province", e.target.value)}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input className="input" value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Order Notes (optional)</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 text-base font-bold text-ink-900">Payment Method</h2>
            <label className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm font-medium text-brand-700">
              <input type="radio" checked readOnly /> Cash on Delivery (COD)
            </label>
            <p className="mt-2 text-xs text-ink-400">Online payment options are coming soon.</p>
          </div>
        </div>

        <div className="card h-fit space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-900">Order Summary</h2>

          <div className="max-h-56 space-y-2 overflow-y-auto border-b border-ink-100 pb-3 text-sm">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantLabel || ""}`} className="flex justify-between">
                <span className="text-ink-600">
                  {item.title} {item.variantLabel && `(${item.variantLabel})`} × {item.quantity}
                </span>
                <span className="font-medium text-ink-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button type="button" onClick={validateCoupon} disabled={checkingCoupon} className="btn-outline shrink-0">
              Apply
            </button>
          </div>
          {couponResult && !couponResult.valid && (
            <p className="text-xs text-red-600">{couponResult.error}</p>
          )}

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span>{formatCurrency(sub)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-bold text-ink-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-accent w-full py-3">
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
