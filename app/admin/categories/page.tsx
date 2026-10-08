"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { slugifyBasic } from "@/lib/utils";

type Category = {
  id: string; name: string; slug: string; description?: string; imageUrl?: string;
  isActive: boolean; sortOrder: number; _count?: { products: number };
};

const emptyForm = { name: "", slug: "", description: "", imageUrl: "", isActive: true, sortOrder: 0 };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/categories?includeInactive=true");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setSlugTouched(false);
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setForm({ name: c.name, slug: c.slug, description: c.description || "", imageUrl: c.imageUrl || "", isActive: c.isActive, sortOrder: c.sortOrder });
    setEditingId(c.id);
    setSlugTouched(true);
    setModalOpen(true);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "mobile-shop/categories");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");
      toast.success(editingId ? "Category updated" : "Category created");
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Categories</h1>
        <button onClick={openCreate} className="btn-primary text-sm"><Plus size={16} className="mr-1 inline" />Add Category</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-400">No categories yet.</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id}>
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-ink-100">
                    <Image src={c.imageUrl || "/placeholder-product.svg"} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <span className="font-medium text-ink-800">{c.name}</span>
                </td>
                <td className="px-4 py-3 text-ink-500">/{c.slug}</td>
                <td className="px-4 py-3 text-ink-500">{c._count?.products ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={c.isActive ? "badge-success" : "badge bg-ink-100 text-ink-500"}>{c.isActive ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">{editingId ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugifyBasic(e.target.value) }));
                  }}
                  required
                />
              </div>
              <div>
                <label className="label">Slug *</label>
                <input
                  className="input"
                  value={form.slug}
                  onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: slugifyBasic(e.target.value) })); }}
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Category Image</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="text-sm" />
                {uploading && <p className="mt-1 text-xs text-ink-400">Uploading...</p>}
                {form.imageUrl && (
                  <div className="relative mt-2 h-16 w-16 overflow-hidden rounded-lg">
                    <Image src={form.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="label">Sort Order</label>
                  <input type="number" className="input w-24" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
