import React from "react"
import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { getServerLanguage } from "@/lib/i18n/get-server-language";
import { LanguageProvider } from "@/lib/i18n/language-context";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "KHAIATI | Bespoke Tailoring & Fabrics",
  description:
    "Khaiati — bespoke tailoring and fine fabrics. Custom shirts, vests, coats, pants, and jackets crafted to measure.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language, dir } = await getServerLanguage();

  return (
    <html lang={language} dir={dir} className="bg-background">
      <body
        className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider initialLanguage={language}>
          {children}
        </LanguageProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
