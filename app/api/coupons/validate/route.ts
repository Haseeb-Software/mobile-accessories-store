import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/coupons/validate  { code, subtotal }
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 200 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 200 });
    }
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "Coupon usage limit reached" }, { status: 200 });
    }
    if (coupon.minOrderAmount && Number(subtotal) < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of Rs. ${coupon.minOrderAmount} required`,
      });
    }

    const discount =
      coupon.discountType === "PERCENTAGE"
        ? (Number(subtotal) * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue);

    return NextResponse.json({
      valid: true,
      discount: Math.min(discount, Number(subtotal)),
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
    });
  } catch (err) {
    console.error("POST /api/coupons/validate error:", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
