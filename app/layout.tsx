import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FLUEN",
  description: "Learn languages. Nothing else.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the app paint behind the iOS notch/home bar; the layouts pad
  // with env(safe-area-inset-*) where needed.
  viewportFit: "cover",
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
            __html: `try{if(localStorage.getItem("fluen:theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
