"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegistration() {
  useEffect(() => {
    // Development must not cache HMR assets or control production previews.
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error: unknown) => console.warn("Fluen offline support could not start:", error));
  }, []);
  return null;
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const checkInstalled = () => setInstalled(display.matches || Boolean(
      (navigator as Navigator & { standalone?: boolean }).standalone,
    ));
    checkInstalled();
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", onInstalled);
    display.addEventListener("change", checkInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", onInstalled);
      display.removeEventListener("change", checkInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) { setInstructions((value) => !value); return; }
    setInstalling(true);
    setError("");
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } catch {
      setError("Use your browser’s menu to install Fluen.");
    } finally {
      setPrompt(null);
      setInstalling(false);
    }
  }

  if (installed || (!prompt && !ios && !error)) return null;
  return (
    <div className="pwa-install">
      {(prompt || ios) && <button type="button" className="pwa-install-button" onClick={install}
        disabled={installing} aria-expanded={ios && !prompt ? instructions : undefined}
        aria-controls={ios && !prompt ? "pwa-install-help" : undefined}>
        <Download size={16} aria-hidden="true" /> {installing ? "Installing…" : "Install Fluen"}
      </button>}
      {instructions && <p id="pwa-install-help">Open Fluen in Safari, tap Share, then Add to Home Screen.</p>}
      {error && <p role="status">{error}</p>}
    </div>
  );
}
