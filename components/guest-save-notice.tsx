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
    <div><strong>Make your progress a keeper.</strong><p>You’re practicing as a guest. Words and progress stay in this browser. Sign in to save new learning to your account.</p></div>
    <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in to save <ArrowRight size={16} /></Link>
  </aside>;
}

export function PracticeSaveHint() {
  const { user } = useAccount();
  return <div className="hero-reassurance"><Check size={16} />{user ? "New progress and words save to your account." : <>Try as a guest <span>·</span><Link href="/login">Sign in to save your learning</Link></>}</div>;
}
