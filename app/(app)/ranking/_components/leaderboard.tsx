"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Crown, Library, Loader2, Trophy, UserRound } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";

interface Entry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  words_collected: number;
}

type Phase = "loading" | "ready" | "error";

/** Bold podium colours for the top three, keyed to rank. */
const MEDAL = ["text-amber", "text-muted", "text-coral"] as const;

function Avatar({ entry, size }: { entry: Entry; size: number }) {
  const initial = (entry.username[0] ?? "?").toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-border-strong bg-surface"
      style={{ width: size, height: size }}
    >
      {entry.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.avatar_url}
          alt={entry.username}
          className="size-full object-cover"
        />
      ) : (
        <span
          className="font-extrabold tracking-tight text-muted"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </span>
      )}
    </span>
  );
}

export function Leaderboard() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [meId, setMeId] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const session = await ensureSession();
        setMeId(session.user.id);

        const { data, error } = await supabase.rpc("get_leaderboard");
        if (error) throw error;

        setEntries(
          (data as Entry[]).map((e) => ({
            ...e,
            words_collected: Number(e.words_collected),
          })),
        );
        setPhase("ready");
      } catch (err) {
        console.error("[ranking]", err);
        setPhase("error");
      }
    })();
  }, []);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex h-full flex-col">
      <header className="app-header flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
        <h1 className="eyebrow text-sm text-white">Ranking</h1>
        {phase === "ready" && (
          <span className="hdr-chip rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums">
            {entries.length} {entries.length === 1 ? "learner" : "learners"}
          </span>
        )}
      </header>

      {phase === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading ranking ...</p>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface-raised shadow-xs">
            <AlertCircle size={18} strokeWidth={1.75} className="text-negative" />
          </span>
          <p className="text-sm text-muted">The ranking could not be loaded.</p>
        </div>
      )}

      {phase === "ready" && (
        <div className="flex-1 overflow-y-auto bg-mesh">
          <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center gap-3 pt-16 text-center">
                <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-raised shadow-xs">
                  <Trophy size={20} strokeWidth={1.5} className="text-muted" />
                </span>
                <p className="max-w-xs text-sm leading-relaxed text-muted">
                  No ranked learners yet. Collect words to claim the top spot —
                  set a username on your profile to appear here.
                </p>
              </div>
            ) : (
              <div className="fade-up flex flex-col gap-8">
                {/* Podium — top three */}
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {podium.map((e, i) => {
                    const isMe = e.user_id === meId;
                    return (
                      <li
                        key={e.user_id}
                        className={`relative flex flex-col items-center gap-3 rounded-2xl border-[1.5px] px-4 py-6 text-center transition-transform duration-150 hover:-translate-y-1 ${
                          i === 0
                            ? "border-border-strong bg-surface-raised shadow-pop sm:-mt-2"
                            : "border-border-strong bg-surface-raised shadow-xs"
                        }`}
                      >
                        <span className={`flex items-center gap-1 ${MEDAL[i]}`}>
                          {i === 0 ? (
                            <Crown size={18} strokeWidth={2.25} />
                          ) : (
                            <Trophy size={15} strokeWidth={2.25} />
                          )}
                          <span className="text-sm font-extrabold tabular-nums">
                            #{i + 1}
                          </span>
                        </span>
                        <Avatar entry={e} size={i === 0 ? 72 : 60} />
                        <div className="flex min-w-0 flex-col items-center">
                          <p className="max-w-full truncate text-sm font-bold tracking-tight">
                            {e.username}
                          </p>
                          {isMe && (
                            <span className="eyebrow mt-0.5 text-[9px] text-accent">
                              You
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-1 text-xs text-muted">
                          <Library size={12} strokeWidth={2} />
                          <span className="font-bold tabular-nums text-foreground">
                            {e.words_collected}
                          </span>
                          words
                        </p>
                      </li>
                    );
                  })}
                </ul>

                {/* The rest of the field */}
                {rest.length > 0 && (
                  <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border-[1.5px] border-border-strong bg-surface-raised">
                    {rest.map((e, i) => {
                      const isMe = e.user_id === meId;
                      return (
                        <li
                          key={e.user_id}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors duration-150 sm:gap-4 ${
                            isMe ? "bg-accent-soft" : "hover:bg-foreground/[0.025]"
                          }`}
                        >
                          <span className="w-7 shrink-0 text-center text-sm font-bold tabular-nums text-muted">
                            {i + 4}
                          </span>
                          <Avatar entry={e} size={40} />
                          <p className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight">
                            {e.username}
                            {isMe && (
                              <span className="eyebrow ml-2 text-[9px] text-accent">
                                You
                              </span>
                            )}
                          </p>
                          <p className="flex shrink-0 items-center gap-1.5 text-sm">
                            <span className="font-bold tabular-nums">
                              {e.words_collected}
                            </span>
                            <span className="hidden text-xs text-muted sm:inline">
                              words
                            </span>
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                  <UserRound size={12} strokeWidth={2} />
                  Not on the board?{" "}
                  <Link href="/profile" className="font-medium text-accent hover:underline">
                    Set a username
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
