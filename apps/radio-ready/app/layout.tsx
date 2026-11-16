import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
export const metadata: Metadata = {
  title: "Radio Ready | Flashcards and recall practice",
  description:
    "A small practice tool by Alex Traynham: flashcards and short recall sessions for learning a set of codes. The public demo uses fictional festival content.",
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
