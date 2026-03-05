import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellar Trust | Task Marketplace",
  description: "A decentralized, trustless freelance task marketplace built on the Stellar network. Developed by Alper Bilgin.",
  icons: {
    icon: "https://cryptologos.cc/logos/stellar-xlm-logo.png",
  },
  authors: [
    { name: "Alper Bilgin", url: "https://alperbilgin.vercel.app/" },
    { name: "Linktree", url: "https://linktr.ee/Alper_Bilgin" }
  ],
  creator: "Alper Bilgin",
  applicationName: "Stellar Trust",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
