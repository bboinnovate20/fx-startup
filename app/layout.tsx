import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Brand/display typeface. The Google Fonts entry has no size-adjust metrics,
// and that lookup is reported as a build error, so the Latin file is hosted
// here the same way Boing is. Glyphs it does not carry fall through to Boing.
const googleSans = localFont({
  src: "../public/fonts/GoogleSans-latin.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-google-sans",
});

// Body face. `--font-body` used to name Inter without loading it, so body copy
// silently fell back to the system stack; this is what makes it real.
const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-inter",
});

// Kept wired up as the fallback behind Google Sans (and so it can be swapped
// back to primary without touching this file). `preload: false` because it is
// only reached for glyphs Google Sans doesn't carry.
const boing = localFont({
  src: [
    {
      path: "../public/fonts/Boing-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Boing-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Boing-Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    { path: "../public/fonts/Boing-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-boing",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "PAS FX | Compare currency exchange rates",
  description:
    "Compare currency exchange rates, estimate transfers, and set alerts for your preferred rate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${inter.variable} ${boing.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
