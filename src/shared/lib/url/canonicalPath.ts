const STATIC_FILE_PATTERN = /\/[^/]+\.[^/]+$/;

const isOpaqueIdSegment = (segments: string[], index: number) => {
  const first = segments[0]?.toLowerCase();
  const second = segments[1]?.toLowerCase();

  if (first === "admin" && index === 2) {
    return ["products", "customers", "orders", "pages", "menus"].includes(second);
  }

  if (first === "account" && second === "orders" && index === 2) return true;
  if (first === "movies" && index === 2) return true;

  return false;
};

export const shouldCanonicalizePathname = (pathname: string) =>
  !pathname.startsWith("/_next/") &&
  !pathname.startsWith("/api/") &&
  pathname !== "/api" &&
  !STATIC_FILE_PATTERN.test(pathname);

export const getCanonicalPathname = (pathname: string) => {
  if (!shouldCanonicalizePathname(pathname)) return pathname;

  const segments = pathname.split("/");
  return segments
    .map((segment, index) => {
      if (!segment || isOpaqueIdSegment(segments.slice(1), index - 1)) return segment;
      return segment.toLowerCase();
    })
    .join("/");
};
