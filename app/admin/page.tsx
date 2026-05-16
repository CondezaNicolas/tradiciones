export default function EscritorioPage() {
  return (
    <>
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span className="font-bold text-primary">DASHBOARD</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            Escritorio
          </h2>
        </div>
      </header>

      <div className="px-12 py-8 max-[980px]:px-5">
        <p className="font-body text-on-surface-variant">Bienvenido al panel editorial.</p>
      </div>
    </>
  );
}
