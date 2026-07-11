import { Greeting } from "./_components/greeting";
import { LevelProgress } from "./_components/level-progress";
import { StatsGrid } from "./_components/stats";
import { QuickActions } from "./_components/quick-actions";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Floating pill header, matching every other view. */}
      <header className="app-header topbar-inset mt-3 flex h-14 shrink-0 items-center rounded-full px-5 shadow-raised sm:mt-4">
        <h1 className="eyebrow text-sm text-white">Dashboard</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Rounded hero card, then width-capped content below so a wide
            laptop fills with content instead of stranding it in an island. */}
        <div className="mx-auto w-full max-w-4xl px-4 pt-5 sm:px-8 sm:pt-6">
          <Greeting />
        </div>
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-10">
          <LevelProgress />
          <StatsGrid />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
