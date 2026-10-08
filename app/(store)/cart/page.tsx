"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container-app flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag size={48} className="text-ink-300" />
        <h1 className="text-xl font-bold text-ink-900">Your cart is empty</h1>
        <p className="text-sm text-ink-500">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantLabel || ""}`} className="card flex gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                <Image src={item.imageUrl} alt={item.title} fill sizes="80px" className="object-cover" />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium text-ink-800 hover:text-brand-600">
                    {item.title}
                  </Link>
                  {item.variantLabel && <p className="text-xs text-ink-400">{item.variantLabel}</p>}
                  {item.quantity > item.stockQuantity && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      Only {item.stockQuantity} in stock — quantity adjusted at checkout
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-ink-200">
                    <button
                      className="p-1.5 text-ink-500"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantLabel)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="p-1.5 text-ink-500"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantLabel)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-ink-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.productId, item.variantLabel)}
                className="self-start p-1 text-ink-400 hover:text-red-500"
                aria-label="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Order Summary</h2>
          <div className="flex justify-between text-sm text-ink-600">
            <span>Subtotal</span>
            <span className="font-medium text-ink-900">{formatCurrency(subtotal())}</span>
          </div>
          <p className="mt-1 text-xs text-ink-400">Shipping & discounts calculated at checkout.</p>
          <Link href="/checkout" className="btn-accent mt-5 block w-full py-3 text-center">
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="btn-ghost mt-2 block w-full py-2 text-center text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
