import Link from "next/link";
import { Truck, ShieldCheck, Headphones } from "lucide-react";

export default function Hero({ heading, subheading }: { heading?: string | null; subheading?: string | null }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
      <div className="container-app relative flex flex-col items-start gap-6 py-16 sm:py-20 lg:py-28">
        <span className="badge bg-white/15 text-white">New Season Collection</span>
        <h1 className="max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
          {heading || "Upgrade Your Everyday Tech"}
        </h1>
        <p className="max-w-md text-base text-brand-100 sm:text-lg">
          {subheading || "Premium mobile accessories at great prices — earbuds, chargers, cables, stands and more."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="btn-accent px-6 py-3 text-sm">
            Shop Now
          </Link>
          <Link href="/shop?featured=true" className="btn px-6 py-3 text-sm bg-white/10 text-white hover:bg-white/20">
            Featured Deals
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-100">
          <span className="flex items-center gap-2"><Truck size={16} /> Fast Delivery</span>
          <span className="flex items-center gap-2"><ShieldCheck size={16} /> Secure Ordering</span>
          <span className="flex items-center gap-2"><Headphones size={16} /> Customer Support</span>
        </div>
      </div>
    </section>
  );
}
