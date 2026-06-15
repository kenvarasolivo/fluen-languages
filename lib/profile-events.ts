"use client";

/**
 * Lightweight in-tab broadcast so chrome that's mounted once (the
 * sidebar / mobile header) can react to profile edits made on the
 * /profile page without a full reload.
 */
export const PROFILE_UPDATED = "fluen:profile-updated";

export interface ProfileUpdate {
  username: string | null;
  avatarUrl: string | null;
}

export function broadcastProfileUpdate(update: ProfileUpdate) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProfileUpdate>(PROFILE_UPDATED, { detail: update }));
}

export function onProfileUpdate(handler: (update: ProfileUpdate) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<ProfileUpdate>).detail);
  window.addEventListener(PROFILE_UPDATED, listener);
  return () => window.removeEventListener(PROFILE_UPDATED, listener);
}
