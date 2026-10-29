/** NatureMe is one app with two views: Listener (everything else) and Creator (the Studio). */
export const STUDIO_PATH = "/studio";

export function isStudioPath(path: string | null): boolean {
  return !!path && (path === STUDIO_PATH || path.startsWith(`${STUDIO_PATH}/`));
}

/** The public coming-soon page lives outside both views: no onboarding, no dock. */
export const LANDING_PATH = "/coming-soon";
