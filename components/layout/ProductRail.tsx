import Link from "next/link";
import ProductCard, { ProductCardData } from "@/components/products/ProductCard";

export default function ProductRail({
  title,
  viewAllHref,
  products,
}: {
  title: string;
  viewAllHref: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-app py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-medium text-brand-600 hover:underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
