import Image from "next/image";
import { Parisienne } from "next/font/google";

import { IoArrowForward } from "react-icons/io5";

const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
});

export function Hero({
  hasEdiciones = false,
}: {
  hasEdiciones?: boolean;
}) {
  return (
    <section className="relative h-screen min-h-[800px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          className="object-cover object-top"
          src="/images/hero-background.webp"
          alt="Torres del Paine granite peaks reflecting in a calm turquoise glacial lake during sunrise"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-on-surface/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full pt-20">
        <div className="max-w-5xl">
          {/* <span className="inline-block px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            EDICIÓN ESPECIAL
          </span> */}
          <h1
            className={`${parisienne.className} mb-8 text-6xl text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.45),0_8px_24px_rgba(0,0,0,0.3),1px_1px_0_rgba(0,0,0,0.22),-1px_1px_0_rgba(0,0,0,0.22),1px_-1px_0_rgba(0,0,0,0.22),-1px_-1px_0_rgba(0,0,0,0.22)] sm:text-7xl lg:text-8xl`}
          >
            {/* <BrandWordmark
              text="Chile, País de Tradiciones"
              className="font-headline text-5xl font-black leading-[1.05] tracking-tight whitespace-normal sm:text-6xl lg:text-8xl lg:whitespace-nowrap"
              fillClassName="from-red-700 via-white to-blue-900"
              strokeWidth="1.5px"
              strokeColor="rgba(0, 0, 0, 0.95)"
            /> */}
            Chile, Pais de Tradiciones
          </h1>
          <p className="text-surface-variant text-xl md:text-2xl font-body leading-relaxed mb-10 max-w-xl">
            Descubra las historias no contadas de los guardianes del patrimonio
            chileno, desde las cumbres de los Andes hasta los canales australes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              disabled={!hasEdiciones}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-md font-body text-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-3 not-disabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:select-none"
            >
              Explorar la última edición
              <IoArrowForward className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
