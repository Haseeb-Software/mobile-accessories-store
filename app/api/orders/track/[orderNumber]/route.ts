import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public-safe: only returns non-sensitive order info by order number.
export async function GET(_req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({ order });
}
