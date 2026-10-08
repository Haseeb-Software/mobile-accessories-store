import Link from "next/link";
import { Facebook, Instagram, Music2 } from "lucide-react";

type Props = {
  settings: {
    storeName?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    tiktokUrl?: string | null;
    footerText?: string | null;
  } | null;
  categories: { name: string; slug: string }[];
};

export default function Footer({ settings, categories }: Props) {
  const storeName = settings?.storeName || "MobileHub";

  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink-900 text-ink-200">
      <div className="container-app grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <h3 className="mb-3 text-lg font-bold text-white">{storeName}</h3>
          <p className="text-sm text-ink-400">
            {settings?.footerText ||
              "Premium mobile accessories at honest prices. Fast delivery across Pakistan with Cash on Delivery."}
          </p>
          <div className="mt-4 flex gap-3">
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="rounded-full bg-ink-800 p-2 hover:bg-brand-600">
                <Facebook size={16} />
              </a>
            )}
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="rounded-full bg-ink-800 p-2 hover:bg-brand-600">
                <Instagram size={16} />
              </a>
            )}
            {settings?.tiktokUrl && (
              <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="rounded-full bg-ink-800 p-2 hover:bg-brand-600">
                <Music2 size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Categories</h4>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/shop/${c.slug}`} className="text-ink-400 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact" className="text-ink-400 hover:text-white">Contact Us</Link></li>
            <li><Link href="/shipping-policy" className="text-ink-400 hover:text-white">Shipping Information</Link></li>
            <li><Link href="/return-policy" className="text-ink-400 hover:text-white">Return Policy</Link></li>
            <li><Link href="/privacy-policy" className="text-ink-400 hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/track-order" className="text-ink-400 hover:text-white">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Contact</h4>
          <ul className="space-y-2 text-sm text-ink-400">
            {settings?.phone && <li>{settings.phone}</li>}
            {settings?.email && <li>{settings.email}</li>}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800 py-4 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
