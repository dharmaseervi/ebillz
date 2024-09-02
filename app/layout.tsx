import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EBillz",
  description: "e billing system",
  icons: {
    icon: '/android-chrome-512x512.png', // /public path
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
