"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Layers,
  Clapperboard,
  MessageCircle,
  Library,
  LogIn,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/learn", label: "Foundations", icon: Layers },
  { href: "/immerse", label: "Immerse", icon: Clapperboard },
  { href: "/speak", label: "Speak", icon: MessageCircle },
  { href: "/cards", label: "Cards", icon: Library },
];

type Account =
  | { kind: "guest" }
  | { kind: "user"; email: string };

export function Sidebar() {
  const pathname = usePathname();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setAccount(
        user.is_anonymous
          ? { kind: "guest" }
          : { kind: "user", email: user.email ?? "Konto" },
      );
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 shrink-0 items-center border-b border-border px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md text-sm font-semibold tracking-[0.18em]"
        >
          <span aria-hidden className="size-2 rounded-[3px] bg-accent shadow-[0_0_8px] shadow-accent/40" />
          FLUEN
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 ${
                active
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
              }`}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2 : 1.75}
                className={active ? "text-accent" : "text-muted transition-colors duration-150 group-hover:text-foreground"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Account */}
      <div className="border-t border-border px-3 py-3">
        {account?.kind === "guest" && (
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <LogIn size={16} strokeWidth={1.75} />
            <span className="flex-1">Anmelden</span>
            <span className="rounded-full border border-border px-1.5 py-px text-[10px] uppercase tracking-wide">
              Gast
            </span>
          </Link>
        )}
        {account?.kind === "user" && (
          <div className="flex items-center gap-2 px-2.5 py-1">
            <p className="min-w-0 flex-1 truncate text-xs text-muted" title={account.email}>
              {account.email}
            </p>
            <button
              onClick={signOut}
              aria-label="Abmelden"
              title="Abmelden"
              className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <LogOut size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs font-medium tracking-wide text-muted">
          Deutsch · <span className="text-accent">B1</span>
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
