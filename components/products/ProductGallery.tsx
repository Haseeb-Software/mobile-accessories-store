"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type MediaItem = { url: string; altText?: string | null };

export default function ProductGallery({
  images,
  videoUrl,
  title,
}: {
  images: MediaItem[];
  videoUrl?: string | null;
  title: string;
}) {
  const media: { type: "image" | "video"; url: string }[] = [
    ...images.map((i) => ({ type: "image" as const, url: i.url })),
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
  ];
  const [active, setActive] = useState(0);
  const current = media[active] || { type: "image" as const, url: "/placeholder-product.svg" };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ink-50">
        {current.type === "image" ? (
          <Image src={current.url} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
        ) : (
          <video src={current.url} controls className="h-full w-full object-cover" />
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2",
                active === i ? "border-brand-600" : "border-transparent"
              )}
            >
              {m.type === "image" ? (
                <Image src={m.url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-ink-800 text-[10px] text-white">
                  VIDEO
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
