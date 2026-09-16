import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Ajaia Docs | Intelligent Collaborative Document Studio",
  description:
    "Lightweight, AI-native collaborative document editor inspired by Google Docs and Notion. Built for high-velocity teams at Ajaia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
