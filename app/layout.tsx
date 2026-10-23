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
    // The app's own mark (desktop/build/icon.svg of Taio11k/SwingBus-App), copied here as it is
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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
