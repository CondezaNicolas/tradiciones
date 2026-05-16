export function Newsletter() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <div className="inline-block p-4 bg-tertiary-fixed rounded-full mb-8">
          <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-4xl">
            mail_lock
          </span>
        </div>
        <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">
          Crónicas en su Bandeja
        </h2>
        <p className="text-on-surface-variant text-lg font-body leading-relaxed mb-12">
          Únase a nuestra comunidad de más de 15,000 lectores y reciba cada
          semana una historia exclusiva sobre el patrimonio inmaterial de Chile.
        </p>
        <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <input
            className="flex-grow bg-surface-container-high border-none rounded-md px-6 py-4 focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-all font-body"
            placeholder="Su correo electrónico"
            type="email"
          />
          <button
            className="bg-secondary text-on-secondary px-8 py-4 rounded-md font-body font-bold hover:opacity-90 transition-all shadow-lg shadow-secondary/10"
            type="submit"
          >
            Suscribirme ahora
          </button>
        </form>
        <p className="mt-6 text-outline text-xs font-body">
          Respetamos su privacidad. Cancele su suscripción en cualquier momento.
        </p>
      </div>
    </section>
  );
}
