import { Greeting } from "./_components/greeting";
import { StatsGrid } from "./_components/stats";

export default function DashboardPage() {
  return (
    <div className="bg-mesh flex h-full flex-col items-center justify-center gap-10 overflow-y-auto px-8 py-12">
      <Greeting />
      <StatsGrid />
    </div>
  );
}
