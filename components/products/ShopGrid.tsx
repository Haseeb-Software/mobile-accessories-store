"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCard, { ProductCardData } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";
import FilterBar, { SortSelect } from "@/components/products/FilterBar";
import { PackageSearch } from "lucide-react";

export default function ShopGrid({ categorySlug }: { categorySlug?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const sort = searchParams.get("sort") || "featured";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const inStock = searchParams.get("inStock") === "true";
  const featured = searchParams.get("featured");
  const bestSeller = searchParams.get("bestSeller");
  const newArrival = searchParams.get("newArrival");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (search) params.set("search", search);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "true");
    if (featured) params.set("featured", featured);
    if (bestSeller) params.set("bestSeller", bestSeller);
    if (newArrival) params.set("newArrival", newArrival);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", "12");

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, search, minPrice, maxPrice, inStock, featured, bestSeller, newArrival, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [categorySlug, search, minPrice, maxPrice, inStock, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <FilterBar
        filters={{ minPrice, maxPrice, inStock, sort }}
        onChange={(f) => {
          const params = new URLSearchParams(searchParams.toString());
          f.minPrice ? params.set("minPrice", f.minPrice) : params.delete("minPrice");
          f.maxPrice ? params.set("maxPrice", f.maxPrice) : params.delete("maxPrice");
          f.inStock ? params.set("inStock", "true") : params.delete("inStock");
          router.push(`${pathname}?${params.toString()}`);
        }}
      />

      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink-500">{loading ? "Loading..." : `${total} products`}</p>
          <SortSelect value={sort} onChange={(v) => updateParam("sort", v)} />
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 py-20 text-center">
            <PackageSearch size={40} className="text-ink-300" />
            <p className="text-sm text-ink-500">No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 text-sm text-ink-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
