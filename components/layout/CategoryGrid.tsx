import Link from "next/link";
import Image from "next/image";

type Category = { name: string; slug: string; imageUrl?: string | null };

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="container-app py-10 sm:py-14">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">Shop by Category</h2>
        <Link href="/shop" className="text-sm font-medium text-brand-600 hover:underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-4 text-center transition-shadow hover:shadow-card-hover"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-brand-50">
              <Image
                src={c.imageUrl || "/placeholder-product.svg"}
                alt={c.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-ink-700 group-hover:text-brand-600">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
