"use client";

import { useEffect, useCallback, useRef, useReducer } from "react";
import { useRouter } from "next/navigation";
import { EditionCard, type Edition } from "@/app/admin/_components/edition-card";
import { EmptyState } from "@/app/admin/_components/empty-state";
import { CreateForm } from "@/app/admin/_components/create-edition-form";
import { MaterialIcon, MATERIAL_ICONS } from "@/app/admin/_components/material-icon";

/* ─────────────────────── Main page ─────────────────────── */

type PageMode = "list" | "create";

export default function EdicionesPage() {
  const { push } = useRouter();
  const [page, dispatch] = useReducer(
    (state: { mode: PageMode; editions: Edition[]; isLoading: boolean; loadError: string | null },
     action:
       | { type: "setMode"; mode: PageMode }
       | { type: "loading" }
       | { type: "loaded"; editions: Edition[] }
       | { type: "error"; error: string }
       | { type: "removeEdition"; id: string }) => {
      switch (action.type) {
        case "setMode": return { ...state, mode: action.mode };
        case "loading": return { ...state, isLoading: true as const, loadError: null };
        case "loaded": return { ...state, isLoading: false as const, editions: action.editions };
        case "error": return { ...state, isLoading: false as const, loadError: action.error };
        case "removeEdition": return { ...state, editions: state.editions.filter((e) => e.id !== action.id) };
      }
    },
    { mode: "list" as PageMode, editions: [] as Edition[], isLoading: true, loadError: null },
  );
  const deletingIdRef = useRef<string | null>(null);

  async function handleDeleteEdition(id: string) {
    if (deletingIdRef.current) return;
    deletingIdRef.current = id;

    try {
      const res = await fetch(`/api/admin/editions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Error al eliminar la edición");
      }
      dispatch({ type: "removeEdition", id });
    } catch (err) {
      dispatch({ type: "error", error: err instanceof Error ? err.message : "Error al eliminar" });
    } finally {
      deletingIdRef.current = null;
    }
  }

  const fetchEditions = useCallback(async () => {
    dispatch({ type: "loading" });

    try {
      const response = await fetch("/api/admin/editions");
      if (!response.ok) {
        if (response.status === 401) {
          push("/admin/login");
          return;
        }
        throw new Error("Error al cargar ediciones");
      }
      const data = await response.json();
      dispatch({ type: "loaded", editions: data as Edition[] });
    } catch (err) {
      dispatch({ type: "error", error: err instanceof Error ? err.message : "Error desconocido" });
    }
  }, [push]);

  useEffect(() => {
    if (page.mode === "list") {
      fetchEditions();
    }
  }, [page.mode, fetchEditions]);

  if (page.mode === "create") {
    return <CreateForm onCancel={() => dispatch({ type: "setMode", mode: "list" })} />;
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
          onClick={() => dispatch({ type: "setMode", mode: "create" })}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95"
        >
          <MaterialIcon className="text-lg" name={MATERIAL_ICONS.add} />
          Nueva Edición
        </button>
      </header>

      <div className="px-12 py-8 max-[980px]:px-5">
        {page.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/40">
              Cargando ediciones…
            </span>
          </div>
        ) : page.loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="mb-4 font-body text-base text-on-surface-variant/70">
              {page.loadError}
            </p>
            <button
              type="button"
              onClick={fetchEditions}
              className="cursor-pointer rounded-md border border-primary px-6 py-2 font-label text-sm tracking-wide text-primary transition-colors hover:bg-surface-container-low active:scale-95"
            >
              Reintentar
            </button>
          </div>
        ) : page.editions.length === 0 ? (
          <EmptyState onCreate={() => dispatch({ type: "setMode", mode: "create" })} />
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {page.editions.map((edition) => (
              <EditionCard key={edition.id} edition={edition} onDelete={handleDeleteEdition} />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-outline-variant/10 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-screen-2xl px-8 py-6">
          <div className="flex items-center justify-center text-center">
            <p className="font-body text-xs tracking-wide text-on-surface-variant/50" suppressHydrationWarning>
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
