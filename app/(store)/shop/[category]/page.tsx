import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import ShopGrid from "@/components/products/ShopGrid";

type Props = { params: { category: string } };

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug, isActive: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory(params.category);
  if (!category) return {};
  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory(params.category);
  if (!category) notFound();

  return (
    <div>
      <div className="relative h-40 w-full overflow-hidden bg-brand-700 sm:h-56">
        {category.imageUrl && (
          <Image src={category.imageUrl} alt={category.name} fill className="object-cover opacity-40" />
        )}
        <div className="container-app relative flex h-full flex-col justify-center text-white">
          <h1 className="text-2xl font-bold sm:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-1 max-w-lg text-sm text-brand-100">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container-app py-8">
        <Suspense fallback={<div className="text-sm text-ink-500">Loading...</div>}>
          <ShopGrid categorySlug={category.slug} />
        </Suspense>
      </div>
    </div>
  );
}
