"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "immo-favorites";

function readFavorites(): string[] {
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

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
    function onChange() {
      setFavorites(readFavorites());
    }
    listeners.add(onChange);
    return () => { listeners.delete(onChange); };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavorites(next);
    notify();
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
