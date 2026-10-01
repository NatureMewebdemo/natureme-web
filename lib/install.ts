// Web first: NatureMe works in the browser with nothing to download. Once a
// listener has got something out of it, it offers to put NatureMe on their
// home screen (an installable web app), and never pushes again for a while
// after "Not now".

export interface InstallState {
  /** Separate browser sessions the listener has opened NatureMe in. */
  visits: number;
  /** When the listener last said "Not now". */
  dismissedAt?: string;
  installed?: boolean;
}

export const SNOOZE_DAYS = 14;

export function shouldOfferInstall(s: InstallState, o: { standalone: boolean; hasListened: boolean; now: Date }): boolean {
  if (o.standalone || s.installed) return false;
  if (s.dismissedAt && o.now.getTime() - new Date(s.dismissedAt).getTime() < SNOOZE_DAYS * 86_400_000) return false;
  // Value first: after a first listen, or on a return visit.
  return o.hasListened || s.visits >= 2;
}

/**
 * How this browser installs a web app: Chrome, Edge and Android show their own
 * prompt; iPhone and iPad Safari need Share, then Add to Home Screen.
 */
export function installRoute(userAgent: string, hasPrompt: boolean): "prompt" | "ios" | "menu" {
  if (hasPrompt) return "prompt";
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && /Mobile/.test(userAgent))) return "ios";
  return "menu";
}
