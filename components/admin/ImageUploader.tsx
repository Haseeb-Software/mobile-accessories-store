"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export type UploadedImage = {
  url: string;
  publicId?: string;
  isPrimary: boolean;
  sortOrder: number;
};

export default function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploaded: UploadedImage[] = [];
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "mobile-shop/products");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push({
          url: data.url,
          publicId: data.publicId,
          isPrimary: false,
          sortOrder: images.length + uploaded.length,
        });
      } catch (err: any) {
        toast.error(`${file.name}: ${err.message}`);
      }
    }

    const merged = [...images, ...uploaded];
    if (merged.length > 0 && !merged.some((i) => i.isPrimary)) merged[0].isPrimary = true;
    onChange(merged);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((i) => i.isPrimary)) updated[0].isPrimary = true;
    onChange(updated);
  }

  function setPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-6 text-center hover:border-brand-400"
      >
        {uploading ? (
          <Loader2 className="animate-spin text-brand-600" size={24} />
        ) : (
          <>
            <Upload className="text-ink-400" size={24} />
            <p className="mt-2 text-sm text-ink-500">Click or drag images/video here to upload</p>
            <p className="text-xs text-ink-400">JPG, PNG, WEBP, MP4 up to 25MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.url + i} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-200">
              <Image src={img.url} alt="" fill sizes="100px" className="object-cover" />
              {img.isPrimary && (
                <span className="absolute left-1 top-1 rounded-full bg-brand-600 p-1 text-white">
                  <Star size={10} fill="white" />
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    className="rounded-full bg-white p-1.5 text-ink-700"
                    title="Set as primary"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded-full bg-white p-1.5 text-red-600"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
