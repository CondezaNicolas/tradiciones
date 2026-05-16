"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SiteBrand } from "@/components/site-brand";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-10 text-center">
          <div className="flex justify-center">
            <SiteBrand
              className="gap-3"
              logoClassName="h-16 w-16"
              subtitleClassName="text-sm"
              textClassName="pb-0"
              titleClassName="text-xl"
            />
          </div>
          <p className="mt-2 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            Panel Editorial
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm"
        >
          <h2 className="mb-6 font-headline text-xl text-on-surface">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-error-container/50 px-4 py-3">
              <p className="font-label text-sm text-error">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block font-label text-xs uppercase tracking-widest text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              placeholder="admin@tradiciones.cl"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1.5 block font-label text-xs uppercase tracking-widest text-on-surface-variant"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 font-body text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 font-label text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-6 text-center font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
          Acceso exclusivo para administradores
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
