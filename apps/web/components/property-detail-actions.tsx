"use client";

import { useRef, useState } from "react";
import { Share2, Link2, Check, Heart, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { FacebookIcon } from "./social-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { useFavorites } from "@/lib/use-favorites";
import { cn } from "@repo/ui/utils";
import { formatPrice } from "@repo/shared/utils";

const buttonCls =
  "inline-flex items-center justify-center h-10 w-10 transition-colors";
const buttonStyle: React.CSSProperties = {
  background: "var(--paper-raw)",
  color: "var(--ink-raw)",
  border: "1px solid var(--bone-raw)",
};
const buttonStyleActive: React.CSSProperties = {
  background: "var(--cobalt)",
  color: "white",
  border: "1px solid var(--cobalt)",
};

// Fallback copy via hidden textarea + execCommand — utilisé quand
// navigator.clipboard n'est pas disponible (vieux navigateurs, iframe sans
// Permission-Policy, contexte non-HTTPS).
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function PropertyDetailActions({
  propertyId,
  title,
  price,
  transactionType,
}: {
  propertyId: string;
  title: string;
  price?: number;
  transactionType?: "vente" | "location";
}) {
  const { toggle, isFavorite } = useFavorites();
  const fav = isFavorite(propertyId);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Construit le message enrichi : "Regarde ce bien : {title} à {price} — {url}"
  function buildShareText(url: string) {
    if (typeof price === "number" && Number.isFinite(price)) {
      const priceLabel =
        transactionType === "location"
          ? `${formatPrice(price)}/mois`
          : formatPrice(price);
      return `Regarde ce bien : ${title} à ${priceLabel} — ${url}`;
    }
    return `${title} — ${url}`;
  }

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "width=600,height=400",
    );
  }
  function shareOnWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(buildShareText(window.location.href))}`,
      "_blank",
    );
  }
  function shareByEmail() {
    const url = window.location.href;
    const body =
      typeof price === "number" && Number.isFinite(price)
        ? `${buildShareText(url)}`
        : url;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }
  async function copyLink() {
    const url = window.location.href;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        ok = true;
      } else {
        ok = legacyCopy(url);
      }
    } catch {
      ok = legacyCopy(url);
    }

    if (!ok) {
      toast.error("Impossible de copier le lien.");
      return;
    }

    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggle(propertyId)}
        aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={fav}
        className={buttonCls}
        style={fav ? buttonStyleActive : buttonStyle}
      >
        <Heart
          className={cn("h-4 w-4", fav && "fill-current")}
          strokeWidth={1.4}
        />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Partager"
              className={buttonCls}
              style={buttonStyle}
            />
          }
        >
          <Share2 className="h-4 w-4" strokeWidth={1.4} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-hairline-strong bg-paper min-w-[200px]"
        >
          <DropdownMenuItem onClick={copyLink} className="text-[13px] gap-2.5">
            {copied ? (
              <Check className="h-3.5 w-3.5 text-ok" strokeWidth={1.4} />
            ) : (
              <Link2 className="h-3.5 w-3.5" strokeWidth={1.4} />
            )}
            {copied ? "Lien copié" : "Copier le lien"}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-hairline" />
          <DropdownMenuItem onClick={shareOnFacebook} className="text-[13px] gap-2.5">
            <FacebookIcon width={14} height={14} />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={shareOnWhatsApp}
            className="text-[13px] gap-2.5"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.4} />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareByEmail} className="text-[13px] gap-2.5">
            <Mail className="h-3.5 w-3.5" strokeWidth={1.4} />
            Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
