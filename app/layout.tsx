import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { AccountProvider } from "@/components/account-provider";
import { PwaRegistration } from "@/components/pwa";
export const metadata: Metadata = {
  applicationName: "Fluen",
  appleWebApp: { capable: true, title: "Fluen", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  title: "Fluen — Language in action",
  description:
    "The output-first language learning app. Turn what you know into what you can say through writing, conversation, and clear AI feedback. German and Chinese (pinyin) available now.",
};
export const viewport: Viewport = { themeColor: "#72d1f4", viewportFit: "cover" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><PwaRegistration /><AccountProvider><LanguageProvider>{children}</LanguageProvider></AccountProvider></body>
    </html>
  );
}
