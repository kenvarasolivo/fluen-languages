"use client";
import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowRight, Bookmark, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, MonitorSmartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/header";
import { useAccount } from "@/components/account-provider";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAccount();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [destination, setDestination] = useState("/write");
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && ["/write", "/speak", "/words"].includes(next)) setDestination(next);
  }, []);
  function changeMode(next: boolean) {
    setSignup(next); setShowPassword(false); setError(""); setNotice("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    const client = getSupabase();
    if (!client) { setError("Account sign-in has not been configured yet."); return; }
    setBusy(true);
    try {
      const { data, error } = signup
        ? await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/login` } })
        : await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (data.session) router.push(destination);
      else setNotice("Check your inbox to confirm your email. Then come back here to sign in.");
    } catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed. Please try again."); }
    finally { setBusy(false); }
  }
  return <><Header account /><main className="account-main">
    <section className="account-story" aria-labelledby="account-story-title">
      <span className="account-kicker"><Sparkles size={15} /> YOUR WORDS. YOUR WAY.</span>
      <h1 id="account-story-title">A little practice.<br />A lot to <span>take with you.</span></h1>
      <p>Every sentence is a step forward. Give your words and your progress a place to call home.</p>
      <div className="account-art"><Image src="/illustrations/fluen-shape-friends.png" alt="Three cheerful Fluen companions" width={1774} height={887} priority /><span>Look who’s cheering you on.</span></div>
      <ul className="account-benefits">
        <li><Bookmark size={18} /><span>Your own collection of useful words</span></li>
        <li><Check size={18} /><span>Writing progress that stays with you</span></li>
        <li><MonitorSmartphone size={18} /><span>Pick up on any device</span></li>
      </ul>
    </section>
    <section className="account-card" aria-labelledby="account-title">
      <div className="account-card-icon"><LockKeyhole size={23} /></div>
      {user ? <>
        <span className="account-card-kicker">YOU’RE RIGHT AT HOME</span>
        <h2 id="account-title">You’re signed in.</h2>
        <p className="account-intro">Your new words and writing progress will be saved to your account.</p>
        <Link className="button account-submit" href={destination}>Continue practicing <ArrowRight size={18} /></Link>
      </> : <>
        <span className="account-card-kicker">YOUR LITTLE LEARNING SPACE</span>
        <h2 id="account-title">{signup ? "Start your collection." : "Welcome back."}</h2>
        <p className="account-intro">{signup ? "Create an account to keep your words and writing progress, wherever you practice." : "Sign in to save your words and writing progress, and keep learning on any device."}</p>
        <div className="account-modes" aria-label="Account options">
          <button type="button" aria-pressed={!signup} disabled={busy} onClick={() => changeMode(false)}>Sign in</button>
          <button type="button" aria-pressed={signup} disabled={busy} onClick={() => changeMode(true)}>Create account</button>
        </div>
        <form className="account-form" onSubmit={submit} aria-busy={busy}>
          <label htmlFor="account-email">Email address</label>
          <input id="account-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required disabled={busy} value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="account-password">Password</label>
          <div className="account-password">
            <input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} aria-describedby={signup ? "password-hint" : undefined} placeholder={signup ? "Create a password" : "Enter your password"} required disabled={busy} value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
          </div>
          {signup && <p id="password-hint" className="account-password-hint">Use at least 8 characters.</p>}
          {error && <p className="account-message account-message-error" role="alert">{error}</p>}
          {notice && <p className="account-message account-message-success" role="status">{notice}</p>}
          <button type="submit" className="button account-submit" disabled={busy}>{busy ? <><LoaderCircle size={18} className="account-spinner" /> Please wait…</> : <>{signup ? "Create my account" : "Sign in & keep learning"}<ArrowRight size={18} /></>}</button>
        </form>
        <p className="account-switch">{signup ? "Already learning with us?" : "New to Fluen?"} <button type="button" disabled={busy} onClick={() => changeMode(!signup)}>{signup ? "Sign in" : "Create an account"}</button></p>
        <div className="account-guest"><Link href={destination}>Just exploring? Continue as a guest <ArrowRight size={14} /></Link><p>Guest progress and words stay in this browser.<br />Sign in to save new learning to your account.</p></div>
      </>}
    </section>
  </main><Footer /></>;
}
