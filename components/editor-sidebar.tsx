"use client";

import { useRef, useState } from "react";
import { useCanvasContext } from "@/components/canvas/canvas-provider";
import type { FabricObject } from "fabric";
import {
  MdTextFields,
  MdImage,
  MdLayers,
  MdFlipToFront,
  MdFlipToBack,
  MdDeleteOutline,
  MdUpload,
} from "react-icons/md";

/* ────────────────────────── Types ────────────────────────── */

type SidebarTab = "texto" | "imagen" | "capas";

/* ────────────────────────── Helpers ────────────────────────── */

function getObjectLabel(obj: FabricObject): string {
  switch (obj.type) {
    case "textbox":
      return "Texto";
    case "image":
      return "Imagen";
    default:
      return obj.type ?? "Elemento";
  }
}

function getObjectIcon(obj: FabricObject) {
  return obj.type === "image" ? MdImage : MdTextFields;
}

/* ────────────────────────── Sidebar Component ────────────────────────── */

export default function EditorSidebar({ editionId }: { editionId?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("texto");
  const [isUploading, setIsUploading] = useState(false);

  const {
    addText,
    addImage,
    deleteSelected,
    selectedElement,
    activeCanvasIndex,
    getActiveCanvasObjects,
    selectObject,
    moveObject,
    layersVersion,
  } = useCanvasContext();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function compressImage(file: File): Promise<File> {
    const MAX_DIM = 2400;
    const QUALITY = 0.85;
    const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const bitmap = await createImageBitmap(file);

    let w = bitmap.width;
    let h = bitmap.height;
    if (w > MAX_DIM || h > MAX_DIM) {
      if (w > h) {
        h = Math.round(h * MAX_DIM / w);
        w = MAX_DIM;
      } else {
        w = Math.round(w * MAX_DIM / h);
        h = MAX_DIM;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, QUALITY);
    });

    if (!blob) return file;

    return new File(
      [blob],
      file.name.replace(/\.\w+$/, mimeType === "image/png" ? ".png" : ".jpg"),
      { type: mimeType },
    );
  }

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

  const noCanvas = activeCanvasIndex === null;

  // Get layers for the active canvas — layersVersion forces re-evaluation
  const objects = noCanvas ? [] : getActiveCanvasObjects();
  // Reverse so top layers appear first (like Canva)
  const layers = [...objects].reverse();

  // Exhaust layersVersion dependency for reactive updates
  void layersVersion;

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
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* ── Sidebar panel ── */}
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
          {/* ─── Texto Tab ─── */}
          {activeTab === "texto" && (
            <div className="flex flex-col gap-3">
              <span className="font-label text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">
                Agregar Texto
              </span>

              <button
                type="button"
                onClick={() =>
                  addText({
                    text: "Título",
                    fontFamily: "Newsreader",
                    fontSize: 48,
                  })
                }
                disabled={noCanvas}
                className="flex w-full items-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-4 text-left transition-all duration-200 hover:bg-surface-container-high active:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span
                  className="text-on-surface"
                  style={{
                    fontFamily: "Newsreader",
                    fontSize: "28px",
                    lineHeight: 1,
                  }}
                >
                  Título
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  addText({
                    text: "Subtítulo",
                    fontFamily: "Manrope",
                    fontSize: 32,
                    fontWeight: "bold",
                  })
                }
                disabled={noCanvas}
                className="flex w-full items-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-left transition-all duration-200 hover:bg-surface-container-high active:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span
                  className="text-on-surface"
                  style={{
                    fontFamily: "Manrope",
                    fontSize: "20px",
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  Subtítulo
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  addText({
                    text: "Cuerpo de texto",
                    fontFamily: "Manrope",
                    fontSize: 18,
                  })
                }
                disabled={noCanvas}
                className="flex w-full items-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-left transition-all duration-200 hover:bg-surface-container-high active:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span
                  className="text-on-surface"
                  style={{
                    fontFamily: "Manrope",
                    fontSize: "14px",
                    lineHeight: 1,
                  }}
                >
                  Cuerpo de texto
                </span>
              </button>
            </div>
          )}

          {/* ─── Imagen Tab ─── */}
          {activeTab === "imagen" && (
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
          )}

          {/* ─── Capas Tab ─── */}
          {activeTab === "capas" && (
            <div className="flex flex-col gap-2">
              {layers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <MdLayers size={32} className="text-on-surface-variant/20" />
                  <span className="font-label text-[10px] text-on-surface-variant/40">
                    No hay elementos en esta página
                  </span>
                </div>
              ) : (
                <>
                  <span className="font-label text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">
                    Elementos ({layers.length})
                  </span>

                  <div className="flex flex-col gap-1">
                    {layers.map((obj, i) => {
                      const Icon = getObjectIcon(obj);
                      const isSelected = selectedElement === obj;
                      return (
                        <button
                          key={`layer-${obj.type}-${i}`}
                          type="button"
                          onClick={() => selectObject(obj)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/10 text-on-surface"
                              : "text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={
                              isSelected
                                ? "text-primary"
                                : "text-on-surface-variant/60"
                            }
                          />
                          <span className="flex-1 font-label text-[11px]">
                            {getObjectLabel(obj)}
                          </span>
                          <div
                            className="flex gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => moveObject(obj, "forward")}
                              title="Traer adelante"
                              className="flex h-6 w-6 items-center justify-center rounded text-on-surface-variant/50 transition-colors hover:bg-surface-container-high hover:text-on-surface-variant"
                            >
                              <MdFlipToFront size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveObject(obj, "backward")}
                              title="Enviar atrás"
                              className="flex h-6 w-6 items-center justify-center rounded text-on-surface-variant/50 transition-colors hover:bg-surface-container-high hover:text-on-surface-variant"
                            >
                              <MdFlipToBack size={14} />
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Delete selected element */}
                  {selectedElement && (
                    <div className="mt-4 border-t border-outline-variant/15 pt-3">
                      <button
                        type="button"
                        onClick={deleteSelected}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-error/30 px-3 py-2 font-label text-[11px] font-medium text-error transition-all duration-200 hover:bg-error-container active:scale-95"
                      >
                        <MdDeleteOutline size={16} />
                        Eliminar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
