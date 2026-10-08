import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { uploadMedia } from "@/lib/storage/cloudinary";

// POST /api/upload  — body: multipart/form-data with a "file" field
// Converts to a base64 data URI and forwards to Cloudinary.
export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "mobile-shop/products";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const MAX_SIZE = 25 * 1024 * 1024; // 25MB (video-friendly)
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await uploadMedia(dataUri, folder);

    return NextResponse.json({ ...result });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: "Upload failed. Check your Cloudinary configuration." }, { status: 500 });
  }
}
