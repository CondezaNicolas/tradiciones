"use client";

import { useReducer } from "react";
import type { IconType } from "react-icons";
import { MdLock, MdCheck, MdError } from "react-icons/md";

function MaterialIcon({ className, name }: { className?: string; name: IconType }) {
  const Icon = name;
  return <Icon aria-hidden="true" className={["inline-flex shrink-0 leading-none", className].filter(Boolean).join(" ")} focusable="false" />;
}

export function PasswordForm() {
  const [form, dispatch] = useReducer(
    (state: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      isSubmitting: boolean;
      message: { type: "success" | "error"; text: string } | null;
    }, action:
      | { type: "field"; field: "currentPassword" | "newPassword" | "confirmPassword"; value: string }
      | { type: "submit" }
      | { type: "success" }
      | { type: "error"; text: string }
      | { type: "done" }) => {
      switch (action.type) {
        case "field": return { ...state, [action.field]: action.value };
        case "submit": return { ...state, isSubmitting: true, message: null };
        case "success": return { ...state, isSubmitting: false, currentPassword: "", newPassword: "", confirmPassword: "", message: { type: "success" as const, text: "Contraseña actualizada correctamente" } };
        case "error": return { ...state, isSubmitting: false, message: { type: "error" as const, text: action.text } };
        case "done": return { ...state, isSubmitting: false };
      }
    },
    { currentPassword: "", newPassword: "", confirmPassword: "", isSubmitting: false, message: null },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit" });

    if (form.newPassword !== form.confirmPassword) {
      dispatch({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (form.newPassword.length < 8) {
      dispatch({ type: "error", text: "La nueva contraseña debe tener al menos 8 caracteres" });
      return;
    }

    try {
      const res = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch({ type: "error", text: data.error ?? "Error al cambiar la contraseña" });
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
          <MaterialIcon className="text-[24px]" name={MdLock} />
        </div>
        <div>
          <h3 className="font-headline text-2xl">Cambiar Contraseña</h3>
          <p className="font-label text-xs text-on-surface-variant">
            Actualizá tu contraseña de acceso al panel editorial
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
            htmlFor="current-password"
            className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            CONTRASEÑA ACTUAL
          </label>
          <input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => dispatch({ type: "field", field: "currentPassword", value: e.target.value })}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            NUEVA CONTRASEÑA
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => dispatch({ type: "field", field: "newPassword", value: e.target.value })}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            CONFIRMAR NUEVA CONTRASEÑA
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => dispatch({ type: "field", field: "confirmPassword", value: e.target.value })}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="Repetir nueva contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="cursor-pointer rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {form.isSubmitting ? "Guardando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </section>
  );
}
