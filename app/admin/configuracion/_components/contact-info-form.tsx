"use client";

import { useReducer } from "react";
import type { IconType } from "react-icons";
import {
  MdContactPhone,
  MdCheck,
  MdError,
} from "react-icons/md";
import {
  IoCallOutline,
  IoLogoWhatsapp,
  IoMailOutline,
  IoLocationOutline,
} from "react-icons/io5";

function MaterialIcon({ className, name }: { className?: string; name: IconType }) {
  const Icon = name;
  return <Icon aria-hidden="true" className={["inline-flex shrink-0 leading-none", className].filter(Boolean).join(" ")} focusable="false" />;
}

export interface ContactInfoValues {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
}

type FormState = ContactInfoValues & {
  isSubmitting: boolean;
  message: { type: "success" | "error"; text: string } | null;
};

type FormAction =
  | { type: "field"; field: keyof ContactInfoValues; value: string }
  | { type: "submit" }
  | { type: "success" }
  | { type: "error"; text: string };

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "field":
      return { ...state, [action.field]: action.value };
    case "submit":
      return { ...state, isSubmitting: true, message: null };
    case "success":
      return { ...state, isSubmitting: false, message: { type: "success", text: "Información de contacto actualizada" } };
    case "error":
      return { ...state, isSubmitting: false, message: { type: "error", text: action.text } };
  }
}

export function ContactInfoForm({ initialValues }: { initialValues: ContactInfoValues }) {
  const [form, dispatch] = useReducer(reducer, {
    ...initialValues,
    isSubmitting: false,
    message: null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit" });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          whatsapp: form.whatsapp,
          email: form.email,
          address: form.address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch({ type: "error", text: data.error ?? "Error al guardar" });
        return;
      }

      dispatch({ type: "success" });
    } catch {
      dispatch({ type: "error", text: "Error de conexión. Intenta de nuevo." });
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4 border-b border-outline-variant/15 pb-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-primary">
          <MaterialIcon className="text-[24px]" name={MdContactPhone} />
        </div>
        <div>
          <h3 className="font-headline text-2xl">Información de Contacto</h3>
          <p className="font-label text-xs text-on-surface-variant">
            Se muestra en la sección &quot;Conectemos en Persona&quot; del sitio público
          </p>
        </div>
      </div>

      {form.message && (
        <div
          className={[
            "flex items-center gap-2 rounded-lg px-4 py-3",
            form.message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-error-container/50 text-error",
          ].join(" ")}
        >
          <MaterialIcon
            className="text-sm"
            name={form.message.type === "success" ? MdCheck : MdError}
          />
          <p className="font-label text-sm">{form.message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="contact-phone"
            className="mb-2 flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            <MaterialIcon className="text-sm" name={IoCallOutline} />
            TELÉFONO
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => dispatch({ type: "field", field: "phone", value: e.target.value })}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="+56 2 2345 6789"
          />
        </div>

        <div>
          <label
            htmlFor="contact-whatsapp"
            className="mb-2 flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            <MaterialIcon className="text-sm" name={IoLogoWhatsapp} />
            WHATSAPP
          </label>
          <input
            id="contact-whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={(e) => dispatch({ type: "field", field: "whatsapp", value: e.target.value })}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="+56 9 8765 4321"
          />
          <p className="mt-1.5 font-label text-[10px] text-on-surface-variant/50">
            Se usa para el botón &quot;Escribir por WhatsApp&quot; — incluye el código de país
          </p>
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            <MaterialIcon className="text-sm" name={IoMailOutline} />
            CORREO
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => dispatch({ type: "field", field: "email", value: e.target.value })}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="contacto@chilepaisdetradiciones.cl"
          />
        </div>

        <div>
          <label
            htmlFor="contact-address"
            className="mb-2 flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            <MaterialIcon className="text-sm" name={IoLocationOutline} />
            DIRECCIÓN
          </label>
          <input
            id="contact-address"
            type="text"
            value={form.address}
            onChange={(e) => dispatch({ type: "field", field: "address", value: e.target.value })}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="Providencia 1208, Of. 402, Santiago"
          />
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="cursor-pointer rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {form.isSubmitting ? "Guardando..." : "Guardar Información"}
        </button>
      </form>
    </section>
  );
}
