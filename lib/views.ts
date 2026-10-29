/** NatureMe is one app with two views: Listener (everything else) and Creator (the Studio). */
export const STUDIO_PATH = "/studio";

export function isStudioPath(path: string | null): boolean {
  return !!path && (path === STUDIO_PATH || path.startsWith(`${STUDIO_PATH}/`));
}

/** The public coming-soon page lives outside both views: no onboarding, no dock. */
export const LANDING_PATH = "/coming-soon";

/** On the public domain the landing page is served at "/", so the browser path alone can't tell it apart from the Listener home. */
export function isLandingHost(host: string): boolean {
  return /^(www\.)?natureme\.ai$/.test(host);
}
