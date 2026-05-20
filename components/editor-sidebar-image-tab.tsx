"use client";

import { useRef, useState } from "react";
import { useCanvasContext } from "@/components/canvas/canvas-provider";
import { compressImage } from "@/lib/image-utils";
import { MdImage, MdUpload } from "react-icons/md";

export default function EditorSidebarImageTab({ editionId }: { editionId?: string }) {
  const [isUploading, setIsUploading] = useState(false);

  const { addImage, activeCanvasIndex } = useCanvasContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const noCanvas = activeCanvasIndex === null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsUploading(true);

    try {
      const file = await compressImage(rawFile);

      const formData = new FormData();
      formData.append("file", file);

      if (editionId) {
        formData.append("editionId", editionId);
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("No se pudo subir la imagen");
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("La subida no devolvió URL");
      }

      await addImage(data.url);
    } catch {
      alert("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }

    e.target.value = "";
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <div className="flex flex-col gap-3">
        <span className="font-label text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">
          Agregar Imagen
        </span>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={noCanvas || isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-lowest px-4 py-8 font-label text-[11px] uppercase tracking-wider text-on-surface-variant/60 transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MdUpload size={20} />
          <span>{isUploading ? "Subiendo..." : "Subir Imagen"}</span>
        </button>

        {/* Empty state for image grid */}
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <MdImage size={32} className="text-on-surface-variant/20" />
          <span className="font-label text-[10px] text-on-surface-variant/40">
            Las imágenes subidas aparecerán aquí
          </span>
        </div>
      </div>
    </>
  );
}
