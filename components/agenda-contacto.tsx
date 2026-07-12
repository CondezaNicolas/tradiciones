import {
  IoCallOutline,
  IoLogoWhatsapp,
  IoMailOutline,
  IoLocationOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";

interface AgendaContactoProps {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
}

export function AgendaContacto({ phone, whatsapp, email, address }: AgendaContactoProps) {
  const contactInfo: { icon: IconType; label: string }[] = [
    phone ? { icon: IoCallOutline, label: phone } : null,
    whatsapp ? { icon: IoLogoWhatsapp, label: whatsapp } : null,
    email ? { icon: IoMailOutline, label: email } : null,
    address ? { icon: IoLocationOutline, label: address } : null,
  ].filter((item) => item !== null);

  const whatsappDigits = whatsapp?.replace(/\D/g, "") ?? "";

  return (
    <section id="conectemos-en-persona" className="py-24 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="lg:w-1/2">
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-8">
              Conectemos en Persona
            </h2>
            <p className="text-on-surface-variant text-lg font-body leading-relaxed mb-8">
              ¿Su organización busca visibilizar raíces culturales con rigor
              editorial? Colaboramos con municipalidades, fundaciones, empresas
              e instituciones que desean documentar y difundir patrimonio
              vivo. Conversemos sobre cómo nuestra plataforma puede dar voz a
              sus tradiciones.
            </p>

          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_32px_64px_-15px_rgba(26,28,28,0.04)] border border-outline-variant/10 p-8 space-y-6">
              <h3 className="font-headline text-2xl text-on-surface">
                Contacto
              </h3>

              <div className="w-12 h-px bg-outline-variant" />

              {contactInfo.length > 0 && (
                <div className="space-y-4">
                  {contactInfo.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon className="text-lg text-on-surface-variant shrink-0" />
                      <span className="text-on-surface font-body text-sm">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {whatsappDigits && (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary py-3.5 rounded-md font-body font-bold hover:bg-primary-container transition-colors"
                >
                  <IoLogoWhatsapp className="text-lg" />
                  Escribir por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
