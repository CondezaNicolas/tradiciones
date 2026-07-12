"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  MdAdd,
  MdArticle,
  MdAutoStories,
  MdDashboard,
  MdLogout,
  MdSettings,
} from "react-icons/md";

import { SiteBrand } from "@/components/site-brand";

interface NavItem {
  icon: IconType;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: MdDashboard, label: "Escritorio", href: "/admin" },
  { icon: MdAutoStories, label: "Ediciones", href: "/admin/ediciones" },
  { icon: MdArticle, label: "Artículos", href: "/admin/articulos" },
  { icon: MdSettings, label: "Configuración", href: "/admin/configuracion" },
];

interface MaterialIconProps {
  className?: string;
  name: IconType;
}

function MaterialIcon({ className, name }: MaterialIconProps) {
  const Icon = name;

  return (
    <Icon
      aria-hidden="true"
      className={["inline-flex shrink-0 leading-none", className].filter(Boolean).join(" ")}
      focusable="false"
    />
  );
}

export function AdminSidebar() {
  const { push, refresh } = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      push("/");
      refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-outline-variant/15 bg-surface py-8 max-[980px]:static max-[980px]:w-full max-[980px]:border-b max-[980px]:border-r-0 max-[980px]:px-5 max-[980px]:py-6">
      <div>
        <div className="mb-10 px-6 max-[980px]:mb-8 max-[980px]:px-0">
          <SiteBrand
            className="gap-3"
            logoClassName="h-16 w-16"
            subtitleClassName="text-[11px]"
            textClassName="pb-0"
            titleClassName="text-lg"
          />
          <p className="mt-1 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            Panel Editorial
          </p>
        </div>

        <nav className="no-scrollbar flex-1 gap-y-1 overflow-y-auto max-[980px]:grid max-[980px]:gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "flex items-center gap-3 px-6 py-4 transition-all duration-300 ease-in-out hover:bg-surface-container-low hover:opacity-90 active:scale-95 max-[980px]:px-4",
                  isActive
                    ? "border-r-4 border-secondary bg-surface-container-low text-secondary max-[980px]:border-r-0 max-[980px]:border-l-4"
                    : "text-on-background",
                ].join(" ")}
              >
                <MaterialIcon className="text-[20px]" name={item.icon} />
                <span className="font-label text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-outline-variant/10 px-6 pt-8 max-[980px]:px-0 max-[980px]:pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/images/admin-editorial-avatar.jpg"
            alt="Admin Avatar"
            width={40}
            height={40}
            className="size-10 rounded-full object-cover grayscale"
          />
          <div className="min-w-0">
            <p className="truncate font-label text-sm font-bold">Editorial Admin</p>
            <p className="truncate font-label text-[10px] text-on-surface-variant">SANTIAGO, CHILE</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-label text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
          >
            <MaterialIcon className="text-sm" name={MdAdd} />
            <span>Nueva Edición</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/25 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MaterialIcon className="text-sm" name={MdLogout} />
            <span>{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
