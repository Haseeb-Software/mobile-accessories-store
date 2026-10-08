"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { slugifyBasic } from "@/lib/utils";
import ImageUploader, { UploadedImage } from "@/components/admin/ImageUploader";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type VariantRow = { name: string; value: string; priceModifier: string; stockQuantity: string; sku: string };
type SpecRow = { key: string; value: string };

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEdit = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [form, setForm] = useState({
    title: "", slug: "", description: "", shortDescription: "",
    price: "", salePrice: "", sku: "", categoryId: "", brandId: "",
    stockQuantity: "0", lowStockThreshold: "5",
    isActive: true, isFeatured: false, isBestSeller: false, isNewArrival: false,
    seoTitle: "", seoDescription: "", videoUrl: "",
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    fetch("/api/categories?includeInactive=true").then((r) => r.json()).then((d) => setCategories(d.categories || []));
    // Brands endpoint intentionally omitted from scope; using a text field fallback is possible too.
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;
        setForm({
          title: p.title, slug: p.slug, description: p.description, shortDescription: p.shortDescription || "",
          price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : "", sku: p.sku,
          categoryId: p.categoryId, brandId: p.brandId || "",
          stockQuantity: String(p.stockQuantity), lowStockThreshold: String(p.lowStockThreshold),
          isActive: p.isActive, isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival,
          seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "", videoUrl: p.videoUrl || "",
        });
        setImages(p.images.map((i: any) => ({ url: i.url, publicId: i.publicId, isPrimary: i.isPrimary, sortOrder: i.sortOrder })));
        setVariants(p.variants.map((v: any) => ({ name: v.name, value: v.value, priceModifier: String(v.priceModifier), stockQuantity: String(v.stockQuantity), sku: v.sku || "" })));
        setSpecs(Object.entries(p.specifications || {}).map(([key, value]) => ({ key, value: String(value) })));
        setFeatures(p.features || []);
        setSlugTouched(true);
      })
      .finally(() => setLoading(false));
  }, [isEdit, productId]);

  function updateField(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "title" && !slugTouched) {
      setForm((f) => ({ ...f, slug: slugifyBasic(value) }));
    }
  }

  function addVariant() {
    setVariants((v) => [...v, { name: "", value: "", priceModifier: "0", stockQuantity: "0", sku: "" }]);
  }
  function addSpec() {
    setSpecs((s) => [...s, { key: "", value: "" }]);
  }
  function addFeature() {
    if (!featureInput.trim()) return;
    setFeatures((f) => [...f, featureInput.trim()]);
    setFeatureInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      stockQuantity: parseInt(form.stockQuantity),
      lowStockThreshold: parseInt(form.lowStockThreshold),
      brandId: form.brandId || null,
      videoUrl: form.videoUrl || "",
      images: images.map((img, i) => ({ ...img, sortOrder: i })),
      variants: variants
        .filter((v) => v.name && v.value)
        .map((v) => ({
          name: v.name, value: v.value,
          priceModifier: parseFloat(v.priceModifier) || 0,
          stockQuantity: parseInt(v.stockQuantity) || 0,
          sku: v.sku || undefined,
        })),
      specifications: Object.fromEntries(specs.filter((s) => s.key).map((s) => [s.key, s.value])),
      features,
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${productId}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-500">Loading product...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      <div className="card space-y-4 p-5">
        <h2 className="text-base font-bold text-ink-900">Basic Information</h2>
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
        </div>
        <div>
          <label className="label">Slug *</label>
          <input
            className="input"
            value={form.slug}
            onChange={(e) => { setSlugTouched(true); updateField("slug", slugifyBasic(e.target.value)); }}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Short Description</label>
            <input className="input" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} />
          </div>
          <div>
            <label className="label">SKU *</label>
            <input className="input" value={form.sku} onChange={(e) => updateField("sku", e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label">Full Description *</label>
          <textarea className="input" rows={5} value={form.description} onChange={(e) => updateField("description", e.target.value)} required />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-bold text-ink-900">Pricing & Inventory</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Price (Rs.) *</label>
            <input type="number" step="0.01" className="input" value={form.price} onChange={(e) => updateField("price", e.target.value)} required />
          </div>
          <div>
            <label className="label">Sale Price (Rs.)</label>
            <input type="number" step="0.01" className="input" value={form.salePrice} onChange={(e) => updateField("salePrice", e.target.value)} />
          </div>
          <div>
            <label className="label">Stock Quantity *</label>
            <input type="number" className="input" value={form.stockQuantity} onChange={(e) => updateField("stockQuantity", e.target.value)} required />
          </div>
          <div>
            <label className="label">Low Stock Threshold</label>
            <input type="number" className="input" value={form.lowStockThreshold} onChange={(e) => updateField("lowStockThreshold", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-bold text-ink-900">Category & Flags</h2>
        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["isActive", "Active"], ["isFeatured", "Featured"], ["isBestSeller", "Best Seller"], ["isNewArrival", "New Arrival"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={(form as any)[key]}
                onChange={(e) => updateField(key, e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-bold text-ink-900">Media</h2>
        <ImageUploader images={images} onChange={setImages} />
        <div>
          <label className="label">Product Video URL (optional, or upload above)</label>
          <input className="input" value={form.videoUrl} onChange={(e) => updateField("videoUrl", e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="text-base font-bold text-ink-900">Features</h2>
        <div className="flex gap-2">
          <input className="input" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="e.g. Active Noise Cancellation" />
          <button type="button" onClick={addFeature} className="btn-outline shrink-0"><Plus size={16} /></button>
        </div>
        <ul className="space-y-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-1.5 text-sm">
              {f}
              <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}><Trash2 size={14} className="text-red-500" /></button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">Specifications</h2>
          <button type="button" onClick={addSpec} className="btn-outline text-xs"><Plus size={14} className="mr-1 inline" />Add Spec</button>
        </div>
        {specs.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input className="input" placeholder="Key (e.g. Battery)" value={s.key} onChange={(e) => setSpecs(specs.map((sp, idx) => idx === i ? { ...sp, key: e.target.value } : sp))} />
            <input className="input" placeholder="Value (e.g. 500mAh)" value={s.value} onChange={(e) => setSpecs(specs.map((sp, idx) => idx === i ? { ...sp, value: e.target.value } : sp))} />
            <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="p-2 text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <div className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">Variants (e.g. Color, Length)</h2>
          <button type="button" onClick={addVariant} className="btn-outline text-xs"><Plus size={14} className="mr-1 inline" />Add Variant</button>
        </div>
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-ink-100 p-3 sm:grid-cols-5">
            <input className="input" placeholder="Attribute (Color)" value={v.name} onChange={(e) => setVariants(variants.map((vr, idx) => idx === i ? { ...vr, name: e.target.value } : vr))} />
            <input className="input" placeholder="Value (Black)" value={v.value} onChange={(e) => setVariants(variants.map((vr, idx) => idx === i ? { ...vr, value: e.target.value } : vr))} />
            <input type="number" className="input" placeholder="Price +/-" value={v.priceModifier} onChange={(e) => setVariants(variants.map((vr, idx) => idx === i ? { ...vr, priceModifier: e.target.value } : vr))} />
            <input type="number" className="input" placeholder="Stock" value={v.stockQuantity} onChange={(e) => setVariants(variants.map((vr, idx) => idx === i ? { ...vr, stockQuantity: e.target.value } : vr))} />
            <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-red-500 justify-self-end"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-bold text-ink-900">SEO</h2>
        <div>
          <label className="label">SEO Title</label>
          <input className="input" value={form.seoTitle} onChange={(e) => updateField("seoTitle", e.target.value)} />
        </div>
        <div>
          <label className="label">Meta Description</label>
          <textarea className="input" rows={2} value={form.seoDescription} onChange={(e) => updateField("seoDescription", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
