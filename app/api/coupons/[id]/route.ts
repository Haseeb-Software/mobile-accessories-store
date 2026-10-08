import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { couponSchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const conflict = await prisma.coupon.findFirst({ where: { code: parsed.data.code, NOT: { id: params.id } } });
    if (conflict) return NextResponse.json({ error: "Code already in use" }, { status: 409 });

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    return NextResponse.json({ coupon });
  } catch (err) {
    console.error("PUT /api/coupons/[id] error:", err);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.coupon.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
