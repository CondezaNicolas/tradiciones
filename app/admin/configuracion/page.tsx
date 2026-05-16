"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { MdChevronRight, MdLock, MdCheck, MdError } from "react-icons/md";

function MaterialIcon({ className, name }: { className?: string; name: IconType }) {
  const Icon = name;
  return <Icon aria-hidden="true" className={["inline-flex shrink-0 leading-none", className].filter(Boolean).join(" ")} focusable="false" />;
}

export default function ConfiguracionPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 8 caracteres" });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Error al cambiar la contraseña" });
        return;
      }

      setMessage({ type: "success", text: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({ type: "error", text: "Error de conexión. Intenta de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span>DASHBOARD</span>
            <MaterialIcon className="text-[12px]" name={MdChevronRight} />
            <span className="font-bold text-primary">CONFIGURACIÓN</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            Configuración
          </h2>
        </div>
      </header>

      <div className="px-12 py-8 max-[980px]:px-5">
        <div className="max-w-lg">
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

            {message && (
              <div
                className={[
                  "flex items-center gap-2 rounded-lg px-4 py-3",
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-error-container/50 text-error",
                ].join(" ")}
              >
                <MaterialIcon
                  className="text-sm"
                  name={message.type === "success" ? MdCheck : MdError}
                />
                <p className="font-label text-sm">{message.text}</p>
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
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                  placeholder="Repetir nueva contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Actualizar Contraseña"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
