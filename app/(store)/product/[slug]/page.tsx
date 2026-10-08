import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import ProductGallery from "@/components/products/ProductGallery";
import AddToCartPanel from "@/components/products/AddToCartPanel";
import ReviewSection from "@/components/products/ReviewSection";
import ProductRail from "@/components/layout/ProductRail";
import { formatCurrency, calculateDiscountPercent } from "@/lib/utils";

type Props = { params: { slug: string } };

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
      brand: true,
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" } },
    },
  });
  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.shortDescription || product.description.slice(0, 155),
    openGraph: {
      title: product.seoTitle || product.title,
      description: product.seoDescription || product.shortDescription || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, NOT: { id: product.id } },
    take: 8,
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
      : null;

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const discount = calculateDiscountPercent(price, salePrice);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.map((i: any) => i.url),
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: salePrice ?? price,
      availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  return (
    <div className="container-app py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-4 text-xs text-ink-400">
        <span>Shop</span> / <span>{product.category.name}</span> / <span className="text-ink-700">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} videoUrl={product.videoUrl} title={product.title} />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{product.category.name}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink-900 sm:text-3xl">{product.title}</h1>
          {product.shortDescription && <p className="mt-2 text-sm text-ink-500">{product.shortDescription}</p>}

          {discount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="badge-danger">-{discount}% OFF</span>
              <span className="text-sm text-ink-400 line-through">{formatCurrency(price)}</span>
            </div>
          )}

          <div className="mt-4">
            <AddToCartPanel
              productId={product.id}
              slug={product.slug}
              title={product.title}
              basePrice={salePrice ?? price}
              imageUrl={product.images[0]?.url || "/placeholder-product.svg"}
              stockQuantity={product.stockQuantity}
              lowStockThreshold={product.lowStockThreshold}
              variants={product.variants.map((v: any) => ({ ...v, priceModifier: Number(v.priceModifier) }))}
            />
          </div>

          {product.features.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-ink-800">Key Features</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-ink-600">
                {product.features.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {product.specifications && Object.keys(product.specifications as object).length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-ink-800">Specifications</h3>
              <dl className="divide-y divide-ink-100 rounded-xl border border-ink-100 text-sm">
                {Object.entries(product.specifications as Record<string, string>).map(([k, v]) => (
                  <div key={k} className="flex justify-between px-3 py-2">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="font-medium text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <h2 className="mb-2 text-lg font-bold text-ink-900">Description</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">{product.description}</p>
      </div>

      <ReviewSection
        productId={product.id}
        reviews={product.reviews.map((r: any) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        avgRating={avgRating}
      />

      <ProductRail title="Related Products" viewAllHref={`/shop/${product.category.slug}`} products={relatedProducts as any} />
    </div>
  );
}
