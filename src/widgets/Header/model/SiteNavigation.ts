import { T_NavItem } from "@/shared/ui/Navigation/types";


export const siteNavigation: T_NavItem[] = [
  { id: "home", labelKey: "nav.home", href: "/" },
  { id: "popular", labelKey: "nav.popular", href: "/popular" },
  { id: "battle", labelKey: "nav.battle", href: "/battle" },
  { id: "movies", labelKey: "nav.movies", href: "/movies" },
  { id: "products", labelKey: "nav.products", href: "/products" },
  { id: "categories", labelKey: "nav.categories", href: "/categories" },
] as const;
