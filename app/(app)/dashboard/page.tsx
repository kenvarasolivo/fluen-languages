import { Greeting } from "./_components/greeting";
import { StatsGrid } from "./_components/stats";

export default function DashboardPage() {
  return (
    <div className="bg-mesh h-full overflow-y-auto">
      {/* min-h-full + justify-center centers when there's room and
          scrolls naturally when there isn't (small screens). */}
      <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-12">
        <Greeting />
        <StatsGrid />
      </div>
    </div>
  );
}
