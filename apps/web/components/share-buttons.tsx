"use client";

import { Share2, Link2, Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { useRef, useState } from "react";
import { toast } from "sonner";

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

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "width=600,height=400,noopener,noreferrer",
    );
  }

  function shareOnWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${window.location.href}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareByEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(window.location.href)}`;
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
      toast.error("Impossible de copier le lien");
      return;
    }
    toast.success("Lien copié");
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="min-w-12 min-h-12" aria-label="Partager" />}>
        <Share2 className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={shareOnFacebook}>Facebook</DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnWhatsApp}>WhatsApp</DropdownMenuItem>
        <DropdownMenuItem onClick={shareByEmail}>Email</DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          {copied ? <Check className="h-3.5 w-3.5 mr-2" /> : <Link2 className="h-3.5 w-3.5 mr-2" />}
          {copied ? "Copié !" : "Copier le lien"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
