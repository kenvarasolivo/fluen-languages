import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FLEUN",
  description: "Deutsch lernen. Nichts sonst.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        {/* Apply saved theme before first paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("fleun:theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
