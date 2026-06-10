"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Layers, Clapperboard, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/learn", label: "Foundations", icon: Layers },
  { href: "/immerse", label: "Immerse", icon: Clapperboard },
  { href: "/speak", label: "Speak", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="text-sm font-semibold tracking-[0.18em]">
          FLEUN
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-soft text-foreground"
                  : "text-muted hover:bg-surface-raised hover:text-foreground"
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted">Deutsch · B1</p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
