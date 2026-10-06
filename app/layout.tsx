import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Fluen — A little German, every day",
  description:
    "Find your flow in German. Practice writing and speaking with friendly AI feedback, from A1 to C2.",
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
