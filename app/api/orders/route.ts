import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { generateOrderNumber } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// POST /api/orders — public checkout. ALL pricing is recalculated server-side.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the form for errors", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Load real products & lock in real prices/stock (never trust client-sent prices)
      const productIds = data.items.map((i: any) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      });
      const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));

      let subtotal = 0;
      const orderItemsData: any[] = [];

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product not found or unavailable (${item.productId})`);
        }
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for "${product.title}". Only ${product.stockQuantity} left.`);
        }

        const unitPrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
        subtotal += unitPrice * item.quantity;

        orderItemsData.push({
          productId: product.id,
          productTitle: product.title,
          variantLabel: item.variantLabel,
          price: unitPrice,
          quantity: item.quantity,
          imageUrl: product.images[0]?.url,
        });
      }

      // 2. Shipping (from real site settings, never from client)
      const settings = await tx.siteSettings.findUnique({ where: { id: "singleton" } });
      const standardShipping = settings ? Number(settings.standardShippingFee) : 200;
      const freeThreshold = settings ? Number(settings.freeShippingThreshold) : 5000;
      const shippingFee = subtotal >= freeThreshold ? 0 : standardShipping;

      // 3. Coupon (server-validated)
      let discount = 0;
      let appliedCouponCode: string | undefined;
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
        if (!coupon || !coupon.isActive) {
          throw new Error("Invalid or inactive coupon code");
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new Error("This coupon has expired");
        }
        if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
          throw new Error("This coupon has reached its usage limit");
        }
        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
          throw new Error(`Minimum order of Rs. ${coupon.minOrderAmount} required for this coupon`);
        }

        discount =
          coupon.discountType === "PERCENTAGE"
            ? (subtotal * Number(coupon.discountValue)) / 100
            : Number(coupon.discountValue);
        discount = Math.min(discount, subtotal);
        appliedCouponCode = coupon.code;

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      const total = Math.max(0, subtotal + shippingFee - discount);

      // 4. Upsert customer by phone
      const customer = await tx.customer.upsert({
        where: { phone: data.phone },
        update: { name: data.customerName, email: data.email || undefined, city: data.city },
        create: {
          name: data.customerName,
          phone: data.phone,
          email: data.email || undefined,
          city: data.city,
        },
      });

      // 5. Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || null,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          notes: data.notes,
          subtotal,
          shippingFee,
          discount,
          total,
          couponCode: appliedCouponCode,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          status: "PENDING",
          items: { createMany: { data: orderItemsData } },
        },
        include: { items: true },
      });

      // 6. Decrement stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      return order;
    });

    return NextResponse.json({ order: result }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    const message = err?.message?.startsWith("Product") || err?.message?.includes("stock") || err?.message?.includes("coupon") || err?.message?.includes("Coupon") || err?.message?.includes("Minimum")
      ? err.message
      : "Failed to place order. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/orders — admin order list with filters
export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const paymentMethod = searchParams.get("paymentMethod");
  const search = searchParams.get("search")?.trim();
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

  const where: Prisma.OrderWhereInput = {
    ...(status && { status: status as any }),
    ...(paymentMethod && { paymentMethod: paymentMethod as any }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    }),
    ...((fromDate || toDate) && {
      createdAt: {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      },
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
