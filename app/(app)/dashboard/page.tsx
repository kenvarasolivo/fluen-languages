import { Greeting } from "./_components/greeting";
import { StatsGrid } from "./_components/stats";
import { QuickActions } from "./_components/quick-actions";

export default function DashboardPage() {
  return (
    <div className="bg-mesh h-full overflow-y-auto">
      {/* Full-bleed black hero, then width-capped content below so a wide
          laptop fills with content instead of stranding it in an island. */}
      <Greeting />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-10">
        <StatsGrid />
        <QuickActions />
      </div>
    </div>
  );
}
