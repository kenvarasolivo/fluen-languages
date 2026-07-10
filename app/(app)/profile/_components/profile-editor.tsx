"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  Check,
  Loader2,
  UserRound,
} from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { validateUsername } from "@/lib/username";
import { broadcastProfileUpdate } from "@/lib/profile-events";

type Phase = "loading" | "guest" | "ready" | "error";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3 MB

export function ProfileEditor() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [username, setUsername] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // A picked-but-not-yet-saved photo lives only in the browser until
  // Save: `pendingFile` is uploaded then, `previewUrl` shows it now.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await ensureSession();
        // A public profile belongs to a real account — guests get the
        // upgrade prompt, mirroring the Cards catalog.
        if (session.user.is_anonymous) {
          setPhase("guest");
          return;
        }
        setUserId(session.user.id);
        setEmail(session.user.email ?? "");

        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", session.user.id)
          .single();
        if (error) throw error;

        setUsername(data.username ?? "");
        setInitialUsername(data.username ?? "");
        setAvatarUrl(data.avatar_url ?? null);
        setPhase("ready");
      } catch (err) {
        console.error("[profile]", err);
        setPhase("error");
      }
    })();
  }, []);

  // Revoke the in-memory preview URL when it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;

    setError(null);
    setNotice(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Image is too large (max 3 MB).");
      return;
    }

    // Stage it locally only — nothing hits Storage until Save.
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /** Storage object path ("<uid>/avatar-….ext") from a public URL. */
  const pathFromUrl = (url: string | null) => {
    if (!url) return null;
    const i = url.indexOf("/avatars/");
    return i === -1 ? null : url.slice(i + "/avatars/".length).split("?")[0];
  };

  const handle = username.trim();
  const usernameChanged = handle.toLowerCase() !== initialUsername.toLowerCase();
  const dirty = usernameChanged || pendingFile !== null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !dirty) return;
    setError(null);
    setNotice(null);

    // A username is required whenever it changed (incl. being cleared).
    if (usernameChanged) {
      const validationError = validateUsername(handle);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    try {
      if (usernameChanged) {
        const { data: available, error: checkError } = await supabase.rpc(
          "check_username_available",
          { candidate: handle },
        );
        if (checkError) throw checkError;
        if (!available) {
          setError("That username is already taken.");
          setSaving(false);
          return;
        }
      }

      const updates: { username?: string; avatar_url?: string } = {};
      if (usernameChanged) updates.username = handle;

      // Upload the staged photo first so we never point the profile at a
      // file that failed to land.
      let newAvatarUrl = avatarUrl;
      if (pendingFile) {
        const ext = pendingFile.name.split(".").pop()?.toLowerCase() || "jpg";
        // Folder = user id (Storage policy checks the first path segment).
        // A timestamped name busts the CDN cache on the public URL.
        const path = `${userId}/avatar-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, pendingFile, {
            upsert: true,
            contentType: pendingFile.type,
          });
        if (uploadError) throw uploadError;

        newAvatarUrl = supabase.storage.from("avatars").getPublicUrl(path)
          .data.publicUrl;
        updates.avatar_url = newAvatarUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
      if (error) {
        // Unique-violation safety net if someone grabbed it in between.
        if (error.code === "23505") {
          setError("That username is already taken.");
          return;
        }
        throw error;
      }

      // Old photo is now orphaned — delete it to save space. Best-effort:
      // a failed cleanup shouldn't fail the save.
      if (pendingFile) {
        const oldPath = pathFromUrl(avatarUrl);
        const newPath = pathFromUrl(newAvatarUrl);
        if (oldPath && oldPath !== newPath) {
          const { error: rmError } = await supabase.storage
            .from("avatars")
            .remove([oldPath]);
          if (rmError) console.error("[profile avatar cleanup]", rmError);
        }
      }

      setInitialUsername(handle);
      setAvatarUrl(newAvatarUrl);
      setPendingFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      broadcastProfileUpdate({ username: handle || null, avatarUrl: newAvatarUrl });
      setNotice("Profile saved.");
    } catch (err) {
      console.error("[profile save]", err);
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const shownAvatar = previewUrl ?? avatarUrl;
  const initial = (handle[0] ?? email[0] ?? "?").toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <header className="app-header flex h-16 shrink-0 items-center border-b px-4 sm:px-6">
        <h1 className="eyebrow text-sm text-white">Profile</h1>
      </header>

      {phase === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading profile ...</p>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface-raised shadow-xs">
            <AlertCircle size={18} strokeWidth={1.75} className="text-negative" />
          </span>
          <p className="text-sm text-muted">Your profile could not be loaded.</p>
        </div>
      )}

      {phase === "guest" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-surface-raised px-8 py-10 text-center shadow-raised">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft">
              <UserRound size={20} strokeWidth={1.75} className="text-accent" />
            </span>
            <p className="text-sm font-medium">Your profile belongs to your account.</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              Create a free account to pick a username and add a photo. The
              cards you already have will be kept.
            </p>
            <Link
              href="/login"
              className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
            >
              Create account
            </Link>
          </div>
        </div>
      )}

      {phase === "ready" && (
        <div className="flex-1 overflow-y-auto bg-mesh">
          <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-10">
            <div className="fade-up flex flex-col items-center gap-8 rounded-2xl border-[1.5px] border-border-strong bg-surface-raised px-6 py-10 shadow-pop sm:px-10">
              {/* Avatar with overlaid camera button */}
              <div className="relative">
                <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-border-strong bg-surface">
                  {shownAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shownAvatar}
                      alt="Your avatar"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold tracking-tight text-muted">
                      {initial}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={saving}
                  aria-label="Change photo"
                  className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-[1.5px] border-border-strong bg-accent text-white shadow-pop transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <Camera size={15} strokeWidth={2} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickPhoto}
                  className="hidden"
                />
              </div>

              <div className="-mt-3 flex flex-col items-center gap-1">
                <p className="text-xs text-muted">{email}</p>
                {pendingFile && (
                  <p className="text-[11px] font-medium text-accent">
                    New photo selected — click Save to apply.
                  </p>
                )}
              </div>

              {/* Username */}
              <form onSubmit={save} className="flex w-full flex-col gap-2">
                <label
                  htmlFor="username"
                  className="eyebrow text-[11px] text-muted"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_handle"
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                  className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base shadow-xs outline-none transition-all duration-150 placeholder:text-muted focus:border-accent/50 focus:ring-[3px] focus:ring-accent/15 sm:text-sm"
                />
                <p className="text-[11px] leading-relaxed text-muted">
                  3–20 characters: letters, numbers, dots or underscores.
                </p>

                {error && <p className="text-xs text-negative">{error}</p>}
                {notice && (
                  <p className="flex items-center gap-1.5 text-xs text-positive">
                    <Check size={13} strokeWidth={2.5} />
                    {notice}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="btn-primary mt-2 rounded-md py-2.5 text-sm disabled:opacity-40"
                >
                  {saving ? "Saving ..." : "Save changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
