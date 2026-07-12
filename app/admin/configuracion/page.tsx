import { MdChevronRight } from "react-icons/md";
import { getDb } from "@/lib/db";
import { getContactInfo } from "@/lib/db/site-settings";
import { PasswordForm } from "./_components/password-form";
import { ContactInfoForm } from "./_components/contact-info-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const db = getDb();
  const contact = await getContactInfo(db);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span>DASHBOARD</span>
            <MdChevronRight aria-hidden="true" className="text-[12px]" />
            <span className="font-bold text-primary">CONFIGURACIÓN</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            Configuración
          </h2>
        </div>
      </header>

      <div className="px-12 py-8 max-[980px]:px-5">
        <div className="max-w-lg space-y-12">
          <ContactInfoForm
            initialValues={{
              phone: contact.phone ?? "",
              whatsapp: contact.whatsapp ?? "",
              email: contact.email ?? "",
              address: contact.address ?? "",
            }}
          />
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
