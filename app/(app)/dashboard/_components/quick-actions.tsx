import Link from "next/link";
import { Layers, Clapperboard, MessageCircle, ArrowUpRight } from "lucide-react";

const actions = [
  {
    href: "/learn",
    label: "Foundations",
    desc: "Drill vocabulary with smart flashcards.",
    icon: Layers,
    tile: "tile-accent",
    chip: "bg-accent-soft text-accent",
  },
  {
    href: "/immerse",
    label: "Immerse",
    desc: "Read real texts and tap to save new words.",
    icon: Clapperboard,
    tile: "tile-coral",
    chip: "bg-coral-soft text-coral",
  },
  {
    href: "/speak",
    label: "Speak",
    desc: "Chat out loud and get gentle corrections.",
    icon: MessageCircle,
    tile: "tile-teal",
    chip: "bg-teal-soft text-teal",
  },
];

export function QuickActions() {
  return (
    <div className="fade-up fade-up-2 w-full max-w-4xl">
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
        Jump back in
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {actions.map(({ href, label, desc, icon: Icon, tile, chip }) => (
          <Link
            key={href}
            href={href}
            className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border ${tile} p-5 shadow-raised transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop`}
          >
            <span className={`flex size-10 items-center justify-center rounded-xl ${chip}`}>
              <Icon size={18} strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold">
                {label}
                <ArrowUpRight
                  size={14}
                  aria-hidden
                  className="text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
