"use client";

import Link from "next/link";
import { Heart, Scale, ShoppingCart } from "lucide-react";
import { useI18n } from "@/shared/i18n";
import { useAppSelector } from "@/shared/store/hooks";

const formatCount = (count: number) => count > 99 ? "99+" : String(count);

export const HeaderActions = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { t } = useI18n();
  const cartCount = useAppSelector((state) =>
    state.cart.products.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useAppSelector((state) => state.wishlist.productIds.length);
  const comparisonCount = useAppSelector((state) => state.comparison.products.length);

  const actions = [
    { href: "/cart", icon: ShoppingCart, count: cartCount, label: t("header.cart", { count: cartCount }) },
    { href: "/wishlist", icon: Heart, count: wishlistCount, label: t("header.wishlist", { count: wishlistCount }) },
    { href: "/comparison", icon: Scale, count: comparisonCount, label: t("header.comparison", { count: comparisonCount }) },
  ];

  return (
    <nav className="flex items-center gap-1" aria-label={t("header.shoppingActions")}>
      {actions.map(({ href, icon: Icon, count, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition hover:bg-surface-muted hover:text-accent sm:h-10 sm:w-10"
          aria-label={label}
          title={label}
        >
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-background">
              {formatCount(count)}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
};
