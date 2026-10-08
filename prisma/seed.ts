import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Site Settings ---
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "MobileHub",
      storeDescription: "Premium mobile accessories at honest prices — fast delivery across Pakistan.",
      phone: "+92 300 1234567",
      whatsappNumber: "923001234567",
      email: "support@mobilehub.pk",
      address: "Lahore, Pakistan",
      standardShippingFee: 200,
      freeShippingThreshold: 5000,
      currency: "PKR",
      heroHeading: "Upgrade Your Everyday Tech",
      heroSubheading: "Premium mobile accessories at great prices — earbuds, chargers, cables, stands and more.",
      footerText: "Premium mobile accessories at honest prices. Fast delivery across Pakistan with Cash on Delivery.",
    },
  });

  // --- Admin user ---
  const adminEmail = "admin@mobilehub.pk";
  const adminPassword = "Admin123!";
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        name: "Store Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: "SUPER_ADMIN",
      },
    });
    console.log(`Admin created -> email: ${adminEmail} / password: ${adminPassword} (CHANGE THIS)`);
  }

  // --- Categories ---
  const categoriesData = [
    { name: "AirPods & Earbuds", slug: "airpods", description: "Wireless earbuds and AirPods-style accessories.", sortOrder: 1 },
    { name: "Cables", slug: "cables", description: "USB, Type-C, and Lightning charging cables.", sortOrder: 2 },
    { name: "Chargers", slug: "chargers", description: "Fast wall chargers and car chargers.", sortOrder: 3 },
    { name: "Mobile Stands", slug: "stands", description: "Desk stands and car phone holders.", sortOrder: 4 },
    { name: "Power Banks", slug: "power-banks", description: "Portable battery packs for on-the-go charging.", sortOrder: 5 },
    { name: "Cases & Protectors", slug: "cases", description: "Phone cases and screen protectors.", sortOrder: 6 },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.slug] = cat.id;
  }

  // --- Sample products ---
  const placeholderImage = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80";

  const productsData = [
    {
      title: "AirPods Pro Style Wireless Earbuds",
      slug: "airpods-pro-style-wireless-earbuds",
      description: "Premium wireless earbuds with active noise cancellation, touch controls, and a compact charging case. Enjoy crisp, immersive sound wherever you go.",
      shortDescription: "ANC wireless earbuds with charging case.",
      price: 4999, salePrice: 3499, sku: "MH-EAR-001",
      categorySlug: "airpods", stockQuantity: 45, isFeatured: true, isBestSeller: true,
      features: ["Active Noise Cancellation", "Bluetooth 5.3", "24H total battery with case", "Touch controls"],
      specifications: { "Battery": "500mAh case / 50mAh buds", "Bluetooth": "5.3", "Water Resistance": "IPX4" },
    },
    {
      title: "Fast Charging Type-C Cable (1m)",
      slug: "fast-charging-type-c-cable",
      description: "Durable braided Type-C cable supporting fast charging and high-speed data transfer. Built to last with reinforced connectors.",
      shortDescription: "Braided 1m Type-C fast charging cable.",
      price: 799, sku: "MH-CAB-001",
      categorySlug: "cables", stockQuantity: 120, isNewArrival: true,
      features: ["66W fast charging support", "Braided nylon exterior", "10000+ bend lifespan"],
      specifications: { "Length": "1m", "Output": "66W", "Connector": "USB-A to Type-C" },
    },
    {
      title: "20W PD Fast Wall Charger",
      slug: "20w-pd-fast-charger",
      description: "Compact 20W USB-C power delivery charger, compatible with all major smartphones. Charges your phone up to 50% in 30 minutes.",
      shortDescription: "20W USB-C PD fast wall charger.",
      price: 1499, salePrice: 1199, sku: "MH-CHG-001",
      categorySlug: "chargers", stockQuantity: 3, isFeatured: true,
      features: ["20W Power Delivery", "Compact design", "Overcharge protection"],
      specifications: { "Output": "20W", "Input": "100-240V", "Ports": "1x USB-C" },
    },
    {
      title: "Adjustable Desk Mobile Stand",
      slug: "adjustable-mobile-stand",
      description: "Foldable, adjustable phone stand for your desk. Perfect for video calls, watching videos, or following recipes hands-free.",
      shortDescription: "Foldable adjustable desk phone stand.",
      price: 899, sku: "MH-STD-001",
      categorySlug: "stands", stockQuantity: 60, isNewArrival: true,
      features: ["Adjustable viewing angle", "Foldable & portable", "Anti-slip base"],
      specifications: { "Material": "Aluminum alloy", "Compatible": "4-8 inch devices" },
    },
    {
      title: "Magnetic Car Phone Holder",
      slug: "magnetic-car-phone-holder",
      description: "Strong magnetic car mount for your dashboard or air vent. 360-degree rotation for the perfect viewing angle while driving.",
      shortDescription: "360° magnetic car dashboard mount.",
      price: 1299, sku: "MH-STD-002",
      categorySlug: "stands", stockQuantity: 35, isBestSeller: true,
      features: ["Strong N52 magnets", "360° rotation", "Air vent & dashboard mount"],
      specifications: { "Mount Type": "Air vent / Dashboard" },
    },
    {
      title: "10000mAh Power Bank",
      slug: "10000mah-power-bank",
      description: "Slim and lightweight 10000mAh power bank with dual USB output. Charge two devices simultaneously with fast charging support.",
      shortDescription: "Slim 10000mAh dual-output power bank.",
      price: 2799, salePrice: 2299, sku: "MH-PWR-001",
      categorySlug: "power-banks", stockQuantity: 50, isFeatured: true, isBestSeller: true,
      features: ["10000mAh capacity", "Dual USB output", "LED battery indicator", "18W fast charging"],
      specifications: { "Capacity": "10000mAh", "Output": "18W", "Ports": "2x USB-A, 1x USB-C" },
    },
    {
      title: "Clear Shockproof Phone Case",
      slug: "clear-shockproof-phone-case",
      description: "Crystal clear shockproof case with reinforced corners. Shows off your phone's original design while providing drop protection.",
      shortDescription: "Clear shockproof protective case.",
      price: 599, sku: "MH-CASE-001",
      categorySlug: "cases", stockQuantity: 0, isNewArrival: true,
      features: ["Shockproof corners", "Anti-yellowing", "Precise cutouts"],
      specifications: { "Material": "TPU + PC" },
    },
    {
      title: "Tempered Glass Screen Protector (2-Pack)",
      slug: "tempered-glass-screen-protector",
      description: "9H hardness tempered glass screen protector with oleophobic coating for smudge resistance. Includes easy installation kit.",
      shortDescription: "9H tempered glass, 2-pack with kit.",
      price: 499, sku: "MH-CASE-002",
      categorySlug: "cases", stockQuantity: 200,
      features: ["9H hardness", "Oleophobic coating", "Bubble-free installation"],
      specifications: { "Hardness": "9H", "Pack Size": "2" },
    },
  ];

  for (const p of productsData) {
    const { categorySlug, ...rest } = p;
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        ...rest,
        categoryId: categories[categorySlug],
        isActive: true,
        images: {
          create: [{ url: placeholderImage, isPrimary: true, sortOrder: 0, altText: p.title }],
        },
      },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
