"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { loadPreferences } from "@/lib/preferences";
import { isLandingHost, isStudioPath, LANDING_PATH } from "@/lib/views";

export const WELCOME_PATH = "/welcome";

/** Sends first-time listeners to onboarding before anything else. Creators in the Studio and visitors to the coming-soon page skip it. */
export function OnboardingGate() {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (isLandingHost(window.location.hostname)) return;
    if (path !== WELCOME_PATH && path !== LANDING_PATH && !isStudioPath(path) && !loadPreferences()) router.replace(WELCOME_PATH);
  }, [path, router]);
  return null;
}
