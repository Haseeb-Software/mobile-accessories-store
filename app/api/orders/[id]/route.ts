import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderStatusUpdateSchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";

// GET a single order by its database id — admin use (full detail view)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, customer: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}

// PATCH — admin updates order status (confirm/process/ship/deliver/cancel)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // If cancelling/returning an order that wasn't already cancelled, restock items
    const restockStatuses = ["CANCELLED", "RETURNED"];
    const shouldRestock =
      restockStatuses.includes(parsed.data.status) && !restockStatuses.includes(existing.status);

   const order = await prisma.$transaction(async (tx) => {
      if (shouldRestock) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id: params.id },
        data: {
          status: parsed.data.status,
          ...(parsed.data.status === "DELIVERED" && { paymentStatus: "PAID" }),
        },
        include: { items: true },
      });
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
