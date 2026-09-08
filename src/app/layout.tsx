import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/shared/i18n";
import { StoreProvider } from "@/shared/store/StoreProvider";
import { CartInitializer } from "@/features/cart/ui/CartInitializer";
import { ComparisonInitializer } from "@/features/comparison/ui/ComparisonInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AVO Portfolio Project",
  description:
    "Powered by Next.js, TypeScript, TailwindCSS, Redux Toolkit, and i18next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <I18nProvider>
            <CartInitializer />
            <ComparisonInitializer />
            {children}
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
