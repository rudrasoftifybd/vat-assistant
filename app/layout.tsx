import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { LanguageProvider } from "@/components/shared/language-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ভ্যাট ও কমপ্লায়েন্স সহায়ক | VAT & Compliance Assistant",
  description: "VAT compliance tool for Bangladeshi businesses",
  manifest: "/manifest.json",
  other: { "mobile-web-app-capable": "yes" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="light">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`,
          }}
        />
      </body>
    </html>
  );
}
