import type { ReactNode } from "react";
import type { Agent } from "@repo/shared/supabase/types";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { PropertyImage } from "@repo/ui/property-image";

function roleLabel(agent: Agent) {
  const r = (agent as Agent & { role?: string }).role;
  if (r === "admin") return "Directeur d'agence";
  return "Négociateur";
}

export function AgentCard({
  agent,
  variant = "inline",
  showCTAs = true,
  contactHref = "#contact-form",
  visitCta,
}: {
  agent: Agent;
  variant?: "inline" | "panel";
  showCTAs?: boolean;
  contactHref?: string;
  /**
   * Remplace le lien par défaut « Nous contacter ». Utile pour
   * injecter un déclencheur de drawer (VisitRequestDrawer) côté page.
   * Si non fourni, on retombe sur `contactHref` en ancre classique.
   */
  visitCta?: ReactNode;
}) {
  const initials = `${agent.first_name[0] ?? ""}${agent.last_name[0] ?? ""}`.toUpperCase();

  if (variant === "panel") {
    return (
      <div className="border border-border bg-card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="w-[52px] h-[52px] shrink-0 relative bg-muted overflow-hidden rounded-full">
            {agent.photo_url ? (
              <PropertyImage
                src={agent.photo_url}
                alt={`${agent.first_name} ${agent.last_name}`}
                fill
                sizes="52px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground text-[14px] truncate">
              {agent.first_name} {agent.last_name}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {roleLabel(agent)}
            </div>
          </div>
        </div>

        {/* CTAs */}
        {showCTAs && (
          <div className="pt-5 flex flex-col gap-2.5">
            {visitCta ?? (
              <a
                href={contactHref}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
              >
                Nous contacter
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.3} />
              </a>
            )}
            {agent.phone && (
              <a
                href={`tel:${agent.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 border border-border text-foreground text-[13px] hover:border-primary transition-colors"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.3} />
                {agent.phone}
              </a>
            )}
            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 border border-border text-foreground text-[13px] hover:border-primary transition-colors"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.3} />
                Écrire
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Inline variant — used in /a-propos
  return (
    <article className="border-t border-border py-6 grid grid-cols-[96px_1fr] md:grid-cols-[120px_1fr] gap-6">
      <div className="relative bg-muted aspect-[4/5] overflow-hidden">
        {agent.photo_url ? (
          <PropertyImage
            src={agent.photo_url}
            alt={`${agent.first_name} ${agent.last_name}`}
            fill
            sizes="120px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-medium text-muted-foreground">
            {initials}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[20px] font-semibold tracking-tight mt-1.5">
          {agent.first_name} {agent.last_name}
        </h3>
        <div className="text-[12px] text-muted-foreground mt-1">
          {roleLabel(agent)}
        </div>
        {agent.bio && (
          <p className="text-[13px] text-muted-foreground mt-3 leading-[1.6] line-clamp-3">
            {agent.bio}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
          {agent.phone && (
            <a
              href={`tel:${agent.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-3 w-3" strokeWidth={1.3} />
              {agent.phone}
            </a>
          )}
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-3 w-3" strokeWidth={1.3} />
              Écrire
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
