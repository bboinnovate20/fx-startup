import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Fallback behind SF Pro. Apple devices resolve SF Pro first; everywhere else
// this is the face that actually draws.
const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-inter",
});

// Hero headlines. The Google Fonts entry has no size-adjust metrics, and that
// lookup is reported as a build warning, so the Latin file is hosted here.
const hegarty = localFont({
  src: "../public/fonts/BBHHegarty-latin.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-bbh-hegarty",
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
      className={`${hegarty.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
