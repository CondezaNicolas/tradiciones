"use client";

import { useState } from "react";

const STATUS_OPTIONS = ["Borrador", "Publicado"] as const;

export function StatusToggle() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex rounded-full bg-surface-container-high p-1">
      {STATUS_OPTIONS.map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => setActive(index)}
          className={[
            "cursor-pointer rounded-full px-6 py-2 font-label text-xs font-bold transition-colors",
            index === active
              ? "bg-white text-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-variant",
          ].join(" ")}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
