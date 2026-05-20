import Image from "next/image";
import Link from "next/link";

import { IoArrowForwardOutline, IoNewspaperOutline } from "react-icons/io5";

export interface Edicion {
  id: string;
  mes: string;
  anio: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  alt: string;
}

function EdicionCard({ edicion, index }: { edicion: Edicion; index: number }) {
  return (
    <Link
      href={`/ediciones/${edicion.id}`}
      className={`group block ${index === 1 ? "md:mt-12" : ""}`}
    >
      <div className="relative overflow-hidden aspect-[3/4] rounded-lg mb-6 shadow-[0_12px_24px_rgba(26,28,28,0.06)]">
        {edicion.imagen ? (
          <Image
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={edicion.imagen}
            alt={edicion.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <IoNewspaperOutline className="text-4xl text-on-surface-variant/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-1 rounded tracking-widest mb-2 inline-block">
            {edicion.mes} {edicion.anio}
          </span>
        </div>
      </div>
      <h3 className="font-headline text-2xl text-on-surface mb-2">
        {edicion.titulo}
      </h3>
      <p className="text-on-surface-variant font-body line-clamp-3">
        {edicion.descripcion}
      </p>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <IoNewspaperOutline className="text-4xl text-primary/50" />
      </div>
      <h3 className="font-headline text-xl text-on-surface mb-2">
        Sin ediciones por ahora
      </h3>
      <p className="text-on-surface-variant/70 text-base font-body max-w-sm leading-relaxed">
        Estamos trabajando en nuevas publicaciones. Vuelve pronto para descubrir
        las tradiciones que tenemos para contar.
      </p>
    </div>
  );
}

const EMPTY_EDICIONES: Edicion[] = [];

export function EdicionesRecientes({
  ediciones = EMPTY_EDICIONES,
}: {
  ediciones?: Edicion[];
}) {
  const hasEdiciones = ediciones.length > 0;

  return (
    <section id="ediciones-recientes" className="py-24 bg-surface">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">
              Ediciones Recientes
            </h2>
            <p className="text-on-surface-variant text-lg font-body leading-relaxed">
              Una curatería de relatos visuales y escritos que capturan la
              esencia de nuestra identidad nacional a través de las estaciones.
            </p>
          </div>
          {hasEdiciones ? (
            <Link
              className="text-primary font-bold flex items-center gap-2 group"
              href="/#ediciones-recientes"
            >
              Ver todas las ediciones
              <IoArrowForwardOutline className="text-xl group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <span className="text-on-surface-variant/40 font-bold flex items-center gap-2 cursor-not-allowed select-none">
              Ver todas las ediciones
              <IoArrowForwardOutline className="text-xl" />
            </span>
          )}
        </div>

        {hasEdiciones ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {ediciones.map((edicion, index) => (
              <EdicionCard key={edicion.id} edicion={edicion} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
