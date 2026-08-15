"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Heart, ArrowRight, Menu, X } from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";
import { useFavorites } from "@/lib/use-favorites";
import { SearchPalette } from "./search-palette";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";

type Props = {
  settings: Record<string, string>;
};

const NAV_ITEMS = [
  { href: "/", label: "Accueil", match: (p: string) => p === "/" },
  {
    href: "/biens",
    label: "Biens",
    match: (p: string) => p === "/biens" || p.startsWith("/biens/"),
  },
  {
    href: "/a-propos",
    label: "Le Cabinet",
    match: (p: string) => p === "/a-propos",
  },
  {
    href: "/temoignages",
    label: "Témoignages",
    match: (p: string) => p === "/temoignages",
  },
  {
    href: "/blog",
    label: "Journal",
    match: (p: string) => p === "/blog" || p.startsWith("/blog/"),
  },
  {
    href: "/contact",
    label: "Contact",
    match: (p: string) => p === "/contact",
  },
];

export function SiteHeader({ settings }: Props) {
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const favCount = favorites.length;
  const phone = settings.agency_phone || clientConfig.contact.phone;
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Ferme le menu mobile à chaque changement de page
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Cache la bande d'annonce sur /biens (catalogue / carte) — elle prend
  // 36px de hauteur utile que la sidebar a besoin de récupérer pour que
  // les boutons Appliquer/Réinitialiser tiennent dans la viewport sans
  // scroll. On le fait au render (pas dans un useEffect) pour éviter le
  // flash où l'annonce apparaît puis disparaît au mount.
  const hideAnnouncement =
    pathname === "/biens" || pathname?.startsWith("/biens/");

  // Cmd+K / Ctrl+K → ouvre la recherche
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ferme la palette quand on change de page
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Announcement bar — ink. Cachée sur /biens et /biens/[slug] via le
          flag dérivé du pathname (rendu conditionnel : pas de flash, pas de
          décalage du contenu au mount). */}
      {!hideAnnouncement && (
      <div
        data-announcement-bar
        className="w-full bg-[color:var(--ink-raw)] text-[color:var(--paper-raw)]"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-9 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase">
          <div className="flex items-center gap-3 opacity-80">
            <span className="hidden md:inline">
              {clientConfig.agencyFullName}
            </span>
            <span className="md:hidden">{clientConfig.agencyName}</span>
            <span className="opacity-40">·</span>
            <span>Depuis {clientConfig.foundedYear}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 opacity-80">
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="hover:opacity-100 transition-opacity"
            >
              {phone}
            </a>
          </div>
        </div>
      </div>
      )}

      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 backdrop-blur"
        style={{
          background: "rgba(250, 246, 236, 0.92)",
          borderBottom: "1px solid var(--bone-raw)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-[76px] flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group shrink-0 text-left inline-flex flex-col items-start leading-none text-[color:var(--ink-raw)] transition-colors"
          >
            <div
              className="h-caps tabular icon-scale"
              style={{ fontSize: 16, letterSpacing: "0.28em" }}
            >
              {clientConfig.agencyName}
            </div>
            <div
              style={{
                marginTop: 5,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                transition: "color 280ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {clientConfig.logoSubtitle}
            </div>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-6 xl:gap-7"
          >
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "relative h-small-caps py-1 transition-colors " +
                    (active ? "" : "nav-underline")
                  }
                  style={{
                    color: active ? "var(--cobalt)" : "var(--ink-raw)",
                  }}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute -bottom-0.5 left-0 right-0 h-px"
                      style={{ background: "var(--cobalt)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group hidden md:inline-flex items-center gap-2 h-11 px-3 transition-colors hover:bg-[color:var(--ivory-raw)] hover:border-[color:var(--ink-raw)]"
              style={{ border: "1px solid var(--bone-raw)" }}
              title="Rechercher (⌘K)"
              aria-label="Rechercher"
            >
              <Search className="h-3.5 w-3.5 icon-scale" strokeWidth={1.5} />
              <span
                className="h-eyebrow hidden xl:inline"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                Rechercher
              </span>
              <kbd
                aria-hidden="true"
                className="hidden xl:inline mono px-1 py-0.5"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  border: "1px solid var(--bone-raw)",
                  color:
                    "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                ⌘K
              </kbd>
            </button>
            <Link
              href="/favoris"
              aria-label="Mes favoris"
              className="group hidden md:inline-flex relative h-11 w-11 items-center justify-center transition-colors hover:bg-[color:var(--ivory-raw)] hover:border-[color:var(--ink-raw)]"
              style={{ border: "1px solid var(--bone-raw)" }}
              title="Favoris"
            >
              <Heart className="h-4 w-4 icon-scale" strokeWidth={1.5} />
              {favCount > 0 && (
                <span
                  key={`fav-count-${favCount}`}
                  className="animate-fade-up absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center mono text-[10px] tabular text-white"
                  style={{ background: "var(--cobalt)" }}
                >
                  {favCount}
                </span>
              )}
            </Link>
            {/* CTA Estimer — desktop uniquement (présent dans le menu mobile).
                Wrapper `hidden lg:flex` pour neutraliser le `display:inline-flex`
                du composant `.btn-cobalt`. */}
            <div className="hidden lg:flex">
              <Link
                href="/estimation"
                className="group btn-cobalt btn-shimmer"
                style={{ padding: "11px 18px", fontSize: 11 }}
              >
                <span className="relative z-[1]">Estimer mon bien</span>
                <ArrowRight className="h-3.5 w-3.5 group-arrow relative z-[1]" strokeWidth={1.5} />
              </Link>
            </div>

            {/* Hamburger mobile/tablet */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-expanded={mobileNavOpen}
              aria-label="Ouvrir la navigation"
              className="group lg:hidden relative inline-flex items-center justify-center h-11 w-11 transition-colors hover:bg-[color:var(--ivory-raw)] hover:border-[color:var(--ink-raw)]"
              style={{ border: "1px solid var(--bone-raw)" }}
            >
              <Menu className="h-5 w-5 icon-scale" strokeWidth={1.5} />
              {favCount > 0 && (
                <span
                  key={`fav-count-mobile-${favCount}`}
                  className="animate-fade-up absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center mono text-[10px] tabular text-white"
                  style={{ background: "var(--cobalt)" }}
                >
                  {favCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer navigation mobile */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="!w-full sm:!max-w-md bg-paper p-0 !gap-0 flex flex-col overflow-hidden"
        >
          <SheetHeader
            className="px-6 py-6 shrink-0"
            style={{ borderBottom: "1px solid var(--bone-raw)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div
                  className="chapter-mark mb-3 animate-eyebrow-in"
                  style={{ color: "var(--cobalt)" }}
                >
                  ¶ Menu
                </div>
                <SheetTitle
                  className="h-display text-left"
                  style={{ fontSize: 28, lineHeight: 1.1 }}
                >
                  {clientConfig.agencyName}
                  <br />
                  <em
                    className="h-italic"
                    style={{ color: "var(--cobalt)" }}
                  >
                    {clientConfig.logoSubtitle}
                  </em>
                </SheetTitle>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Fermer"
                className="group w-11 h-11 inline-flex items-center justify-center shrink-0 transition-colors hover:bg-[color:var(--ivory-raw)] hover:border-[color:var(--ink-raw)]"
                style={{ border: "1px solid var(--bone-raw)" }}
              >
                <X className="h-4 w-4 icon-scale" strokeWidth={1.4} />
              </button>
            </div>
          </SheetHeader>

          <nav
            aria-label="Navigation mobile"
            className="flex-1 overflow-y-auto scrollbar-editorial px-6 py-4"
          >
            <ul>
              {NAV_ITEMS.map((item) => {
                const active = item.match(pathname);
                return (
                  <li
                    key={item.href}
                    style={{ borderBottom: "1px solid var(--bone-raw)" }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between py-4 transition-colors"
                      style={{
                        color: active ? "var(--cobalt)" : "var(--ink-raw)",
                      }}
                    >
                      <span
                        className="h-display"
                        style={{ fontSize: 22, lineHeight: 1 }}
                      >
                        {item.label}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 group-arrow"
                        strokeWidth={1.5}
                        style={{
                          color: active
                            ? "var(--cobalt)"
                            : "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                        }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 pt-6 rule">
              <Link
                href="/favoris"
                className="flex items-center justify-between py-3"
                style={{ color: "var(--ink-raw)" }}
              >
                <span className="flex items-center gap-3">
                  <Heart className="h-4 w-4" strokeWidth={1.5} />
                  <span className="h-small-caps">Mes favoris</span>
                </span>
                {favCount > 0 && (
                  <span
                    className="mono text-[11px] tabular px-2 py-1"
                    style={{ background: "var(--cobalt)", color: "white" }}
                  >
                    {favCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-3 py-3 w-full text-left"
                style={{ color: "var(--ink-raw)" }}
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
                <span className="h-small-caps">Rechercher</span>
              </button>
            </div>

            <div className="mt-8 pt-6 rule space-y-3">
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="block h-display"
                style={{
                  fontSize: 22,
                  color: "var(--cobalt)",
                  lineHeight: 1.1,
                }}
              >
                {phone}
              </a>
              <div
                className="h-eyebrow"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                {clientConfig.contact.addressShort}
              </div>
            </div>
          </nav>

          <div
            className="px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid var(--bone-raw)" }}
          >
            <Link
              href="/estimation"
              className="group btn-cobalt btn-shimmer w-full justify-center"
              style={{ padding: "13px 18px", fontSize: 11 }}
            >
              <span className="relative z-[1]">Estimer mon bien</span>
              <ArrowRight className="h-3.5 w-3.5 group-arrow relative z-[1]" strokeWidth={1.5} />
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
