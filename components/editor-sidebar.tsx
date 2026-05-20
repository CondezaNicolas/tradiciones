"use client";

import { useState } from "react";
import { MdTextFields, MdImage, MdLayers } from "react-icons/md";
import EditorSidebarTextTab from "./editor-sidebar-text-tab";
import EditorSidebarImageTab from "./editor-sidebar-image-tab";
import EditorSidebarLayersTab from "./editor-sidebar-layers-tab";

/* ────────────────────────── Types ────────────────────────── */

type SidebarTab = "texto" | "imagen" | "capas";

/* ────────────────────────── Sidebar Component ────────────────────────── */

export default function EditorSidebar({ editionId }: { editionId?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("texto");

  const tabs: {
    id: SidebarTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { id: "texto", label: "Texto", icon: MdTextFields },
    { id: "imagen", label: "Imagen", icon: MdImage },
    { id: "capas", label: "Capas", icon: MdLayers },
  ];

  return (
    <div className="flex h-[640px] w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border-r border-outline-variant/15 bg-surface">
      {/* ── Tab pills ── */}
      <div className="flex gap-1 border-b border-outline-variant/15 p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-label text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface-variant"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "texto" && <EditorSidebarTextTab />}
        {activeTab === "imagen" && <EditorSidebarImageTab editionId={editionId} />}
        {activeTab === "capas" && <EditorSidebarLayersTab />}
      </div>
    </div>
  );
}
