import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { deleteMedia } from "@/lib/storage/cloudinary";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, category: true, brand: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Conflict checks (excluding this product)
    const slugConflict = await prisma.product.findFirst({
      where: { slug: data.slug, NOT: { id: params.id } },
    });
    if (slugConflict) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    const skuConflict = await prisma.product.findFirst({
      where: { sku: data.sku, NOT: { id: params.id } },
    });
    if (skuConflict) {
      return NextResponse.json({ error: "SKU already in use" }, { status: 409 });
    }

    // Delete removed images from Cloudinary
    const incomingUrls = new Set(data.images.map((i: any) => i.url));
    const removedImages = existing.images.filter((img: any) => !incomingUrls.has(img.url));
    for (const img of removedImages) {
      if (img.publicId) {
        try {
          await deleteMedia(img.publicId, "image");
        } catch (e) {
          console.warn("Cloudinary delete failed for", img.publicId, e);
        }
      }
    }

    const product = await prisma.$transaction(async (tx: any) => {
      await tx.productImage.deleteMany({ where: { productId: params.id } });
      await tx.productVariant.deleteMany({ where: { productId: params.id } });

      return tx.product.update({
        where: { id: params.id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          salePrice: data.salePrice ?? null,
          sku: data.sku,
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          stockQuantity: data.stockQuantity,
          lowStockThreshold: data.lowStockThreshold,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isBestSeller: data.isBestSeller,
          isNewArrival: data.isNewArrival,
          specifications: data.specifications ?? {},
          features: data.features,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          videoUrl: data.videoUrl || null,
          images: { create: data.images },
          variants: { create: data.variants },
        },
        include: { images: true, variants: true },
      });
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    for (const img of existing.images) {
      if (img.publicId) {
        try {
          await deleteMedia(img.publicId, "image");
        } catch (e) {
          console.warn("Cloudinary delete failed for", img.publicId, e);
        }
      }
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete: product is referenced by existing orders. Deactivate it instead." },
        { status: 409 }
      );
    }
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
