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
      <main className="min-h-0 min-w-0 flex-1">{children}</main>
      <MobileNav />
      <Onboarding />
    </div>
  );
}
