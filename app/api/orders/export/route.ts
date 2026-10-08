import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { Prisma } from "@prisma/client";

// GET /api/orders/export?status=&from=&to=&ids=id1,id2  -> streams an .xlsx file
export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const ids = searchParams.get("ids")?.split(",").filter(Boolean);

  const where: Prisma.OrderWhereInput = {
    ...(ids?.length ? { id: { in: ids } } : {}),
    ...(status && { status: status as any }),
    ...((fromDate || toDate) && {
      createdAt: {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      },
    }),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mobile Accessories Store";
  const sheet = workbook.addWorksheet("Orders");

  sheet.columns = [
    { header: "Order Number", key: "orderNumber", width: 18 },
    { header: "Date", key: "date", width: 20 },
    { header: "Customer Name", key: "customerName", width: 22 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Email", key: "email", width: 24 },
    { header: "Address", key: "address", width: 30 },
    { header: "City", key: "city", width: 14 },
    { header: "Province", key: "province", width: 14 },
    { header: "Products", key: "products", width: 40 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Subtotal", key: "subtotal", width: 12 },
    { header: "Shipping", key: "shipping", width: 12 },
    { header: "Discount", key: "discount", width: 12 },
    { header: "Total", key: "total", width: 12 },
    { header: "Payment Method", key: "paymentMethod", width: 16 },
    { header: "Payment Status", key: "paymentStatus", width: 16 },
    { header: "Order Status", key: "orderStatus", width: 16 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1D4ED8" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  for (const order of orders) {
    sheet.addRow({
      orderNumber: order.orderNumber,
      date: order.createdAt.toISOString().slice(0, 19).replace("T", " "),
      customerName: order.customerName,
      phone: order.phone,
      email: order.email || "",
      address: order.address,
      city: order.city,
      province: order.province,
      products: order.items.map((i: any) => `${i.productTitle}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`).join("; "),
      quantity: order.items.reduce((s: number, i: any) => s + i.quantity, 0),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shippingFee),
      discount: Number(order.discount),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
