"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Coupon = {
  id: string; code: string; discountType: "PERCENTAGE" | "FIXED"; discountValue: number;
  minOrderAmount?: number | null; expiresAt?: string | null; usageLimit?: number | null;
  timesUsed: number; isActive: boolean;
};

const emptyForm = { code: "", discountType: "PERCENTAGE" as const, discountValue: "", minOrderAmount: "", expiresAt: "", usageLimit: "", isActive: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchCoupons() {
    setLoading(true);
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
    setLoading(false);
  }

  useEffect(() => { fetchCoupons(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        isActive: form.isActive,
      };
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");
      toast.success("Coupon created");
      setModalOpen(false);
      setForm(emptyForm);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    toast.success("Coupon deleted");
    fetchCoupons();
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/coupons/${coupon.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount, expiresAt: coupon.expiresAt, usageLimit: coupon.usageLimit,
        isActive: !coupon.isActive,
      }),
    });
    fetchCoupons();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Coupons</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm"><Plus size={16} className="mr-1 inline" />Add Coupon</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">No coupons yet.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono font-semibold text-ink-800">{c.code}</td>
                <td className="px-4 py-3 text-ink-600">{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}</td>
                <td className="px-4 py-3 text-ink-500">{c.minOrderAmount ? `Rs. ${c.minOrderAmount}` : "—"}</td>
                <td className="px-4 py-3 text-ink-500">{c.expiresAt ? format(new Date(c.expiresAt), "MMM d, yyyy") : "Never"}</td>
                <td className="px-4 py-3 text-ink-500">{c.timesUsed}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c)} className={c.isActive ? "badge-success" : "badge bg-ink-100 text-ink-500"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(c.id, c.code)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">New Coupon</h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Coupon Code *</label>
                <input className="input uppercase" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as any }))}>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="label">Value *</label>
                  <input type="number" className="input" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Minimum Order Amount</label>
                <input type="number" className="input" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expiry Date</label>
                  <input type="date" className="input" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Usage Limit</label>
                  <input type="number" className="input" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Create Coupon"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
