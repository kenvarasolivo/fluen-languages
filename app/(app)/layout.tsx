import { Sidebar, MobileHeader, MobileNav } from "@/components/sidebar";
import { Onboarding } from "@/components/onboarding";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
      <Sidebar />
      <MobileHeader />
      {/* Shared canvas — the landing's night sky in dark mode, the soft
          fluid-blue aurora in light mode — so every view reads as one
          world. Pages layer their own surfaces on top. */}
      <main className="app-main bg-mesh min-h-0 min-w-0 flex-1">{children}</main>
      <MobileNav />
      <Onboarding />
    </div>
  );
}
