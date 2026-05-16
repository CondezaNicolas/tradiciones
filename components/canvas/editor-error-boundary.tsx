"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * React error boundary that catches Fabric.js rendering errors
 * without crashing the entire admin page.
 */
export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[EditorErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-surface-container-lowest p-8">
          <p className="text-center font-body text-sm text-on-surface-variant">
            Error en el editor. Recargá la página para continuar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.1em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
