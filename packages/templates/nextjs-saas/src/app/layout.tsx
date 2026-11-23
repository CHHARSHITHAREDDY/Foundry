import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venture Prototype",
  description: "Autonomous SaaS Application built with Next.js 15",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
