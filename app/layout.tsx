import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { AccountProvider } from "@/components/account-provider";
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
      <body><AccountProvider><LanguageProvider>{children}</LanguageProvider></AccountProvider></body>
    </html>
  );
}
