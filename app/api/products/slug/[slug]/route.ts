import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
      brand: true,
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      NOT: { id: product.id },
    },
    take: 8,
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
      : null;

  return NextResponse.json({
    product: { ...product, avgRating, reviewCount: product.reviews.length },
    relatedProducts,
  });
}
