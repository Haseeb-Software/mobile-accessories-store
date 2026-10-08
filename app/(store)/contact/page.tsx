import { prisma } from "@/lib/db";
import { Phone, Mail, MapPin } from "lucide-react";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);

  return (
    <div className="container-app max-w-xl py-12">
      <h1 className="mb-2 text-2xl font-bold text-ink-900">Contact Us</h1>
      <p className="mb-8 text-sm text-ink-500">We&apos;d love to hear from you. Reach out any time.</p>

      <div className="card space-y-4 p-6">
        {settings?.phone && (
          <div className="flex items-center gap-3 text-sm text-ink-700">
            <Phone size={18} className="text-brand-600" /> {settings.phone}
          </div>
        )}
        {settings?.email && (
          <div className="flex items-center gap-3 text-sm text-ink-700">
            <Mail size={18} className="text-brand-600" /> {settings.email}
          </div>
        )}
        {settings?.address && (
          <div className="flex items-center gap-3 text-sm text-ink-700">
            <MapPin size={18} className="text-brand-600" /> {settings.address}
          </div>
        )}
        {settings?.whatsappNumber && (
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-2 block w-full text-center"
          >
            Chat with us on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
