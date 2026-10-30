"use client";
import Link from "next/link";
import { ArrowRight, Check, Cloud } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAccount } from "./account-provider";

export function GuestSaveNotice() {
  const { user, loading } = useAccount();
  const pathname = usePathname();
  if (user || loading) return null;
  return <aside className="guest-save-notice" aria-label="Save your learning to an account">
    <span className="guest-save-icon"><Cloud size={22} /></span>
    <div><strong>Practicing as a guest</strong><p className="guest-detail">Words and progress stay in this browser. Sign in to save them to your account.</p><p className="guest-mobile-message">Progress stays in this browser.</p></div>
    <Link href={`/login?next=${encodeURIComponent(pathname)}`}><span className="guest-detail">Sign in to save</span><span className="guest-mobile-message">Sign in</span><ArrowRight size={16} /></Link>
  </aside>;
}

export function PracticeSaveHint() {
  const { user } = useAccount();
  return <div className="hero-reassurance"><Check size={16} />{user ? "New progress and words save to your account." : <>Try as a guest <span>·</span><Link href="/login">Sign in to save your learning</Link></>}</div>;
}
