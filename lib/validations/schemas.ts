import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const productVariantSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  priceModifier: z.number().default(0),
  stockQuantity: z.number().int().min(0).default(0),
  sku: z.string().optional(),
});

export const productSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, dashes only"),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  salePrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  specifications: z.record(z.string()).optional(),
  features: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
  variants: z.array(productVariantSchema).default([]),
}).refine(
  (data) => !data.salePrice || data.salePrice < data.price,
  { message: "Sale price must be less than regular price", path: ["salePrice"] }
);

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantLabel: z.string().optional(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(5, "Complete address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
});

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Please write at least a short review"),
});

export const siteSettingsSchema = z.object({
  storeName: z.string().min(1),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  standardShippingFee: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  currency: z.string().default("PKR"),
  storeDescription: z.string().optional(),
  heroHeading: z.string().optional(),
  heroSubheading: z.string().optional(),
  footerText: z.string().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ]),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
