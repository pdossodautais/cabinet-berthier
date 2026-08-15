"use client";

import { useEffect } from "react";

export function HideAnnouncement() {
  useEffect(() => {
    document.body.classList.add("no-announcement");
    return () => {
      document.body.classList.remove("no-announcement");
    };
  }, []);
  return null;
}
