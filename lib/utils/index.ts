import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | { toString(): string }, currency = "PKR") {
  const value = typeof amount === "number" ? amount : parseFloat(amount.toString());
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const orderIdAlphabet = "0123456789";
const nanoOrder = customAlphabet(orderIdAlphabet, 5);

export function generateOrderNumber() {
  const year = new Date().getFullYear();
  return `ORD-${year}-${nanoOrder()}`;
}

export function calculateDiscountPercent(price: number, salePrice?: number | null) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function stockLabel(stockQuantity: number, lowStockThreshold = 5) {
  if (stockQuantity <= 0) return { label: "Out of Stock", tone: "danger" as const };
  if (stockQuantity <= lowStockThreshold) return { label: `Only ${stockQuantity} left`, tone: "warning" as const };
  return { label: "In Stock", tone: "success" as const };
}

export function slugifyBasic(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
