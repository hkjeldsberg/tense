import type { Metadata, Viewport } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";

const display = Bangers({ variable: "--font-display", weight: "400", subsets: ["latin", "latin-ext"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "The Memory Diorama",
  description: "Rebuild memories by choosing the right Spanish past tense: imperfecto or indefinido.",
};

export const viewport: Viewport = {
  themeColor: "#f3ead8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
