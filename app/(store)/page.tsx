import { prisma } from "@/lib/db";
import Hero from "@/components/layout/Hero";
import CategoryGrid from "@/components/layout/CategoryGrid";
import ProductRail from "@/components/layout/ProductRail";
import { WhyChooseUs, Testimonials, FAQ, PromoBanner } from "@/components/layout/HomeSections";

export const revalidate = 60;

async function getHomeData() {
  const [settings, categories, featured, bestSellers, newArrivals] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 10,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 10,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 10,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  return { settings, categories, featured, bestSellers, newArrivals };
}

export default async function HomePage() {
  const { settings, categories, featured, bestSellers, newArrivals } = await getHomeData();

  return (
    <>
      <Hero heading={settings?.heroHeading} subheading={settings?.heroSubheading} />
      <CategoryGrid categories={categories} />
      <ProductRail title="Featured Products" viewAllHref="/shop?featured=true" products={featured as any} />
      <PromoBanner />
      <ProductRail title="Best Sellers" viewAllHref="/shop?bestSeller=true" products={bestSellers as any} />
      <ProductRail title="New Arrivals" viewAllHref="/shop?newArrival=true" products={newArrivals as any} />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
    </>
  );
}
