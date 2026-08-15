"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@repo/ui/utils";

const NAV_LINKS = [
  { href: "/biens", label: "Nos biens" },
  { href: "/favoris", label: "Mes favoris" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden min-w-12 min-h-12" aria-expanded={open} aria-label="Menu de navigation" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navigation principale" className="flex flex-col gap-4 mt-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={cn(
                "text-lg font-medium transition-colors",
                pathname.startsWith(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
