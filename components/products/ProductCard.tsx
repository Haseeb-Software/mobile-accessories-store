"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatCurrency, calculateDiscountPercent, stockLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store/cart-store";

export type ProductCardData = {
  id: string;
  title: string;
  slug: string;
  price: number | string;
  salePrice?: number | string | null;
  stockQuantity: number;
  lowStockThreshold?: number;
  images: { url: string; altText?: string | null }[];
  avgRating?: number | null;
  reviewCount?: number;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const discount = calculateDiscountPercent(price, salePrice);
  const stock = stockLabel(product.stockQuantity, product.lowStockThreshold);
  const image = product.images?.[0]?.url || "/placeholder-product.svg";
  const addItem = useCartStore((s) => s.addItem);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQuantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: salePrice ?? price,
      imageUrl: image,
      stockQuantity: product.stockQuantity,
      quantity: 1,
    });
    toast.success("Added to cart");
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden hover:shadow-card-hover"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-ink-50">
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="badge-danger absolute left-2 top-2 shadow-sm">-{discount}%</span>
        )}
        {stock.tone !== "success" && (
          <span
            className={`absolute right-2 top-2 shadow-sm ${
              stock.tone === "danger" ? "badge-danger" : "badge-warning"
            }`}
          >
            {stock.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-medium text-ink-800">{product.title}</h3>

        {typeof product.avgRating === "number" && (
          <div className="flex items-center gap-1 text-xs text-ink-500">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{product.avgRating.toFixed(1)}</span>
            {product.reviewCount ? <span>({product.reviewCount})</span> : null}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-base font-bold text-ink-900">
            {formatCurrency(salePrice ?? price)}
          </span>
          {salePrice && (
            <span className="text-xs text-ink-400 line-through">{formatCurrency(price)}</span>
          )}
        </div>

        <button
          onClick={quickAdd}
          disabled={product.stockQuantity <= 0}
          className="btn-primary mt-2 w-full py-2 text-xs"
        >
          {product.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
