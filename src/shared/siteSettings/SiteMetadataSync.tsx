"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "./SiteSettingsProvider";

const setMeta = (selector: string, attribute: string, value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!value) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    const [name, content] = attribute.split("=");
    element.setAttribute(name, content);
    document.head.appendChild(element);
  }
  element.content = value;
};

export const SiteMetadataSync = () => {
  const settings = useSiteSettings();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" || document.title === "AIO") {
      document.title = settings.seo.defaultTitle;
    }
    setMeta('meta[name="description"]', "name=description", settings.seo.defaultDescription);
    setMeta('meta[name="keywords"]', "name=keywords", settings.seo.keywords);
    setMeta('meta[property="og:image"]', "property=og:image", settings.seo.socialImageUrl);
  }, [pathname, settings.seo]);

  return null;
};
