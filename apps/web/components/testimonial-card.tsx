import { Star, ExternalLink, ArrowUpRight } from "lucide-react";
import type { Testimonial } from "@repo/shared/supabase/types";

type TestimonialCardProps = {
  testimonial: Testimonial;
  variant?: "full" | "compact";
};

export function TestimonialCard({
  testimonial: t,
  variant = "full",
}: TestimonialCardProps) {
  const isClickable = !!t.url;

  const inner = (
    <figure
      className={`testimonial-card bg-paper border border-hairline p-7 flex flex-col h-full relative transition-colors ${
        isClickable ? "group-hover:border-hairline-strong" : ""
      }`}
    >
      <span aria-hidden="true" className="testimonial-accent-left" />
      {isClickable && (
        <ArrowUpRight
          aria-hidden="true"
          className="absolute top-5 right-5 h-4 w-4 text-ink-subtle opacity-0 group-hover:opacity-100 group-hover:text-brass-deep transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.4}
        />
      )}

      <div
        aria-hidden="true"
        className="text-[48px] leading-[0.8] text-brass mb-3 select-none"
      >
        &ldquo;
      </div>
      <blockquote
        className={`font-normal text-ink-2 flex-1 ${
          variant === "compact"
            ? "text-[14px] leading-[1.5] line-clamp-5"
            : "text-[16px] leading-[1.55]"
        }`}
      >
        {t.content}
      </blockquote>
      <figcaption className="mt-5 pt-4 border-t border-hairline flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="testimonial-name text-[13px] font-medium text-ink truncate">
            {t.name}
          </div>
          {t.role && (
            <div className="text-[11px] text-ink-muted mt-0.5 truncate">
              {t.role}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div
            role="img"
            aria-label={`Note : ${t.rating} sur 5`}
            className="flex gap-0.5 text-brass"
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <Star
                key={v}
                aria-hidden="true"
                className={`h-3 w-3 ${
                  v <= t.rating ? "fill-current" : "opacity-25"
                }`}
                strokeWidth={1.3}
              />
            ))}
          </div>
          {isClickable && (
            <span className="text-[10px] text-ink-muted inline-flex items-center gap-1 uppercase tracking-[0.08em]">
              Voir l&apos;avis
              <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.3} />
            </span>
          )}
        </div>
      </figcaption>
    </figure>
  );

  if (isClickable) {
    return (
      <a
        href={t.url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Lire l'avis de ${t.name} (nouvelle fenêtre)`}
        className="block group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {inner}
      </a>
    );
  }

  return inner;
}
