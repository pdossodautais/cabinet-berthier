import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl font-bold text-primary mb-2">404</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page introuvable</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        <Home className="mr-2 h-4 w-4" />
        Retour au dashboard
      </Link>
    </div>
  );
}
