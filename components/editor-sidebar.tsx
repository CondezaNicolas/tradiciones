"use client";

import EditorSidebarImageTab from "./editor-sidebar-image-tab";

/* ────────────────────────── Types ────────────────────────── */

interface EditorSidebarProps {
  editionId?: string;
}

/* ────────────────────────── Sidebar Component ────────────────────────── */

export default function EditorSidebar({ editionId }: EditorSidebarProps) {
  return (
    <div className="flex h-[640px] w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border-r border-outline-variant/15 bg-surface">
      <div className="flex-1 overflow-y-auto p-4">
        <EditorSidebarImageTab editionId={editionId} />
      </div>
    </div>
  );
}
