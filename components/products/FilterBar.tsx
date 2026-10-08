"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export type Filters = {
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  sort: string;
};

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(filters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || "");

  function applyPriceRange() {
    onChange({ ...filters, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
    setMobileOpen(false);
  }

  const Content = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-ink-800">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input py-1.5 text-sm"
          />
          <span className="text-ink-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input py-1.5 text-sm"
          />
        </div>
        <button onClick={applyPriceRange} className="btn-outline mt-2 w-full py-1.5 text-xs">
          Apply
        </button>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={!!filters.inStock}
            onChange={(e) => onChange({ ...filters, inStock: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          In Stock Only
        </label>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-56 shrink-0">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-500">Filters</h3>
        {Content}
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="btn-outline lg:hidden flex items-center gap-2 text-sm"
      >
        <SlidersHorizontal size={16} /> Filters
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold">Filters</h3>
              <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
            </div>
            {Content}
          </div>
        </div>
      )}
    </>
  );
}

export function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input w-auto py-2 text-sm"
    >
      <option value="featured">Featured</option>
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="best-selling">Best Selling</option>
    </select>
  );
}
