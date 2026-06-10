import { Greeting } from "./_components/greeting";
import { StatsGrid } from "./_components/stats";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 px-8">
      <Greeting />
      <StatsGrid />
    </div>
  );
}
