import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { prisma } from "@/lib/db";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const categories = await prisma.category
    .findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 8 })
    .catch(() => []);

  return (
    <>
      <Header
        storeName={settings?.storeName || "MobileHub"}
        logoUrl={settings?.logoUrl || undefined}
        categories={categories.map((c: { name: string; slug: string }) => ({ name: c.name, slug: c.slug }))}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} categories={categories.map((c: { name: string; slug: string }) => ({ name: c.name, slug: c.slug }))} />
      {settings?.whatsappNumber && <WhatsAppButton number={settings.whatsappNumber} />}
    </>
  );
}
