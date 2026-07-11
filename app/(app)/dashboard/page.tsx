import { Greeting } from "./_components/greeting";
import { LevelProgress } from "./_components/level-progress";
import { StatsGrid } from "./_components/stats";
import { QuickActions } from "./_components/quick-actions";

export default function DashboardPage() {
  return (
    <div className="bg-mesh h-full overflow-y-auto">
      {/* Rounded hero card, then width-capped content below so a wide
          laptop fills with content instead of stranding it in an island. */}
      <div className="mx-auto w-full max-w-4xl px-4 pt-5 sm:px-8 sm:pt-8">
        <Greeting />
      </div>
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-10">
        <LevelProgress />
        <StatsGrid />
        <QuickActions />
      </div>
    </div>
  );
}
