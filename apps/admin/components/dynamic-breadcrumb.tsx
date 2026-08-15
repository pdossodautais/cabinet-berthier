"use client";

import type { JSX } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";

const ROUTE_LABELS: Record<string, string> = {
  biens: "Biens",
  nouveau: "Nouveau",
  contacts: "Contacts",
  equipe: "Équipe",
  parametres: "Paramètres",
};

function isUuid(segment: string): boolean {
  return /^[0-9a-f-]{20,}$/i.test(segment);
}

function getSubpageLabel(parent: string, segment: string): string | null {
  if (isUuid(segment) || /^\d+$/.test(segment)) {
    if (parent === "biens") return "Modifier";
    if (parent === "contacts") return "Détails";
  }
  return null;
}

interface BreadcrumbEntry {
  label: string;
  href: string;
}

function buildBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Tableau de bord", href: "/" }];
  }

  const crumbs: BreadcrumbEntry[] = [{ label: "Tableau de bord", href: "/" }];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const parent = i > 0 ? segments[i - 1] : "";
    currentPath += `/${segment}`;

    const dynamicLabel = getSubpageLabel(parent, segment);
    if (dynamicLabel) {
      crumbs.push({ label: dynamicLabel, href: currentPath });
    } else {
      const label = ROUTE_LABELS[segment] ?? segment;
      crumbs.push({ label, href: currentPath });
    }
  }

  return crumbs;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.flatMap((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const items: JSX.Element[] = [];

          if (index > 0) {
            items.push(<BreadcrumbSeparator key={`sep-${crumb.href}`} />);
          }

          items.push(
            <BreadcrumbItem key={crumb.href}>
              {isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );

          return items;
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
