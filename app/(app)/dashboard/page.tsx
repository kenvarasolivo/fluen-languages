import { Greeting } from "./_components/greeting";

const stats = [
  { label: "Due today", value: "36" },
  { label: "New cards", value: "14" },
  { label: "Minutes immersed", value: "23" },
  { label: "Conversations", value: "2" },
];

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 px-8">
      <Greeting />

      <div className="grid w-full max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-5 py-6 text-center">
            <p className="text-2xl font-medium tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
