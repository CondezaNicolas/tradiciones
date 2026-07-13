import { getDb } from "./index";
import { adminUsers } from "./schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@tradiciones.cl";
  const [existingAdmin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, adminEmail))
    .limit(1);

  if (existingAdmin) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  // Never ship a hardcoded default password. Use ADMIN_PASSWORD if provided,
  // otherwise generate a strong random one and print it once so it can be
  // stored in a password manager and changed after first login.
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword && envPassword.length < 8) {
    console.error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
    process.exit(1);
  }
  const generatedPassword = envPassword ?? randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(generatedPassword, 12);

  await db.insert(adminUsers).values({
    id: nanoid(),
    email: adminEmail,
    name: "Admin",
    passwordHash,
    role: "admin",
  });

  console.log(`Created admin user: ${adminEmail}`);
  if (!envPassword) {
    console.log("─".repeat(60));
    console.log(`Contraseña generada (guárdala ahora, no se volverá a mostrar):`);
    console.log(`  ${generatedPassword}`);
    console.log("─".repeat(60));
  }
}

seed()
  .then(() => {
    console.log("Seed completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
