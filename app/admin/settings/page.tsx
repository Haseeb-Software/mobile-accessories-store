"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

const emptyForm = {
  storeName: "", logoUrl: "", faviconUrl: "", phone: "", whatsappNumber: "", email: "", address: "",
  facebookUrl: "", instagramUrl: "", tiktokUrl: "", standardShippingFee: "200", freeShippingThreshold: "5000",
  currency: "PKR", storeDescription: "", heroHeading: "", heroSubheading: "", footerText: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        if (s) {
          setForm({
            storeName: s.storeName || "", logoUrl: s.logoUrl || "", faviconUrl: s.faviconUrl || "",
            phone: s.phone || "", whatsappNumber: s.whatsappNumber || "", email: s.email || "", address: s.address || "",
            facebookUrl: s.facebookUrl || "", instagramUrl: s.instagramUrl || "", tiktokUrl: s.tiktokUrl || "",
            standardShippingFee: String(s.standardShippingFee), freeShippingThreshold: String(s.freeShippingThreshold),
            currency: s.currency || "PKR", storeDescription: s.storeDescription || "",
            heroHeading: s.heroHeading || "", heroSubheading: s.heroSubheading || "", footerText: s.footerText || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "mobile-shop/branding");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, logoUrl: data.url }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, standardShippingFee: parseFloat(form.standardShippingFee), freeShippingThreshold: parseFloat(form.freeShippingThreshold) };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-500">Loading settings...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Site Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-900">Store Identity</h2>
          <div>
            <label className="label">Store Name</label>
            <input className="input" value={form.storeName} onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Store Description</label>
            <textarea className="input" rows={2} value={form.storeDescription} onChange={(e) => setForm((f) => ({ ...f, storeDescription: e.target.value }))} />
          </div>
          <div>
            <label className="label">Logo</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} className="text-sm" />
            {uploading && <p className="mt-1 text-xs text-ink-400">Uploading...</p>}
            {form.logoUrl && <div className="relative mt-2 h-10 w-32"><Image src={form.logoUrl} alt="Logo" fill className="object-contain object-left" /></div>}
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-900">Homepage Hero</h2>
          <div>
            <label className="label">Hero Heading</label>
            <input className="input" value={form.heroHeading} onChange={(e) => setForm((f) => ({ ...f, heroHeading: e.target.value }))} placeholder="Upgrade Your Everyday Tech" />
          </div>
          <div>
            <label className="label">Hero Subheading</label>
            <input className="input" value={form.heroSubheading} onChange={(e) => setForm((f) => ({ ...f, heroSubheading: e.target.value }))} />
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-900">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label">WhatsApp Number</label>
              <input className="input" value={form.whatsappNumber} onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))} placeholder="923001234567" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-900">Social Media</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <input className="input" placeholder="Facebook URL" value={form.facebookUrl} onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))} />
            <input className="input" placeholder="Instagram URL" value={form.instagramUrl} onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))} />
            <input className="input" placeholder="TikTok URL" value={form.tiktokUrl} onChange={(e) => setForm((f) => ({ ...f, tiktokUrl: e.target.value }))} />
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-900">Shipping</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Standard Shipping Fee (Rs.)</label>
              <input type="number" className="input" value={form.standardShippingFee} onChange={(e) => setForm((f) => ({ ...f, standardShippingFee: e.target.value }))} />
            </div>
            <div>
              <label className="label">Free Shipping Threshold (Rs.)</label>
              <input type="number" className="input" value={form.freeShippingThreshold} onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-900">Footer</h2>
          <textarea className="input" rows={2} value={form.footerText} onChange={(e) => setForm((f) => ({ ...f, footerText: e.target.value }))} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Settings"}</button>
      </form>
    </div>
  );
}
