"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency, stockLabel } from "@/lib/utils";

type Variant = { id: string; name: string; value: string; priceModifier: number | string; stockQuantity: number };

export default function AddToCartPanel({
  productId,
  slug,
  title,
  basePrice,
  imageUrl,
  stockQuantity,
  lowStockThreshold,
  variants,
}: {
  productId: string;
  slug: string;
  title: string;
  basePrice: number;
  imageUrl: string;
  stockQuantity: number;
  lowStockThreshold: number;
  variants: Variant[];
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  // Group variants by name (e.g. "Color" -> ["Black", "White"])
  const variantGroups = useMemo(() => {
    const groups: Record<string, Variant[]> = {};
    for (const v of variants) {
      groups[v.name] = groups[v.name] || [];
      groups[v.name].push(v);
    }
    return groups;
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>({});

  const selectedVariant = useMemo(() => {
    const names = Object.keys(variantGroups);
    if (names.length === 0) return null;
    // find a variant matching all selected values (simple single-attribute model support)
    for (const name of names) {
      const value = selected[name];
      if (!value) continue;
      const match = variantGroups[name].find((v) => v.value === value);
      if (match) return match;
    }
    return null;
  }, [selected, variantGroups]);

  const effectivePrice = basePrice + (selectedVariant ? Number(selectedVariant.priceModifier) : 0);
  const effectiveStock = selectedVariant ? selectedVariant.stockQuantity : stockQuantity;
  const stock = stockLabel(effectiveStock, lowStockThreshold);
  const variantLabel = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  function handleAdd(buyNow = false) {
    if (effectiveStock <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    addItem({
      productId,
      slug,
      title,
      price: effectivePrice,
      imageUrl,
      stockQuantity: effectiveStock,
      variantLabel: variantLabel || undefined,
      quantity,
    });
    if (buyNow) {
      router.push("/checkout");
    } else {
      toast.success("Added to cart");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-ink-900">{formatCurrency(effectivePrice)}</span>
      </div>

      <span className={stock.tone === "success" ? "badge-success" : stock.tone === "warning" ? "badge-warning" : "badge-danger"}>
        {stock.label}
      </span>

      {Object.entries(variantGroups).map(([name, options]) => (
        <div key={name}>
          <p className="label">{name}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected((s) => ({ ...s, [name]: opt.value }))}
                className={`rounded-xl border px-3.5 py-1.5 text-sm ${
                  selected[name] === opt.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-600 hover:border-ink-300"
                }`}
                disabled={opt.stockQuantity <= 0}
              >
                {opt.value}
                {opt.stockQuantity <= 0 && " (Out)"}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="label">Quantity</p>
        <div className="flex w-fit items-center rounded-xl border border-ink-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-ink-500 hover:text-ink-800"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
            className="p-2.5 text-ink-500 hover:text-ink-800"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => handleAdd(false)} disabled={effectiveStock <= 0} className="btn-outline flex-1 py-3">
          Add to Cart
        </button>
        <button onClick={() => handleAdd(true)} disabled={effectiveStock <= 0} className="btn-accent flex-1 py-3">
          Buy Now
        </button>
      </div>
    </div>
  );
}
