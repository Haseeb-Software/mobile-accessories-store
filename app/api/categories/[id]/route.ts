import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const conflict = await prisma.category.findFirst({
      where: { slug: parsed.data.slug, NOT: { id: params.id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
    });

    return NextResponse.json({ category });
  } catch (err) {
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const productCount = await prisma.product.count({ where: { categoryId: params.id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product(s) still use this category.` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
