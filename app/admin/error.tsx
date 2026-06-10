"use client";

import { useEffect } from "react";
import type { IconType } from "react-icons";
import { MdErrorOutline, MdRefresh } from "react-icons/md";

function MaterialIcon({
  className,
  name,
}: {
  className?: string;
  name: IconType;
}) {
  const Icon = name;
  return (
    <Icon
      aria-hidden="true"
      className={["inline-flex shrink-0 leading-none", className]
        .filter(Boolean)
        .join(" ")}
      focusable="false"
    />
  );
}

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-error-container/50">
          <MaterialIcon className="size-10 text-error" name={MdErrorOutline} />
        </div>

        <h2 className="mb-2 font-headline text-2xl text-on-surface">
          Algo salió mal
        </h2>

        <p className="mb-8 font-body text-sm text-on-surface-variant">
          Ocurrió un error inesperado al cargar esta sección.
          {error.digest && (
            <span className="mt-1 block font-mono text-xs text-on-surface-variant/60">
              Ref: {error.digest}
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95"
        >
          <MaterialIcon className="text-lg" name={MdRefresh} />
          Reintentar
        </button>
      </div>
    </div>
  );
}
