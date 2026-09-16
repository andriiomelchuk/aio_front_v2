import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/shared/i18n";
import { StoreProvider } from "@/shared/store/StoreProvider";
import { CartInitializer } from "@/features/cart/ui/CartInitializer";
import { ComparisonInitializer } from "@/features/comparison/ui/ComparisonInitializer";
import { WishlistInitializer } from "@/features/wishlist";
import { ToastProvider } from "@/shared/ui";
import { AuthInitializer } from "@/features/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "AIO",
    template: "%s | AIO",
  },
  description:
    "A modular web platform with commerce, movie discovery, and GitHub tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <I18nProvider>
            <ToastProvider>
              <CartInitializer />
              <ComparisonInitializer />
              <WishlistInitializer />
              <AuthInitializer />
              {children}
            </ToastProvider>
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
