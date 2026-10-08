export const metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <div className="container-app max-w-2xl py-12 prose prose-sm">
      <h1 className="text-2xl font-bold text-ink-900">Shipping Information</h1>
      <div className="mt-4 space-y-4 text-sm text-ink-600">
        <p>We deliver across Pakistan via trusted courier partners. Orders are typically processed within 24 hours and delivered within 2-5 business days depending on your city.</p>
        <p>Shipping fees are calculated at checkout based on your order value. Orders above the free-shipping threshold displayed at checkout ship free.</p>
        <p>Cash on Delivery (COD) is available on all orders — pay when your package arrives.</p>
        <p>You can track your order status at any time using the Track Order page with your order number.</p>
      </div>
    </div>
  );
}
