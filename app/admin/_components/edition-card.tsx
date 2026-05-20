"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MaterialIcon, MATERIAL_ICONS } from "./material-icon";

/* ─────────────────────── Edition type from API ─────────────────────── */

export interface Edition {
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

export function EditionCard({ edition, onDelete }: { edition: Edition; onDelete: (id: string) => void }) {
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
