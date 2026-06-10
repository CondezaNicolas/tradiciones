export default function MultimediaPage() {
  return (
    <>
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span>DASHBOARD</span>
            <span className="text-on-surface-variant/40">/</span>
            <span className="font-bold text-primary">MULTIMEDIA</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            Multimedia
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
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
          <p className="font-body text-on-surface-variant">
            Próximamente: gestión de imágenes y archivos multimedia.
          </p>
        </div>
      </div>
    </>
  );
}
