"use client";

import { useState } from "react";
import { MdTextFields, MdImage, MdLayers, MdAutoAwesome } from "react-icons/md";
import EditorSidebarTextTab from "./editor-sidebar-text-tab";
import EditorSidebarImageTab from "./editor-sidebar-image-tab";
import EditorSidebarLayersTab from "./editor-sidebar-layers-tab";
import TemplatesTab from "./editor-sidebar/templates-tab";
import type { PageTemplate } from "@/lib/templates/types";

/* ────────────────────────── Types ────────────────────────── */

type SidebarTab = "texto" | "imagen" | "capas" | "plantillas";

interface EditorSidebarProps {
  editionId?: string;
  onApplyTemplate?: (template: PageTemplate) => void;
}

/* ────────────────────────── Sidebar Component ────────────────────────── */

export default function EditorSidebar({ editionId, onApplyTemplate }: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("texto");

  const tabs: {
    id: SidebarTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { id: "texto", label: "Texto", icon: MdTextFields },
    { id: "imagen", label: "Imagen", icon: MdImage },
    { id: "capas", label: "Capas", icon: MdLayers },
    { id: "plantillas", label: "Plantillas", icon: MdAutoAwesome },
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
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-1 py-2 font-label text-[9px] font-medium uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface-variant"
              }`}
            >
              <Icon size={14} />
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
        {activeTab === "plantillas" && onApplyTemplate && (
          <TemplatesTab onApplyTemplate={onApplyTemplate} />
        )}
      </div>
    </div>
  );
}
