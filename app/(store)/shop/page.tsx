import { Suspense } from "react";
import ShopGrid from "@/components/products/ShopGrid";

export const metadata = { title: "Shop All Products" };

export default function ShopPage() {
  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Shop All Products</h1>
      <Suspense fallback={<div className="text-sm text-ink-500">Loading...</div>}>
        <ShopGrid />
      </Suspense>
    </div>
  );
}
