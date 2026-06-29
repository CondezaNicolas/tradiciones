"use client";

import { useRef, useReducer } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/image-utils";
import { getTemplateById } from "@/lib/templates/registry";
import { EditionFormHeader } from "./edition-form-header";
import { EditionDetailsSection } from "./edition-details-section";
import { CoverImageSection } from "./cover-image-section";
import { savePageApi } from "@/lib/canvas/page-store";

/* ─────────────────────── Reducer ─────────────────────── */

type FormField = "titulo" | "categoria" | "mes" | "anio" | "resumen" | "plantillaInicial";

interface FormState {
  titulo: string;
  categoria: string;
  mes: string;
  anio: string;
  resumen: string;
  plantillaInicial: string;
  imagenPortada: string | null;
  isSubmitting: boolean;
  error: string | null;
}

type FormAction =
  | { type: "field"; field: FormField; value: string }
  | { type: "setCover"; value: string | null }
  | { type: "submit" }
  | { type: "error"; text: string };

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "field":
      return { ...state, [action.field]: action.value };
    case "setCover":
      return { ...state, imagenPortada: action.value };
    case "submit":
      return { ...state, isSubmitting: true, error: null };
    case "error":
      return { ...state, isSubmitting: false, error: action.text };
  }
}

const INITIAL_STATE: FormState = {
  titulo: "",
  categoria: "Invierno",
  mes: MESES[new Date().getMonth()],
  anio: new Date().getFullYear().toString(),
  resumen: "",
  plantillaInicial: "",
  imagenPortada: null,
  isSubmitting: false,
  error: null,
};

/* ─────────────────────── Create form ─────────────────────── */

export function CreateForm({ onCancel }: { onCancel: () => void }) {
  const { push } = useRouter();
  const [form, dispatchForm] = useReducer(formReducer, INITIAL_STATE);
  const coverFileRef = useRef<File | null>(null);

  const formularioCompleto =
    form.titulo.trim() !== "" &&
    form.categoria.trim() !== "" &&
    form.mes.trim() !== "" &&
    form.anio.trim() !== "" &&
    form.resumen.trim() !== "" &&
    form.imagenPortada !== null;

  function handleFieldChange(field: FormField, value: string) {
    dispatchForm({ type: "field", field, value });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    coverFileRef.current = file;

    const reader = new FileReader();
    reader.onload = () => {
      dispatchForm({ type: "setCover", value: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  async function handleCrearRevista() {
    if (!formularioCompleto || !form.imagenPortada || form.isSubmitting) return;

    dispatchForm({ type: "submit" });

    try {
      const response = await fetch("/api/admin/editions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.titulo,
          category: form.categoria,
          month: form.mes,
          year: form.anio,
          summary: form.resumen,
          status: "draft",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear la edición");
      }

      const edition = await response.json();

      if (form.plantillaInicial) {
        const template = getTemplateById(form.plantillaInicial);
        if (template) {
          await savePageApi(edition.id, 2, template.fabricJson);
        }
      }

      if (coverFileRef.current) {
        const compressed = await compressImage(coverFileRef.current);
        const uploadFormData = new FormData();
        uploadFormData.append("file", compressed);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();

          await fetch(`/api/admin/editions/${edition.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coverImageUrl: url }),
          });
        }
      }

      push(`/admin/ediciones/${edition.id}`);
    } catch (err) {
      dispatchForm({ type: "error", text: err instanceof Error ? err.message : "Error desconocido" });
    }
  }

  return (
    <>
      <EditionFormHeader onCancel={onCancel} isSubmitting={form.isSubmitting} />

      {form.error && (
        <div className="mx-12 mt-4 rounded-lg border border-red-200 bg-red-50 px-6 py-4 font-body text-sm text-red-700 max-[980px]:mx-5">
          {form.error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-12 px-12 py-8 max-[980px]:grid-cols-1 max-[980px]:gap-10 max-[980px]:px-5">
        <div className="col-span-12 space-y-12 lg:col-span-7 max-[980px]:col-span-1">
          <EditionDetailsSection
            titulo={form.titulo}
            categoria={form.categoria}
            mes={form.mes}
            anio={form.anio}
            resumen={form.resumen}
            plantillaInicial={form.plantillaInicial}
            isSubmitting={form.isSubmitting}
            canSubmit={formularioCompleto}
            onFieldChange={handleFieldChange}
            onSubmit={handleCrearRevista}
          />
        </div>

        <div className="col-span-12 space-y-12 lg:col-span-5 max-[980px]:col-span-1">
          <CoverImageSection
            coverPreview={form.imagenPortada}
            onCoverChange={handleImageChange}
            onCoverRemove={() => dispatchForm({ type: "setCover", value: null })}
          />
        </div>
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
    </>
  );
}
