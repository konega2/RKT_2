"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { PANEL_AUTH_KEY } from "@/lib/rkt-panel";

export function isPanelAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(PANEL_AUTH_KEY) === "true";
}

export function setPanelAuthenticated(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.sessionStorage.setItem(PANEL_AUTH_KEY, "true");
    return;
  }

  window.sessionStorage.removeItem(PANEL_AUTH_KEY);
}

export function usePanelGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const authed = isPanelAuthenticated();
    setAuthenticated(authed);
    setReady(true);

    if (!authed) {
      router.replace(`/rkt-panel/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  return useMemo(
    () => ({
      ready,
      authenticated,
      logout: () => {
        setPanelAuthenticated(false);
        router.push("/rkt-panel/login");
      },
    }),
    [authenticated, ready, router],
  );
}
