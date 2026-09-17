import { AssignedMenu } from "@/components/Menu";
import { useSiteSettings } from "@/shared/siteSettings";
import { Mail, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  const settings = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="min-h-[var(--footer-height)] border-t border-border bg-surface">
      <div className="mx-auto grid min-h-[var(--footer-height)] max-w-7xl gap-6 px-4 py-6 text-sm text-muted sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-semibold text-foreground">{settings.general.siteName}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {settings.contact.email && <a className="inline-flex items-center gap-2 hover:text-accent" href={`mailto:${settings.contact.email}`}><Mail size={16} />{settings.contact.email}</a>}
            {settings.contact.phone && <a className="inline-flex items-center gap-2 hover:text-accent" href={`tel:${settings.contact.phone}`}><Phone size={16} />{settings.contact.phone}</a>}
            {settings.contact.address && <span className="inline-flex items-center gap-2"><MapPin size={16} />{settings.contact.address}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 md:justify-end">
          {settings.contact.facebookUrl && <a href={settings.contact.facebookUrl} target="_blank" rel="noreferrer" className="font-medium hover:text-accent">Facebook</a>}
          {settings.contact.instagramUrl && <a href={settings.contact.instagramUrl} target="_blank" rel="noreferrer" className="font-medium hover:text-accent">Instagram</a>}
        </div>
        <div className="border-t border-border pt-4 md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {settings.general.siteName}</span>
          <AssignedMenu target={{ type: "global" }} region="footer" orientation="horizontal" />
        </div>
      </div>
    </footer>
  );
};
