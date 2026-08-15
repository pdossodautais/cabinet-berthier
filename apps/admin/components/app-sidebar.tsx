"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Users,
  Settings,
  Bell,
  Calculator,
  FileText,
  Star,
  CircleHelp,
} from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/sidebar";
import { Badge } from "@repo/ui/badge";
import { NavUser } from "@/components/nav-user";
import { HelpDialog } from "@/components/help-dialog";
import type { AgentRole } from "@repo/shared/supabase/types";

const ACCENT = clientConfig.brand.accentColor;
const INITIALS =
  clientConfig.agencyShortName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3) || "AG";

const navMain = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Biens", url: "/biens", icon: Building2 },
  { title: "Contacts", url: "/contacts", icon: MessageSquare },
  { title: "Estimations", url: "/estimations", icon: Calculator },
  { title: "Alertes", url: "/alertes", icon: Bell },
];

const navContent = [
  { title: "Blog", url: "/blog", icon: FileText },
  { title: "Témoignages", url: "/temoignages", icon: Star },
];

// Secondaire : Paramètres = lien, Aide = dialog in-app (géré séparément
// dans le JSX pour pouvoir tenir un état local d'ouverture).
const navSecondary = [
  { title: "Paramètres", url: "/parametres", icon: Settings },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  propertyCount?: number;
  newCounts?: Record<string, number>;
  userRole?: AgentRole;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
}

export function AppSidebar({
  propertyCount,
  newCounts = {},
  userRole = "admin",
  userName,
  userEmail,
  userAvatar,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = React.useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              {/* Light mode */}
              <svg
                viewBox="0 0 32 32"
                aria-hidden="true"
                className="!size-8 shrink-0 rounded-md aspect-square block dark:hidden"
              >
                <rect width="32" height="32" rx="6" fill={ACCENT} />
                <text
                  x="16"
                  y="21"
                  textAnchor="middle"
                  fontFamily="Georgia, ui-serif, serif"
                  fontSize="13"
                  fontWeight="600"
                  letterSpacing="-0.5"
                  fill="white"
                >
                  {INITIALS}
                </text>
              </svg>
              {/* Dark mode */}
              <svg
                viewBox="0 0 32 32"
                aria-hidden="true"
                className="!size-8 shrink-0 rounded-md aspect-square hidden dark:block"
              >
                <rect width="32" height="32" rx="6" fill="white" />
                <text
                  x="16"
                  y="21"
                  textAnchor="middle"
                  fontFamily="Georgia, ui-serif, serif"
                  fontSize="13"
                  fontWeight="600"
                  letterSpacing="-0.5"
                  fill={ACCENT}
                >
                  {INITIALS}
                </text>
              </svg>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {clientConfig.agencyName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Administration
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation principale — gestion des biens et contacts */}
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.title === "Biens" &&
                    propertyCount != null &&
                    propertyCount > 0 && (
                      <SidebarMenuBadge>
                        <Badge variant="secondary" className="px-1.5 text-[10px]">
                          {propertyCount}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  {newCounts[item.title] != null && newCounts[item.title]! > 0 && (
                    <SidebarMenuBadge>
                      <Badge variant="destructive" className="px-1.5 text-[10px]">
                        {newCounts[item.title]}
                      </Badge>
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Contenu éditorial */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navContent.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {userRole === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/equipe" />}
                    tooltip="Équipe"
                    isActive={isActive("/equipe")}
                  >
                    <Users />
                    <span>Équipe</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondaire — en bas */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Aide : ouvre le HelpDialog (FAQ + dépannage) au lieu d'un
                  lien externe — toutes les réponses restent in-app. */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setHelpOpen(true)}
                  tooltip="Aide"
                >
                  <CircleHelp />
                  <span>Aide</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />

      <SidebarFooter>
        <NavUser
          name={userName}
          email={userEmail}
          avatar={userAvatar}
          role={userRole}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
