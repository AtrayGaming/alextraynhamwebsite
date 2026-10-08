import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
export const metadata: Metadata = {
  title: "Radio Ready | Practice with purpose",
  description:
    "An interactive learning product by Alex Traynham. Explore a fictional training demo, from flashcards to trainer-led sessions.",
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
