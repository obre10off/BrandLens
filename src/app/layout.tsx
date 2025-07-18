import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrandLens - AI Brand Monitoring for SaaS",
  description: "Track how AI platforms like ChatGPT and Claude mention your brand. Get weekly insights and competitor analysis.",
  keywords: ["AI monitoring", "brand tracking", "SaaS tools", "ChatGPT mentions", "Claude mentions", "competitor analysis"],
  authors: [{ name: "BrandLens" }],
  openGraph: {
    title: "BrandLens - AI Brand Monitoring",
    description: "Track your brand mentions across AI platforms",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://brandlens.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandLens - AI Brand Monitoring",
    description: "Track your brand mentions across AI platforms",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
