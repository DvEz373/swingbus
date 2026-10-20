import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const site = "https://swingbus-present.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Swingbus · Plotting and grid calculations for power-system engineers",
  description:
    "An offline toolkit for grid-connection studies: PSCAD results next to field data, and the grid behind every test. A personal project.",
  openGraph: {
    type: "website",
    url: site,
    title: "Swingbus",
    description: "Benchmark the simulation. Size the grid. An offline toolkit for power-system engineers, built as a personal project.",
    images: ["/video/swingbus-demo-poster.jpg"],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' rx='5' fill='%232563eb'/%3E%3Cpath d='M3 14 L7.5 9 L11 12 L17 5' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e14" },
  ],
};

// Applies a theme chosen earlier before the first paint, so the page never flashes the other one
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans text-[16px] leading-relaxed">{children}</body>
    </html>
  );
}
