import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getContactInfo } from "@/lib/db/site-settings";
import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const db = getDb();
  const { address } = await getContactInfo(db);

  return <AdminShell address={address}>{children}</AdminShell>;
}
