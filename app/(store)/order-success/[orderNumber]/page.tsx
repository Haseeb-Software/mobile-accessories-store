import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true },
  });
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);

  if (!order) notFound();

  return (
    <div className="container-app max-w-2xl py-12">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 size={56} className="text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Order Placed Successfully!</h1>
        <p className="mt-1 text-ink-500">
          Your order <span className="font-semibold text-ink-800">#{order.orderNumber}</span> has been received.
        </p>
      </div>

      <div className="card mt-8 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-500">Order Details</h2>
        <div className="space-y-2 text-sm">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-ink-600">
                {item.productTitle} {item.variantLabel && `(${item.variantLabel})`} × {item.quantity}
              </span>
              <span className="font-medium text-ink-900">{formatCurrency(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
          <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-ink-600"><span>Shipping</span><span>{Number(order.shippingFee) === 0 ? "Free" : formatCurrency(order.shippingFee)}</span></div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>
          )}
          <div className="flex justify-between text-base font-bold text-ink-900 border-t border-ink-100 pt-2"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
      </div>

      <div className="card mt-4 p-5 text-sm text-ink-600">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-500">Shipping To</h2>
        <p className="font-medium text-ink-800">{order.customerName}</p>
        <p>{order.address}, {order.city}, {order.province}</p>
        <p>{order.phone}</p>
        <p className="mt-2 text-xs text-ink-400">Payment Method: Cash on Delivery</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className="btn-primary flex-1 text-center">Continue Shopping</Link>
        {settings?.whatsappNumber && (
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'd like to ask about my order #${order.orderNumber}`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline flex-1 text-center"
          >
            Contact us on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
