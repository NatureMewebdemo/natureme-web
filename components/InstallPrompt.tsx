"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { installRoute, shouldOfferInstall, type InstallState } from "@/lib/install";
import { isStudioPath } from "@/lib/views";
import { Close } from "./icons";
import { localStore } from "./localStore";
import { WELCOME_PATH } from "./OnboardingGate";
import { useHabit } from "./useHabit";

/** Chrome, Edge and Android's install event; not in TypeScript's DOM types. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const store = localStore<InstallState>("natureme.install.v1", { visits: 0 });
const SESSION_KEY = "natureme.visit-counted";
let deferred: BeforeInstallPromptEvent | null = null;

/**
 * NatureMe runs in the browser with nothing to download. After a first listen,
 * or on a return visit, this offers to add it to the home screen.
 */
export function InstallPrompt() {
  const path = usePathname();
  const install = store.use();
  const habit = useHabit();
  const [ready, setReady] = useState<{ standalone: boolean; route: ReturnType<typeof installRoute> } | null>(null);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, "1");
        store.set({ ...store.get(), visits: store.get().visits + 1 });
      }
    } catch {}
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    const refresh = () => setReady({ standalone, route: installRoute(navigator.userAgent, !!deferred) });
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred = e as BeforeInstallPromptEvent;
      refresh();
    };
    const onInstalled = () => store.set({ ...store.get(), installed: true });
    addEventListener("beforeinstallprompt", onPrompt);
    addEventListener("appinstalled", onInstalled);
    refresh();
    return () => {
      removeEventListener("beforeinstallprompt", onPrompt);
      removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!ready || path === WELCOME_PATH || isStudioPath(path)) return null;
  const hasListened = Object.keys(habit.days).length > 0;
  if (!shouldOfferInstall(install, { standalone: ready.standalone, hasListened, now: new Date() })) return null;

  const dismiss = () => store.set({ ...store.get(), dismissedAt: new Date().toISOString() });
  const add = async () => {
    if (ready.route !== "prompt" || !deferred) return setHelp(true);
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === "accepted") store.set({ ...store.get(), installed: true });
    else dismiss();
  };

  return (
    <aside className="install" aria-label="Add NatureMe to your home screen">
      <Image src="/apple-icon.png" alt="" width={40} height={40} className="install-icon" />
      <div className="install-txt">
        <b>Keep NatureMe one tap away</b>
        {help ? (
          <p>{ready.route === "ios" ? "Tap the Share button, then “Add to Home Screen”." : "Open your browser menu and choose “Install app” or “Add to Home screen”."}</p>
        ) : (
          <p>No app store needed. It keeps working right here in your browser too.</p>
        )}
      </div>
      {!help && <button className="btn solid" onClick={add}>Add</button>}
      <button className="install-x" onClick={dismiss} aria-label="Not now"><Close size={18} /></button>
    </aside>
  );
}
