import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Fluen — Language in action",
  description:
    "The output-first language learning app. Turn what you know into what you can say through writing, conversation, and clear AI feedback. German and Chinese (pinyin) available now.",
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
