import { useEffect, useState } from "react";
import { authClient, authEnabled } from "./client";

/** Normalized user shape used across the app, auth on or off. */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  /** True when this is the sandbox/dev fallback (auth not configured). */
  isDevFallback: boolean;
  /** Simple portal password session (production without Postgres). */
  isPortalSimple?: boolean;
};

/**
 * Stable fallback user, used ONLY when auth is explicitly disabled
 * (`VITE_AUTH_ENABLED=false`).
 */
export const DEV_USER: AppUser = {
  id: "dev-user",
  displayName: "Dev User",
  primaryEmail: "dev@example.com",
  profileImageUrl: null,
  isDevFallback: true,
};

export type CurrentUserState = {
  user: AppUser | null;
  isPending: boolean;
};

type PortalApiUser = { id: string; name: string; email: string };

/**
 * Current user + loading state.
 * Resolves Better Auth session first; falls back to simple portal cookie session.
 */
export function useCurrentUserState(): CurrentUserState {
  if (!authEnabled) return { user: DEV_USER, isPending: false };

  // eslint-disable-next-line react-hooks/rules-of-hooks -- authEnabled is constant
  const { data, isPending: baPending } = authClient.useSession();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [portalUser, setPortalUser] = useState<AppUser | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [portalPending, setPortalPending] = useState(true);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portal-session", {
          credentials: "include",
        });
        const json = (await res.json()) as { user: PortalApiUser | null };
        if (cancelled) return;
        if (json.user) {
          setPortalUser({
            id: json.user.id,
            displayName: json.user.name,
            primaryEmail: json.user.email,
            profileImageUrl: null,
            isDevFallback: false,
            isPortalSimple: true,
          });
        } else {
          setPortalUser(null);
        }
      } catch {
        if (!cancelled) setPortalUser(null);
      } finally {
        if (!cancelled) setPortalPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data?.user?.id]);

  const baUser = data?.user;
  if (baUser) {
    return {
      user: {
        id: baUser.id,
        displayName: baUser.name ?? null,
        primaryEmail: baUser.email ?? null,
        profileImageUrl: baUser.image ?? null,
        isDevFallback: false,
      },
      isPending: false,
    };
  }

  if (portalUser) {
    return { user: portalUser, isPending: false };
  }

  return {
    user: null,
    isPending: baPending || portalPending,
  };
}

export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}

/** Refresh simple portal session after login (call from login page). */
export async function fetchPortalSessionUser(): Promise<AppUser | null> {
  try {
    const res = await fetch("/api/portal-session", { credentials: "include" });
    const json = (await res.json()) as { user: PortalApiUser | null };
    if (!json.user) return null;
    return {
      id: json.user.id,
      displayName: json.user.name,
      primaryEmail: json.user.email,
      profileImageUrl: null,
      isDevFallback: false,
      isPortalSimple: true,
    };
  } catch {
    return null;
  }
}
