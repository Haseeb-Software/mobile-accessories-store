"use client";

import { useState } from "react";
import { ShieldCheck, Truck, Wallet, Headphones, ChevronDown, Star } from "lucide-react";

export function WhyChooseUs() {
  const items = [
    { icon: ShieldCheck, title: "Quality Products", desc: "Carefully sourced and tested accessories." },
    { icon: Truck, title: "Fast Delivery", desc: "Nationwide delivery in 2-5 business days." },
    { icon: Wallet, title: "Cash on Delivery", desc: "Pay when your order arrives at your door." },
    { icon: Headphones, title: "Customer Support", desc: "We're here to help before and after your order." },
  ];
  return (
    <section className="bg-ink-50 py-12">
      <div className="container-app grid grid-cols-2 gap-6 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center gap-2 rounded-2xl bg-white p-5 shadow-card">
            <item.icon className="text-brand-600" size={28} />
            <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
            <p className="text-xs text-ink-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const reviews = [
    { name: "Ayesha K.", text: "Ordered a power bank, arrived in 2 days and works perfectly. Highly recommend!", rating: 5 },
    { name: "Bilal A.", text: "Great quality charging cables at a fair price. COD made it easy to trust them.", rating: 5 },
    { name: "Sana M.", text: "The AirPods case exceeded expectations. Will order again for sure.", rating: 4 },
  ];
  return (
    <section className="container-app py-12">
      <h2 className="mb-6 text-xl font-bold text-ink-900 sm:text-2xl">What Our Customers Say</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {reviews.map((r) => (
          <div key={r.name} className="card p-5">
            <div className="mb-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"} />
              ))}
            </div>
            <p className="text-sm text-ink-600">&ldquo;{r.text}&rdquo;</p>
            <p className="mt-3 text-xs font-semibold text-ink-800">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQ() {
  const faqs = [
    { q: "Do you offer Cash on Delivery?", a: "Yes, COD is available nationwide on all orders." },
    { q: "How long does delivery take?", a: "Orders typically arrive within 2-5 business days depending on your city." },
    { q: "Can I return a product?", a: "Yes, please see our Return Policy for details and eligibility." },
    { q: "Are your products covered by warranty?", a: "Most electronics come with a limited warranty; details are listed on each product page." },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-ink-50 py-12">
      <div className="container-app max-w-2xl">
        <h2 className="mb-6 text-xl font-bold text-ink-900 sm:text-2xl">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={f.q} className="card overflow-hidden">
              <button
                className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-ink-800"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                <ChevronDown size={16} className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-4 pb-4 text-sm text-ink-500">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromoBanner() {
  return (
    <section className="container-app py-8">
      <div className="rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 px-6 py-8 text-center text-white sm:px-12">
        <h3 className="text-xl font-bold sm:text-2xl">Free Shipping on Orders Above Rs. 5,000</h3>
        <p className="mt-1 text-sm text-accent-50">Shop now and enjoy free delivery across Pakistan.</p>
      </div>
    </section>
  );
}
