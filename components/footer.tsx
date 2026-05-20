export function Footer() {
  return (
    <footer className="bg-surface/80 backdrop-blur-md border-t border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto px-8 py-6">
        <div className="flex items-center justify-center text-center">
          <p className="text-on-surface-variant/50 font-body text-xs tracking-wide" suppressHydrationWarning>
            © {new Date().getFullYear()} Chile País de Tradiciones.
          </p>
        </div>
      </div>
    </footer>
  );
}
