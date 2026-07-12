import { sql, eq } from "drizzle-orm";
import type { getDb } from "./index";
import { siteSettings } from "./schema";

const SITE_SETTINGS_ID = "contact";

// Pre-fills the public contact section and the admin form the first time
// this runs — these were the previously hardcoded values, kept as the
// starting point so the site doesn't go blank before an admin edits them.
const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: "+56 2 2345 6789",
  whatsapp: "+56 9 8765 4321",
  email: "contacto@chilepaisdetradiciones.cl",
  address: "Providencia 1208, Of. 402, Santiago",
};

export interface ContactInfo {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
}

type Db = ReturnType<typeof getDb>;

/**
 * Creates the site_settings table if it doesn't exist yet. There's no
 * migration runner wired into deploys, so the table self-provisions on
 * first use — this keeps production working without a manual db:push
 * against the Turso database.
 */
async function ensureSiteSettingsTable(db: Db): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      phone TEXT,
      whatsapp TEXT,
      email TEXT,
      address TEXT,
      updated_at INTEGER NOT NULL
    )
  `);
}

export async function getContactInfo(db: Db): Promise<ContactInfo> {
  await ensureSiteSettingsTable(db);

  const [row] = await db
    .select({
      phone: siteSettings.phone,
      whatsapp: siteSettings.whatsapp,
      email: siteSettings.email,
      address: siteSettings.address,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);

  return row ?? DEFAULT_CONTACT_INFO;
}

export async function updateContactInfo(
  db: Db,
  data: ContactInfo,
): Promise<ContactInfo> {
  await ensureSiteSettingsTable(db);

  const [existing] = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);

  if (existing) {
    await db
      .update(siteSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(siteSettings.id, SITE_SETTINGS_ID));
  } else {
    await db.insert(siteSettings).values({ id: SITE_SETTINGS_ID, ...data });
  }

  return data;
}
