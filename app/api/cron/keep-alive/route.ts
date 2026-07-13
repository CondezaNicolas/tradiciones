import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/storage/server";

/**
 * Vercel Cron target — pings Supabase Storage so the free-tier project
 * never crosses the 7-day inactivity threshold that auto-pauses it.
 * A storage list call is enough to count as API activity; nothing is
 * read or written beyond that.
 *
 * Vercel signs cron requests with `Authorization: Bearer $CRON_SECRET`
 * automatically once CRON_SECRET is set as an env var — see
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed: without a configured secret the endpoint would be publicly
  // callable, so refuse to run until CRON_SECRET is set.
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET no está configurado" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (process.env.STORAGE_PROVIDER !== "supabase") {
    return NextResponse.json({ skipped: "Supabase storage no está configurado" });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "revistas";

    const { error } = await supabase.storage
      .from(bucket)
      .list("", { limit: 1 });

    if (error) throw error;

    return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/keep-alive] Supabase ping failed:", err);
    return NextResponse.json(
      { error: "Error al hacer ping a Supabase" },
      { status: 500 },
    );
  }
}
