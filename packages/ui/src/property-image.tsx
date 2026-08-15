"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import Image from "next/image";

/**
 * Placeholder flou générique — rectangle gris chaud qui se fond
 * naturellement avec les photos immobilières.
 */
const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='8' height='6' fill='%23e8e4df' filter='url(%23b)'/%3E%3C/svg%3E";

export function PropertyImage({
  src,
  alt,
  className = "",
  fill = false,
  width,
  height,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <Home className="h-10 w-10 opacity-40" />
      </div>
    );
  }

  const isExternal = src.startsWith("http");

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={className}
        onError={() => setError(true)}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        preload={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      sizes={sizes}
      className={className}
      onError={() => setError(true)}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      preload={priority}
    />
  );
}
