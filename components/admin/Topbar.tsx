"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, LayoutDashboard, Package, FolderTree, ShoppingCart, Star, Tag, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 lg:hidden">
      <button onClick={() => setOpen(true)} className="p-2 text-ink-700"><Menu size={22} /></button>
      <span className="font-bold text-brand-700">Admin Panel</span>
      <div className="w-8" />

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-brand-700">Admin Panel</span>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
                    )}
                  >
                    <item.icon size={18} /> {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
