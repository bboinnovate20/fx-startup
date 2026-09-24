import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
});

export const metadata: Metadata = {
  title: "FX Swift | Compare currency exchange rates",
  description:
    "Compare currency exchange rates, estimate transfers, and set alerts for your preferred rate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${boing.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
