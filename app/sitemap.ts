import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/shop`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/shipping-policy`, lastModified: new Date() },
    { url: `${baseUrl}/return-policy`, lastModified: new Date() },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date() },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c: any) => ({
    url: `${baseUrl}/shop/${c.slug}`,
    lastModified: c.updatedAt,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p: any) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
