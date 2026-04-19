import { useSyncExternalStore } from "react";

const AUTH_EVENT = "kitsu-auth-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_EVENT, onStoreChange);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem("auth_token");
}

function getServerSnapshot(): string | null {
  return null;
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/** Reactive JWT presence for TanStack Query `enabled` flags. */
export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
