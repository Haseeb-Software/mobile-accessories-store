"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ number }: { number: string }) {
  const cleaned = number.replace(/[^0-9]/g, "");
  return (
    <a
      href={`https://wa.me/${cleaned}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  );
}
