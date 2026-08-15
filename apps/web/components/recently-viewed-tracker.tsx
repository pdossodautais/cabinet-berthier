"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/lib/use-recently-viewed";

export function RecentlyViewedTracker({ slug }: { slug: string }) {
  const { addView } = useRecentlyViewed();

  useEffect(() => {
    addView(slug);
  }, [slug, addView]);

  return null;
}
