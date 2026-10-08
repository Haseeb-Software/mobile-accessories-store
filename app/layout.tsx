import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/layout/ToastProvider";
import { prisma } from "@/lib/db";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const name = settings?.storeName || "MobileHub";
  return {
    title: { default: `${name} — Premium Mobile Accessories`, template: `%s | ${name}` },
    description:
      settings?.storeDescription ||
      "Shop premium mobile accessories — earbuds, chargers, cables, stands and more. Fast delivery, Cash on Delivery available.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
