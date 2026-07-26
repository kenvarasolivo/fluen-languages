import { Sidebar, MobileHeader, MobileNav } from "@/components/sidebar";
import { Onboarding } from "@/components/onboarding";
import { AppRibbons } from "@/components/flow-art";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
      <Sidebar />
      <MobileHeader />
      {/* Shared canvas — the same water as the landing page, with a very
          faint ribbon field drifting behind every view so the app reads
          as one world. Pages layer their own surfaces on top. */}
      <main className="app-main bg-mesh relative min-h-0 min-w-0 flex-1">
        <AppRibbons />
        <div className="relative z-10 h-full">{children}</div>
      </main>
      <MobileNav />
      <Onboarding />
    </div>
  );
}
