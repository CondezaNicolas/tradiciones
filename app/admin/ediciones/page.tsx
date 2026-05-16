"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { StatusToggle } from "@/app/admin/_components/status-toggle";
import type { IconType } from "react-icons";
import {
  MdAdd,
  MdAutoStories,
  MdChevronRight,
  MdCloudUpload,
  MdDelete,
  MdEdit,
  MdSave,
  MdVisibility,
} from "react-icons/md";

const MATERIAL_ICONS = {
  add: MdAdd,
  autoStories: MdAutoStories,
  chevronRight: MdChevronRight,
  cloudUpload: MdCloudUpload,
  delete: MdDelete,
  edit: MdEdit,
  save: MdSave,
  visibility: MdVisibility,
} as const;

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

const ANIOS = ["2025", "2026"] as const;

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

/* ─────────────────────── Edition type from API ─────────────────────── */

interface Edition {
  id: string;
  title: string;
  category: string;
  month: string;
  year: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────── Status badge ─────────────────────── */

function StatusBadge({ status }: { status: "draft" | "published" }) {
  const isDraft = status === "draft";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest",
        isDraft
          ? "bg-on-surface-variant/10 text-on-surface-variant/60"
          : "bg-green-100 text-green-700",
      ].join(" ")}
    >
      <span
        className={["size-1.5 rounded-full", isDraft ? "bg-on-surface-variant/40" : "bg-green-500"].join(" ")}
      />
      {isDraft ? "Borrador" : "Publicado"}
    </span>
  );
}

/* ─────────────────────── Edition card ─────────────────────── */

function EditionCard({ edition, onDelete }: { edition: Edition; onDelete: (id: string) => void }) {
  const isPublished = edition.status === "published";
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(true);
  }

  function handleConfirmDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDelete(edition.id);
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(false);
  }

  return (
    <div className="group relative">
      <Link
        href={`/admin/ediciones/${edition.id}`}
        className="block cursor-pointer"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-outline-variant/15 shadow-[0_12px_24px_rgba(26,28,28,0.06)]">
          {edition.coverImageUrl ? (
            <Image
              src={edition.coverImageUrl}
              alt={edition.title}
              width={300}
              height={400}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-container-high">
              <MaterialIcon
                className="text-5xl text-on-surface-variant/20"
                name={MATERIAL_ICONS.autoStories}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-60" />
          <div className="absolute right-3 top-3">
            <StatusBadge status={edition.status} />
          </div>
          <div className="absolute bottom-0 inset-x-0 p-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              {edition.category}
            </p>
            <h3 className="mt-1 font-headline text-lg font-light leading-tight text-white line-clamp-2">
              {edition.title}
            </h3>
            <p className="mt-2 font-label text-xs text-white/50">
              {edition.month} {edition.year}
            </p>
          </div>
          {/* Hover overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-on-surface/0 transition-all duration-200 group-hover:bg-on-surface/8">
            <span className="flex items-center gap-2 rounded-full bg-on-surface/80 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:opacity-100">
              <MaterialIcon className="text-sm" name={MATERIAL_ICONS.edit} />
              Editar
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          {isPublished ? (
            <a
              href={`/ediciones/${edition.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-container"
            >
              <MaterialIcon className="text-sm" name={MATERIAL_ICONS.visibility} />
              Ver pública
            </a>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex items-center gap-1 font-label text-[11px] uppercase tracking-widest text-on-surface-variant/60 transition-colors hover:text-error"
          >
            <MaterialIcon className="text-sm" name={MATERIAL_ICONS.delete} />
            Eliminar
          </button>
        </div>

        {confirmDelete && (
          <div className="flex items-center justify-end gap-2 rounded-lg bg-error-container/30 px-3 py-2">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-error">
              ¿Eliminar esta edición?
            </span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded bg-error px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={handleCancelDelete}
              className="rounded border border-outline-variant/30 px-3 py-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant transition-opacity hover:opacity-80"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Empty state ─────────────────────── */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
        <MaterialIcon className="text-4xl text-primary/50" name={MATERIAL_ICONS.autoStories} />
      </div>
      <h3 className="mb-2 font-headline text-xl text-on-surface">
        No hay ediciones todavía
      </h3>
      <p className="mb-8 max-w-sm font-body text-base leading-relaxed text-on-surface-variant/70">
        Creá tu primera revista y empezá a contar las tradiciones de Chile.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="cursor-pointer rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95"
      >
        Crear Primera Edición
      </button>
    </div>
  );
}

/* ─────────────────────── Create form ─────────────────────── */

function CreateForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("Cultura");
  const [mes, setMes] = useState<string>(MESES[new Date().getMonth()]);
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [resumen, setResumen] = useState("");
  const [imagenPortada, setImagenPortada] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formularioCompleto =
    titulo.trim() !== "" &&
    categoria.trim() !== "" &&
    mes.trim() !== "" &&
    anio.trim() !== "" &&
    resumen.trim() !== "" &&
    imagenPortada !== null;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagenPortada(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleCrearRevista() {
    if (!formularioCompleto || !imagenPortada || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create the edition (without cover image URL initially)
      const response = await fetch("/api/admin/editions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titulo,
          category: categoria,
          month: mes,
          year: anio,
          summary: resumen,
          status: "draft",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear la edición");
      }

      const edition = await response.json();

      // Step 2: Upload cover image if a file was selected
      if (coverFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverFile);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();

          // Step 3: Update edition with the uploaded cover URL
          await fetch(`/api/admin/editions/${edition.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coverImageUrl: url }),
          });
        }
      }

      router.push(`/admin/ediciones/${edition.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer transition-colors hover:text-primary"
            >
              EDICIONES
            </button>
            <MaterialIcon className="text-[12px]" name={MATERIAL_ICONS.chevronRight} />
            <span className="font-bold text-primary">NUEVA EDICIÓN</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            Crear Nueva Edición
          </h2>
        </div>

        <div className="flex gap-4 max-[640px]:w-full max-[640px]:flex-col">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-md border border-outline-variant/30 px-6 py-2 font-label text-sm tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            className="cursor-pointer rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-2 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            Publicar Edición
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-12 mt-4 rounded-lg border border-red-200 bg-red-50 px-6 py-4 font-body text-sm text-red-700 max-[980px]:mx-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-12 px-12 py-8 max-[980px]:grid-cols-1 max-[980px]:gap-10 max-[980px]:px-5">
        <div className="col-span-12 space-y-12 lg:col-span-7 max-[980px]:col-span-1">
          <section className="space-y-6">
            <h3 className="border-b border-outline-variant/15 pb-4 font-headline text-2xl">
              Detalles de la Edición
            </h3>

            <div className="space-y-8">
              <div className="group">
                <label className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  TÍTULO DE PORTADA
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: El Alma de la Patagonia"
                  className="w-full border-b-2 border-transparent bg-surface-container-high px-4 py-4 font-headline text-xl transition-all placeholder:text-on-surface-variant/30 focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-8 max-[640px]:grid-cols-1">
                <div>
                  <label className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                    CATEGORÍA PRINCIPAL
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full rounded-none border-none bg-surface-container-high py-3 font-label text-sm outline-none focus:ring-0"
                  >
                    <option>Cultura</option>
                    <option>Gastronomía</option>
                    <option>Arquitectura</option>
                    <option>Naturaleza</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                    MES / AÑO DE PUBLICACIÓN
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                      className="w-full rounded-none border-none bg-surface-container-high py-3 font-label text-sm outline-none focus:ring-0"
                    >
                      {MESES.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={anio}
                      onChange={(e) => setAnio(e.target.value)}
                      className="w-full rounded-none border-none bg-surface-container-high py-3 font-label text-sm outline-none focus:ring-0"
                    >
                      {ANIOS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  RESUMEN EDITORIAL
                </label>
                <textarea
                  rows={4}
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder="Breve descripción del corazón de esta edición..."
                  className="w-full resize-none border-none bg-surface-container-high p-4 font-body text-base leading-relaxed placeholder:text-on-surface-variant/30 focus:outline-none"
                />
              </div>

              <button
                type="button"
                disabled={!formularioCompleto || isSubmitting}
                onClick={handleCrearRevista}
                className={[
                  "rounded-md px-8 py-3 font-label text-sm tracking-wide shadow-lg shadow-primary/10 transition-all active:scale-95",
                  formularioCompleto && !isSubmitting
                    ? "cursor-pointer bg-gradient-to-br from-primary to-primary-container text-white hover:opacity-90"
                    : "cursor-not-allowed bg-surface-container-high text-on-surface-variant/40 shadow-none",
                ].join(" ")}
              >
                {isSubmitting ? "Creando..." : "Crear Revista"}
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="border-b border-outline-variant/15 pb-4 font-headline text-2xl">
              Configuración de Estado
            </h3>

            <div className="flex items-center justify-between gap-6 rounded-xl bg-surface-container-low p-8 max-[1200px]:flex-col max-[1200px]:items-start max-[980px]:p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-primary">
                  <MaterialIcon className="text-[24px]" name={MATERIAL_ICONS.visibility} />
                </div>
                <div>
                  <p className="font-label text-sm font-bold">Estado de Visibilidad</p>
                  <p className="font-label text-xs text-on-surface-variant">
                    Define si la edición será visible para los suscriptores.
                  </p>
                </div>
              </div>

              <StatusToggle />
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-12 lg:col-span-5 max-[980px]:col-span-1">
          <section className="space-y-6">
            <h3 className="border-b border-outline-variant/15 pb-4 font-headline text-2xl">
              Imagen de Portada
            </h3>

            {imagenPortada ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border-2 border-solid border-primary/30">
                <Image
                  src={imagenPortada}
                  alt="Preview de portada"
                  width={300}
                  height={400}
                  className="h-full w-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setImagenPortada(null)}
                  className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface/80 text-on-surface shadow-md transition-all hover:bg-surface active:scale-95"
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="group relative flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface-container-high text-center transition-all hover:border-primary/50">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
                <div className="relative z-10 p-12 transition-transform duration-500 group-hover:scale-105">
                  <MaterialIcon
                    className="mx-auto mb-4 text-6xl text-primary/20"
                    name={MATERIAL_ICONS.cloudUpload}
                  />
                  <p className="mb-2 font-headline text-xl text-on-surface-variant">
                    Arrastra la portada aquí
                  </p>
                  <p className="font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant/60">
                    O haz clic para explorar archivos
                  </p>
                  <p className="mt-8 font-label text-[10px] text-on-surface-variant/40">
                    RECOMENDADO: 2400 x 3200 PX (JPEG/PNG)
                  </p>
                </div>
              </label>
            )}
          </section>
        </div>
      </div>

      <footer className="border-t border-outline-variant/10 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-screen-2xl px-8 py-6">
          <div className="flex items-center justify-center text-center">
            <p className="font-body text-xs tracking-wide text-on-surface-variant/50">
              © {new Date().getFullYear()} Chile País de Tradiciones.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────── Main page ─────────────────────── */

type PageMode = "list" | "create";

export default function EdicionesPage() {
  const router = useRouter();
  const [mode, setMode] = useState<PageMode>("list");
  const [editions, setEditions] = useState<Edition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteEdition(id: string) {
    if (deletingId) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/editions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Error al eliminar la edición");
      }
      setEditions((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  const fetchEditions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/editions");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Error al cargar ediciones");
      }
      const data = await response.json();
      setEditions(data as Edition[]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (mode === "list") {
      fetchEditions();
    }
  }, [mode, fetchEditions]);

  if (mode === "create") {
    return <CreateForm onCancel={() => setMode("list")} />;
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span>DASHBOARD</span>
            <MaterialIcon className="text-[12px]" name={MATERIAL_ICONS.chevronRight} />
            <span className="font-bold text-primary">EDICIONES</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            Ediciones
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setMode("create")}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95"
        >
          <MaterialIcon className="text-lg" name={MATERIAL_ICONS.add} />
          Nueva Edición
        </button>
      </header>

      <div className="px-12 py-8 max-[980px]:px-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/40">
              Cargando ediciones...
            </span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="mb-4 font-body text-base text-on-surface-variant/70">
              {loadError}
            </p>
            <button
              type="button"
              onClick={fetchEditions}
              className="cursor-pointer rounded-md border border-primary px-6 py-2 font-label text-sm tracking-wide text-primary transition-colors hover:bg-surface-container-low active:scale-95"
            >
              Reintentar
            </button>
          </div>
        ) : editions.length === 0 ? (
          <EmptyState onCreate={() => setMode("create")} />
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {editions.map((edition) => (
              <EditionCard key={edition.id} edition={edition} onDelete={handleDeleteEdition} />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-outline-variant/10 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-screen-2xl px-8 py-6">
          <div className="flex items-center justify-center text-center">
            <p className="font-body text-xs tracking-wide text-on-surface-variant/50">
              © {new Date().getFullYear()} Chile País de Tradiciones.
            </p>
          </div>
        </div>
      </footer>

      <button
        type="button"
        aria-label="Guardar cambios"
        className="fixed bottom-12 right-12 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full bg-secondary text-white shadow-2xl transition-all hover:scale-110 active:scale-95 max-[980px]:bottom-6 max-[980px]:right-6"
      >
        <MaterialIcon className="text-2xl" name={MATERIAL_ICONS.save} />
      </button>
    </>
  );
}
