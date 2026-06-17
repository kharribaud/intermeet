import { createClient } from "@supabase/supabase-js";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/** Client admin (service role) — uniquement côté serveur. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Crée le bucket avatars s'il n'existe pas encore. */
export async function ensureAvatarBucket(): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) return listError.message;

  if (buckets?.some((bucket) => bucket.name === AVATAR_BUCKET)) {
    return null;
  }

  const { error } = await admin.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    fileSizeLimit: MAX_AVATAR_BYTES,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  return error?.message ?? null;
}
