"use client";
import Link from "next/link";
import { ChevronDown, LogIn, LogOut, Cloud, LoaderCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount } from "./account-provider";
import { getSupabase } from "@/lib/supabase";

export function AccountMenu() {
  const { user, loading, error: syncError } = useAccount();
  const pathname = usePathname();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = ["/write", "/speak", "/words"].includes(pathname) ? `?next=${encodeURIComponent(pathname)}` : "";
  if (!user) return <Link className="header-sign-in" href={`/login${next}`}><LogIn size={16} /><span>Sign in</span></Link>;
  return <details className="account-menu">
    <summary aria-label="Account menu"><span className="account-avatar">{user.email?.charAt(0).toUpperCase() ?? "F"}</span><span className="account-menu-label">My account</span><ChevronDown size={14} /></summary>
    <div className="account-dropdown">
      <span className="account-dropdown-label">SIGNED IN AS</span><strong>{user.email}</strong>
      <p>{loading ? <LoaderCircle size={15} /> : <Cloud size={15} />}{loading ? "Loading your saved learning…" : syncError ? "Sync needs attention" : "Saving new learning to your account"}</p>
    <button disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      const result = await getSupabase()!.auth.signOut();
      if (result.error) setError(result.error.message);
      setBusy(false);
    }}><LogOut size={16} />{busy ? "Signing out…" : "Sign out"}</button>
    {error && <span role="alert">{error}</span>}
    </div>
  </details>;
}
