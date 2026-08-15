"use client";

import { Mail, Share2, Link2, Check, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { FacebookIcon } from "./social-icons";

// Fallback copy quand navigator.clipboard n'est pas disponible.
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

const buttonCls =
  "h-10 w-10 flex items-center justify-center border transition-colors hover:bg-[color:var(--ivory-raw)]";
const buttonStyle: React.CSSProperties = { borderColor: "var(--bone-raw)" };

export function BlogShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  // Tactile + Web Share API → sheet natif OS au lieu du dropdown desktop.
  const [useNativeShare, setUseNativeShare] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;
    setUseNativeShare(isTouch && typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  async function triggerNativeShare() {
    if (typeof window === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title, url: window.location.href });
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
    }
  }

  function shareByEmail() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title} — ${url}`)}`;
  }

  function shareOnTwitter() {
    if (typeof window === "undefined") return;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareOnFacebook() {
    if (typeof window === "undefined") return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "width=600,height=400,noopener,noreferrer",
    );
  }

  function shareOnWhatsApp() {
    if (typeof window === "undefined") return;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${window.location.href}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copyLink() {
    if (typeof window === "undefined") return;
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
      toast.error("Impossible de copier le lien");
      return;
    }

    setCopied(true);
    toast.success("Lien copié");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-3">
      {useNativeShare ? (
        <button
          type="button"
          onClick={triggerNativeShare}
          aria-label="Partager"
          className={buttonCls}
          style={buttonStyle}
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      ) : (
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
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
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
            <DropdownMenuItem onClick={shareOnTwitter} className="text-[13px] gap-2.5">
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.4} />
              Twitter / X
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareOnFacebook} className="text-[13px] gap-2.5">
              <FacebookIcon width={14} height={14} />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareOnWhatsApp} className="text-[13px] gap-2.5">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.4} />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareByEmail} className="text-[13px] gap-2.5">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.4} />
              Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

    </div>
  );
}
