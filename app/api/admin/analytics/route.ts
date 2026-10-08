import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { subDays, startOfDay, startOfYear } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30d"; // today | 7d | 30d | year

  const since =
    range === "today"
      ? startOfDay(new Date())
      : range === "7d"
      ? subDays(new Date(), 7)
      : range === "year"
      ? startOfYear(new Date())
      : subDays(new Date(), 30);

  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalProducts,
    activeProductsForStock,
    recentOrders,
    revenueAgg,
    deliveredInRange,
    salesByDay,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.product.count({ where: { isActive: true } }),
    // Comparing two columns of the same row (stock <= threshold) isn't expressible in
    // Prisma's standard filter API, so we fetch active products and filter in memory.
    // Fine at small-to-medium catalog sizes; swap for a $queryRaw if the catalog grows large.
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, title: true, stockQuantity: true, lowStockThreshold: true, sku: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: since } },
      _sum: { total: true },
      _avg: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: "DELIVERED", createdAt: { gte: since } } }),
    prisma.$queryRaw<Array<{ day: string; total: number }>>`
      SELECT to_char("createdAt", 'YYYY-MM-DD') as day, SUM("total")::float as total
      FROM "Order"
      WHERE "createdAt" >= ${since} AND "status" != 'CANCELLED'
      GROUP BY day
      ORDER BY day ASC
    `.catch(() => []),
  ]);

  const lowStock = activeProductsForStock
    .filter((p: any) => p.stockQuantity <= p.lowStockThreshold)
    .sort((a: any, b: any) => a.stockQuantity - b.stockQuantity)
    .slice(0, 10);

  return NextResponse.json({
    totals: {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      lowStockCount: lowStock.length,
    },
    revenue: {
      total: revenueAgg._sum.total ? Number(revenueAgg._sum.total) : 0,
      averageOrderValue: revenueAgg._avg.total ? Number(revenueAgg._avg.total) : 0,
      orderCount: revenueAgg._count,
      productsDelivered: deliveredInRange,
    },
    salesByDay,
    lowStockProducts: lowStock,
    recentOrders,
  });
}
