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
import { LanguageSwitcher } from "@/components/language-switcher";

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

function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setAccount(
        user.is_anonymous
          ? { kind: "guest" }
          : { kind: "user", email: user.email ?? "Account" },
      );
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return { account, signOut };
}

/** Desktop sidebar — hidden on small screens in favour of the
    mobile top bar + bottom tab bar. */
export function Sidebar() {
  const pathname = usePathname();
  const { account, signOut } = useAccount();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md text-base font-semibold tracking-[0.18em]"
        >
          <span aria-hidden className="size-2.5 rounded-[4px] bg-accent shadow-[0_0_10px] shadow-accent/50" />
          FLUEN
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors duration-150 ${
                active
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
              }`}
            >
              <Icon
                size={19}
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
            <span className="flex-1">Sign in</span>
            <span className="rounded-full border border-border px-1.5 py-px text-[10px] uppercase tracking-wide">
              Guest
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
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <LogOut size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </aside>
  );
}

/** Slim top bar for small screens — logo, level, theme and account. */
export function MobileHeader() {
  const { account, signOut } = useAccount();

  return (
    <header
      className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-4 pt-[env(safe-area-inset-top)] md:hidden"
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-md text-sm font-semibold tracking-[0.18em]"
      >
        <span aria-hidden className="size-2 rounded-[3px] bg-accent shadow-[0_0_8px] shadow-accent/40" />
        FLUEN
      </Link>
      <div className="flex items-center gap-1.5">
        <LanguageSwitcher variant="compact" />
        <ThemeToggle />
        {account?.kind === "guest" && (
          <Link
            href="/login"
            aria-label="Sign in"
            className="flex items-center gap-1.5 rounded-md p-2 text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <LogIn size={16} strokeWidth={1.75} />
          </Link>
        )}
        {account?.kind === "user" && (
          <button
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-md p-2 text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </header>
  );
}

/** Bottom tab bar for small screens. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-stretch border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pb-1.5 pt-2 text-[10px] font-medium transition-colors duration-150 ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.75} />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
