import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { SiteHeader } from "@/components/site-header";
import { RealtimeContacts } from "@/components/realtime-contacts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarWrapper />
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </div>
      </SidebarInset>
      <RealtimeContacts />
    </SidebarProvider>
  );
}
