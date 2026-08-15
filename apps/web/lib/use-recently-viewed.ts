"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 10;

function readSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function useRecentlyViewed() {
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    setRecentSlugs(readSlugs());

    function onChange() {
      setRecentSlugs(readSlugs());
    }

    listeners.add(onChange);

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) onChange();
    }

    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const addView = useCallback((slug: string) => {
    const current = readSlugs();
    const next = [slug, ...current.filter((s) => s !== slug)].slice(
      0,
      MAX_ITEMS,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setRecentSlugs(next);
    notify();
  }, []);

  return { recentSlugs, addView };
}
