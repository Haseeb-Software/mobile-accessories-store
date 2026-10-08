import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { Prisma } from "@prisma/client";

// GET /api/products?search=&category=&brand=&minPrice=&maxPrice=&sort=&page=&pageSize=&featured=&bestSeller=&newArrival=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim();
    const categorySlug = searchParams.get("category");
    const brandId = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(48, Math.max(1, parseInt(searchParams.get("pageSize") || "12")));
    const featured = searchParams.get("featured");
    const bestSeller = searchParams.get("bestSeller");
    const newArrival = searchParams.get("newArrival");
    const inStockOnly = searchParams.get("inStock") === "true";

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { category: { name: { contains: search, mode: "insensitive" } } },
          { brand: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(brandId && { brandId }),
      ...(featured === "true" && { isFeatured: true }),
      ...(bestSeller === "true" && { isBestSeller: true }),
      ...(newArrival === "true" && { isNewArrival: true }),
      ...(inStockOnly && { stockQuantity: { gt: 0 } }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
        ? { price: "desc" }
        : sort === "newest"
        ? { createdAt: "desc" }
        : sort === "best-selling"
        ? { orderItems: { _count: "desc" } }
        : { isFeatured: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
          brand: true,
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const shaped = products.map((p: any) => ({
      ...p,
      avgRating:
        p.reviews.length > 0
          ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
          : null,
      reviewCount: p.reviews.length,
      reviews: undefined,
    }));

    return NextResponse.json({
      products: shaped,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
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

    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
    }

    const product = await prisma.product.create({
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

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
