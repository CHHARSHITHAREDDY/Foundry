"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useUserStream } from "@/hooks/use-user-stream";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";

interface AppShellProps {
  breadcrumb: string;
  children: React.ReactNode;
}

export function AppShell({ breadcrumb, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: meData, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.getMe(),
  });

  useEffect(() => {
    if (!isLoading && meData && !meData.authenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [isLoading, meData, pathname, router]);

  useUserStream(Boolean(meData?.authenticated));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (isLoading || !meData?.authenticated || !meData.user) {
    return (
      <div className="min-h-screen bg-surface p-8 font-mono">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-stone animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-24 bg-stone animate-pulse" />
            <div className="h-24 bg-stone animate-pulse" />
            <div className="h-24 bg-stone animate-pulse" />
            <div className="h-24 bg-stone animate-pulse" />
          </div>
          <div className="h-64 bg-stone animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body-md text-ink antialiased min-h-screen">
      <Sidebar />
      <div className="pl-60 min-h-screen flex flex-col">
        <DashboardHeader
          currentBreadcrumb={breadcrumb}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onNotificationsClick={() => setNotificationsOpen((p) => !p)}
          user={meData.user}
        />
        <NotificationsPopover isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        <main className="w-full pt-14 flex-1 bg-surface">{children}</main>
      </div>
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
