import { getDb } from "./index";
import { adminUsers } from "./schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();

  const adminEmail = "admin@tradiciones.cl";
  const [existingAdmin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, adminEmail))
    .limit(1);

  if (existingAdmin) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 12);

  await db.insert(adminUsers).values({
    id: nanoid(),
    email: adminEmail,
    name: "Admin",
    passwordHash,
    role: "admin",
  });

  console.log(`Created admin user: ${adminEmail}`);
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
