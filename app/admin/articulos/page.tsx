export default function ArticulosPage() {
  return (
    <>
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span>DASHBOARD</span>
            <span className="text-on-surface-variant/40">/</span>
            <span className="font-bold text-primary">ARTÍCULOS</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            Artículos
          </h2>
        </div>
      </header>

      <div className="px-12 py-8 max-[980px]:px-5">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-surface-container-high text-primary">
            <svg
              className="size-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <p className="font-body text-on-surface-variant">
            Próximamente: gestión de artículos y contenido editorial.
          </p>
        </div>
      </div>
    </>
  );
}
