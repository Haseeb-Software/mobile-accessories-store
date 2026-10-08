"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency, stockLabel } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, page: String(page), pageSize: "15" });
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">Products</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm"><Plus size={16} className="mr-1 inline" />Add Product</Link>
      </div>

      <div className="mb-4 relative max-w-sm">
        <input className="input pl-9" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">No products found.</td></tr>
            ) : (
              products.map((p) => {
                const stock = stockLabel(p.stockQuantity, p.lowStockThreshold);
                return (
                  <tr key={p.id}>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        <Image src={p.images?.[0]?.url || "/placeholder-product.svg"} alt="" fill sizes="40px" className="object-cover" />
                      </div>
                      <span className="line-clamp-1 font-medium text-ink-800">{p.title}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{p.sku}</td>
                    <td className="px-4 py-3 text-ink-500">{p.category?.name}</td>
                    <td className="px-4 py-3 font-medium text-ink-800">{formatCurrency(p.salePrice || p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={stock.tone === "success" ? "badge-success" : stock.tone === "warning" ? "badge-warning" : "badge-danger"}>{stock.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.isActive ? "badge-success" : "badge bg-ink-100 text-ink-500"}>{p.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50"><Pencil size={16} /></Link>
                        <button onClick={() => handleDelete(p.id, p.title)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
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
