import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SilvyOS — Digital Dining Experience",
  description: "Next-generation QR digital menu and dining experience platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-100 text-stone-900 selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
