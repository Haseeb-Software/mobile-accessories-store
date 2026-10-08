"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingCart, X, ChevronRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useRouter } from "next/navigation";

type Props = {
  storeName: string;
  logoUrl?: string;
  categories: { name: string; slug: string }[];
};

export default function Header({ storeName, logoUrl, categories }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const totalItems = useCartStore((s) => s.totalItems());
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <button
          className="lg:hidden -ml-2 rounded-lg p-2 text-ink-700 hover:bg-ink-50"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-extrabold tracking-tight text-brand-700">{storeName}</span>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Home
          </Link>
          <Link href="/shop" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Shop
          </Link>
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/contact" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <form onSubmit={submitSearch} className="hidden md:flex items-center relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-56 rounded-xl border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Search size={16} className="absolute left-3 text-ink-400" />
          </form>

          <button
            className="md:hidden rounded-lg p-2 text-ink-700 hover:bg-ink-50"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <Link href="/cart" className="relative rounded-lg p-2 text-ink-700 hover:bg-ink-50" aria-label="Cart">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="border-t border-ink-100 bg-white p-3 md:hidden">
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="input pl-9"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            </div>
            <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-ink-500">
              <X size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-brand-700">{storeName}</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 text-ink-500">
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-ink-100 font-medium">
                Home <ChevronRight size={16} className="text-ink-300" />
              </Link>
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-ink-100 font-medium">
                Shop All <ChevronRight size={16} className="text-ink-300" />
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3 border-b border-ink-100 text-ink-700"
                >
                  {c.name} <ChevronRight size={16} className="text-ink-300" />
                </Link>
              ))}
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 font-medium">
                Contact <ChevronRight size={16} className="text-ink-300" />
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
