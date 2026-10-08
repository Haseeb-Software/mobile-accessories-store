import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
};

/**
 * Upload a base64 data-URI (or remote URL) to Cloudinary.
 * Accepts images and videos; folder defaults to the product media folder.
 */
export async function uploadMedia(
  fileDataUri: string,
  folder = "mobile-shop/products"
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder,
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type === "video" ? "video" : "image",
  };
}

export async function deleteMedia(publicId: string, resourceType: "image" | "video" = "image") {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
