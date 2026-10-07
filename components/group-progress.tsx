import type { Progress } from "@/lib/writing-progress";

export function GroupProgress({ label, progress }: { label: string; progress: Progress }) {
  return (
    <span className="group-progress" title={`${progress.correct} of ${progress.total} sentences correct`}>
      <span className="group-progress-caption">{progress.percent}%</span>
      <progress aria-label={`${label} progress`} value={progress.correct} max={progress.total || 1} />
    </span>
  );
}
