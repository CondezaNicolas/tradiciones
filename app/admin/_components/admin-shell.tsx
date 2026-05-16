"use client";

import { usePathname } from "next/navigation";

import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AdminSidebar />
      <main className="ml-64 min-h-screen bg-surface max-[980px]:ml-0">{children}</main>
    </div>
  );
}
