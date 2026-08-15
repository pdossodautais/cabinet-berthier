"use client";

import * as React from "react";
import {
  Bell,
  KeyRound,
  Mail,
  MapPin,
  Share2,
  Shield,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@repo/ui/utils";

/**
 * Registry d'icônes autorisées pour la sidebar. Les pages (Server Components)
 * passent juste une string — impossible de sérialiser un LucideIcon à travers
 * la frontière server/client (ce sont des objets avec render function).
 */
const ICONS = {
  bell: Bell,
  keyRound: KeyRound,
  mail: Mail,
  mapPin: MapPin,
  share2: Share2,
  shield: Shield,
  star: Star,
  userRound: UserRound,
} as const satisfies Record<string, LucideIcon>;

export type SettingsNavIcon = keyof typeof ICONS;

export type SettingsNavItem = {
  id: string;
  label: string;
  icon?: SettingsNavIcon;
};

interface SettingsShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  sections: SettingsNavItem[];
  children: React.ReactNode;
}

/**
 * SettingsShell — layout 2 colonnes façon Linear/Vercel/Raycast settings :
 * sidebar sticky (220px) à gauche listant les sections, contenu à droite.
 *
 * La sidebar se synchronise avec le scroll via un IntersectionObserver :
 * la section actuellement dans le viewport est mise en évidence. Sur
 * mobile, la sidebar devient une tab-bar scrollable horizontalement.
 */
export function SettingsShell({
  eyebrow,
  title,
  description,
  sections,
  children,
}: SettingsShellProps) {
  const [activeId, setActiveId] = React.useState<string | undefined>(
    sections[0]?.id,
  );

  React.useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Prend la section la plus haute parmi celles visibles — ignore
        // rootMargin large en bas pour ne pas "sauter" quand on traverse
        // le vide entre deux sections longues.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="mx-auto max-w-6xl min-w-0 px-4 lg:px-6">
      {/* Page header */}
      <div className="mb-8 lg:mb-10">
        {eyebrow && (
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight mt-1">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Layout : sidebar sticky + contenu */}
      <div className="grid min-w-0 gap-x-10 gap-y-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar : vertical sur desktop, horizontal scrollable sur mobile */}
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <nav
            aria-label="Sections de la page"
            className={cn(
              "flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0",
              "scrollbar-thin -mx-1 px-1",
            )}
          >
            {sections.map((s) => {
              const isActive = activeId === s.id;
              const Icon = s.icon ? ICONS[s.icon] : null;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "group inline-flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground/70 group-hover:text-foreground",
                      )}
                      strokeWidth={1.75}
                    />
                  )}
                  {s.label}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Contenu : pile de sections avec scroll-margin pour l'ancrage */}
        <div className="min-w-0 space-y-12 lg:space-y-16">{children}</div>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * SettingsSection — un bloc éditorial ancrable. Titre h2, description
 * muted, contenu en dessous. scroll-mt-6 compense la sticky sidebar sur
 * les ancres.
 */
export function SettingsSection({
  id,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
