import { describe, expect, it } from "vitest";
import { getCanonicalPathname, shouldCanonicalizePathname } from "./canonicalPath";

describe("canonical pathname", () => {
  it.each([
    ["/Wishlist", "/wishlist"],
    ["/PRODUCTS/Red-Lipstick", "/products/red-lipstick"],
    ["/Categories/BEAUTY/", "/categories/beauty/"],
    ["/About-US", "/about-us"],
  ])("normalizes public route %s", (pathname, expected) => {
    expect(getCanonicalPathname(pathname)).toBe(expected);
  });

  it.each([
    ["/ADMIN/Orders/Order-ABC", "/admin/orders/Order-ABC"],
    ["/ADMIN/Products/Product-ID/Edit", "/admin/products/Product-ID/edit"],
    ["/Account/Orders/Order-ABC", "/account/orders/Order-ABC"],
    ["/Movies/TV/TMDB-ID", "/movies/tv/TMDB-ID"],
  ])("preserves opaque identifiers in %s", (pathname, expected) => {
    expect(getCanonicalPathname(pathname)).toBe(expected);
  });

  it.each(["/_next/static/chunk.js", "/api/Orders", "/flags/UA.svg", "/favicon.ico"])(
    "ignores internal or file pathname %s",
    (pathname) => {
      expect(shouldCanonicalizePathname(pathname)).toBe(false);
      expect(getCanonicalPathname(pathname)).toBe(pathname);
    },
  );
});
