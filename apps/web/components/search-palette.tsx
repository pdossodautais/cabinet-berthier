"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Quote } from "lucide-react";
import { createClient } from "@repo/shared/supabase/client";
import { formatPriceShort } from "@repo/shared/utils";
import type {
  PropertyWithMedia,
  PostWithAuthor,
} from "@repo/shared/supabase/types";
import { Button } from "@repo/ui/button";

type Arrondissement = { code: string; label: string; count: number };

type Results = {
  biens: PropertyWithMedia[];
  quartiers: Arrondissement[];
  articles: PostWithAuthor[];
  empty: boolean;
  suggestions: boolean;
};

export function SearchPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [allBiens, setAllBiens] = useState<PropertyWithMedia[]>([]);
  const [allPosts, setAllPosts] = useState<PostWithAuthor[]>([]);
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll-lock body + focus input à l'ouverture
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Fetch dataset à la première ouverture
  useEffect(() => {
    if (!open || allBiens.length > 0) return;
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    Promise.all([
      supabase
        .from("properties")
        .select(
          "*, property_media(id, url, position, alt_text, property_id)",
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("posts")
        .select("*, agents(first_name, last_name, photo_url)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(20),
    ]).then(([propsRes, postsRes]) => {
      if (cancelled) return;
      const biens = (propsRes.data as PropertyWithMedia[] | null) ?? [];
      const posts = (postsRes.data as PostWithAuthor[] | null) ?? [];
      setAllBiens(biens);
      setAllPosts(posts);

      // Compute arrondissements depuis postal_code
      const counts = new Map<string, number>();
      biens.forEach((b) => {
        const code = parseParisArrond(b.postal_code);
        if (code) counts.set(code, (counts.get(code) || 0) + 1);
      });
      setArrondissements(
        Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([code, count]) => ({
            code,
            label: `Paris ${code}`,
            count,
          })),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, allBiens.length]);

  const results: Results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) {
      return {
        biens: allBiens.slice(0, 4),
        quartiers: arrondissements.slice(0, 4),
        articles: allPosts.slice(0, 2),
        empty: false,
        suggestions: true,
      };
    }
    const match = (s: string | null | undefined) =>
      (s || "").toLowerCase().includes(term);
    const biens = allBiens
      .filter(
        (p) =>
          match(p.title) ||
          match(p.description) ||
          match(p.city) ||
          match(p.address) ||
          match(p.type) ||
          match(p.transaction_type),
      )
      .slice(0, 6);
    const quartiers = arrondissements
      .filter(
        (d) =>
          match(d.code) ||
          match(d.label) ||
          match(d.code.replace(/[^\d]/g, "")),
      )
      .slice(0, 6);
    const articles = allPosts
      .filter((p) => match(p.title) || match(p.excerpt) || match(p.content))
      .slice(0, 3);
    return {
      biens,
      quartiers,
      articles,
      empty: biens.length + quartiers.length + articles.length === 0,
      suggestions: false,
    };
  }, [q, allBiens, arrondissements, allPosts]);

  // Flat list of navigable items across all sections
  const flatItems = useMemo(() => {
    const items: { href: string; section: "bien" | "quartier" | "article" }[] = [];
    for (const b of results.biens) items.push({ href: `/biens/${b.slug}`, section: "bien" });
    for (const a of results.quartiers) items.push({ href: `/biens?arr=${encodeURIComponent(a.code)}`, section: "quartier" });
    for (const p of results.articles) items.push({ href: `/blog/${p.slug}`, section: "article" });
    return items;
  }, [results]);

  // Reset highlight quand la liste change
  useEffect(() => {
    setHighlight(flatItems.length > 0 ? 0 : -1);
  }, [flatItems.length, q]);

  // Nav clavier : ↑ ↓ Enter Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (flatItems.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % flatItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === "Enter") {
        const target = flatItems[highlight];
        if (target) {
          e.preventDefault();
          router.push(target.href);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, flatItems, highlight, router]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlight < 0 || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLElement>(
      `[data-search-idx="${highlight}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlight]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      className="fixed inset-0 z-[60]"
      style={{ background: "rgba(11, 16, 32, 0.55)" }}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative max-w-[760px] mx-auto mt-16 mx-6"
        style={{
          background: "var(--paper-raw)",
          border: "1px solid var(--ink-raw)",
          boxShadow: "0 24px 80px rgba(11,16,32,0.35)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 py-1"
          style={{ borderBottom: "1px solid var(--bone-raw)" }}
        >
          <Search
            className="h-4 w-4 shrink-0"
            strokeWidth={1.5}
            style={{ color: "var(--ink-raw)" }}
          />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher un bien, un quartier, un article…"
            className="flex-1 bg-transparent py-5 text-[17px] h-auto px-0"
            style={{
              color: "var(--ink-raw)",
              border: "none",
              outline: "none",
              boxShadow: "none",
            }}
            aria-label="Rechercher"
          />
          <Button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            variant="ghost"
            className="shrink-0 h-8 w-8 inline-flex items-center justify-center transition-colors hover:bg-[var(--ivory-raw)] rounded-none border-0"
            style={{
              color:
                "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
            }}
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Results */}
        <div
          ref={scrollRef}
          className="max-h-[60vh] overflow-y-auto"
        >
          {loading && allBiens.length === 0 && (
            <div
              className="px-6 py-10 h-eyebrow text-center"
              style={{
                color:
                  "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
              }}
            >
              Chargement du catalogue…
            </div>
          )}

          {results.suggestions && !loading && (
            <div
              className="px-6 pt-4 h-eyebrow"
              style={{
                color:
                  "color-mix(in oklch, var(--ink-raw) 45%, transparent)",
              }}
            >
              Suggestions
            </div>
          )}

          {results.empty && (
            <div className="px-6 py-10 text-center">
              <div
                className="h-display"
                style={{ fontSize: 28, color: "var(--cobalt)" }}
              >
                Aucun résultat{" "}
                <em className="h-italic">pour « {q} ».</em>
              </div>
              <div
                className="mt-3 text-[13px]"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                Essayez « Trocadéro », « bureaux », « location », ou parcourez le
                catalogue.
              </div>
              <Link
                href="/biens"
                onClick={onClose}
                className="mt-5 inline-flex link-under"
                style={{ color: "var(--cobalt)" }}
              >
                Voir le catalogue
              </Link>
            </div>
          )}

          {results.biens.length > 0 && (
            <div className="px-6 py-4">
              <div
                className="h-eyebrow mb-3"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 45%, transparent)",
                }}
              >
                Biens
              </div>
              <ul className="divide-y" style={{ borderColor: "var(--bone-raw)" }}>
                {results.biens.map((p, i) => {
                  const cover = p.property_media?.[0]?.url;
                  const arr = parseParisArrond(p.postal_code);
                  const isRent = p.transaction_type === "location";
                  const idx = i;
                  const active = highlight === idx;
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/biens/${p.slug}`}
                        onClick={onClose}
                        onMouseEnter={() => setHighlight(idx)}
                        data-search-idx={idx}
                        className="w-full flex items-center gap-4 py-3 text-left -mx-2 px-2 transition-colors"
                        style={{
                          background: active ? "var(--ivory-raw)" : "transparent",
                        }}
                      >
                        <div
                          className="h-12 w-12 flex-shrink-0 bg-[color:var(--ivory-raw)] overflow-hidden"
                          style={{ border: "1px solid var(--bone-raw)" }}
                        >
                          {cover && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] truncate font-medium">
                            {normalizeTitle(p.title)}
                          </div>
                          <div
                            className="mono text-[10px] tracking-[0.16em] uppercase mt-0.5"
                            style={{
                              color:
                                "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                            }}
                          >
                            Nº {p.id.slice(0, 6).toUpperCase()}
                            {arr && ` · ${arr}`} · {p.type}
                          </div>
                        </div>
                        <div
                          className="mono text-[11px] tabular whitespace-nowrap"
                          style={{ color: "var(--cobalt)" }}
                        >
                          {formatPriceShort(p.price)}
                          {isRent && "/m"}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {results.quartiers.length > 0 && (
            <div
              className="px-6 py-4"
              style={{ borderTop: "1px solid var(--bone-raw)" }}
            >
              <div
                className="h-eyebrow mb-3"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 45%, transparent)",
                }}
              >
                Arrondissements
              </div>
              <div className="flex flex-wrap gap-2">
                {results.quartiers.map((d, i) => {
                  const idx = results.biens.length + i;
                  const active = highlight === idx;
                  return (
                    <Link
                      key={d.code}
                      href={`/biens?arr=${encodeURIComponent(d.code)}`}
                      onClick={onClose}
                      onMouseEnter={() => setHighlight(idx)}
                      data-search-idx={idx}
                      className="px-3 py-2 border text-[12px] inline-flex items-center gap-2 transition-colors"
                      style={{
                        borderColor: active ? "var(--cobalt)" : "var(--bone-raw)",
                        background: active ? "var(--ivory-raw)" : "transparent",
                      }}
                    >
                      {d.label}
                      <span
                        className="mono text-[10px] tabular"
                        style={{
                          color:
                            "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                        }}
                      >
                        {d.count} bien{d.count > 1 ? "s" : ""}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {results.articles.length > 0 && (
            <div
              className="px-6 py-4"
              style={{ borderTop: "1px solid var(--bone-raw)" }}
            >
              <div
                className="h-eyebrow mb-3"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 45%, transparent)",
                }}
              >
                Journal
              </div>
              <ul className="divide-y" style={{ borderColor: "var(--bone-raw)" }}>
                {results.articles.map((p, i) => {
                  const idx =
                    results.biens.length + results.quartiers.length + i;
                  const active = highlight === idx;
                  return (
                  <li key={p.id}>
                    <Link
                      href={`/blog/${p.slug}`}
                      onClick={onClose}
                      onMouseEnter={() => setHighlight(idx)}
                      data-search-idx={idx}
                      className="w-full flex items-center gap-3 py-3 text-left -mx-2 px-2 transition-colors"
                      style={{
                        background: active ? "var(--ivory-raw)" : "transparent",
                      }}
                    >
                      <Quote
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={1.5}
                        style={{ color: "var(--cobalt)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium truncate">
                          {p.title}
                        </div>
                        {p.excerpt && (
                          <div
                            className="h-eyebrow mt-0.5 truncate"
                            style={{
                              color:
                                "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                            }}
                          >
                            {p.excerpt}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-between items-center px-6 py-3 mono text-[10px] tracking-[0.18em] uppercase"
          style={{
            borderTop: "1px solid var(--bone-raw)",
            color:
              "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          <div>Cabinet Berthier · Recherche</div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd
                className="px-1.5 py-0.5 border mono"
                style={{ borderColor: "var(--bone-raw)" }}
              >
                ↑
              </kbd>
              <kbd
                className="px-1.5 py-0.5 border mono"
                style={{ borderColor: "var(--bone-raw)" }}
              >
                ↓
              </kbd>
              <span>naviguer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd
                className="px-1.5 py-0.5 border mono"
                style={{ borderColor: "var(--bone-raw)" }}
              >
                ↵
              </kbd>
              <span>ouvrir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd
                className="px-1.5 py-0.5 border mono"
                style={{ borderColor: "var(--bone-raw)" }}
              >
                Esc
              </kbd>
              <span>fermer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseParisArrond(
  postal: string | null | undefined,
): string | null {
  if (!postal) return null;
  const m = /^750?(\d{1,2})$/.exec(postal.trim());
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 20) return null;
  return n === 1 ? "1ᵉʳ" : `${n}ᵉ`;
}

function normalizeTitle(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
    return trimmed
      .toLowerCase()
      .replace(/(^|[\s·,/()-])([a-zàâäéèêëîïôöùûüç])/g, (_, p, c) => p + c.toUpperCase());
  }
  if (trimmed === trimmed.toLowerCase()) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
  return trimmed;
}
