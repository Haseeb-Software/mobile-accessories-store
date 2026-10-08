import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";

// POST /api/reviews — public, always created as PENDING (moderation required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const review = await prisma.review.create({
      data: { ...parsed.data, status: "PENDING" },
    });

    return NextResponse.json({
      review,
      message: "Thanks! Your review will appear after it's approved.",
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

// GET /api/reviews — admin moderation list
export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const reviews = await prisma.review.findMany({
    where: { status: status as any },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true, slug: true } } },
  });

  return NextResponse.json({ reviews });
}
