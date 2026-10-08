import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteSettingsSchema } from "@/lib/validations/schemas";
import { requireAdminSession } from "@/lib/auth/require-admin";

// GET is public — the storefront needs it for header/footer/WhatsApp/shipping display
export async function GET() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "singleton" } });
  }
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = siteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("PUT /api/settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
