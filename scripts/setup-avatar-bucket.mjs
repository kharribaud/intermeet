/**
 * Crée le bucket Supabase "avatars" (nécessite SUPABASE_SERVICE_ROLE_KEY dans .env).
 * Usage : npm run setup:avatars
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env"
  );
  console.error(
    "Récupérez la service role key : Supabase > Project Settings > API > service_role"
  );
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: listError } = await admin.storage.listBuckets();
if (listError) {
  console.error("Erreur lecture buckets :", listError.message);
  process.exit(1);
}

if (buckets?.some((bucket) => bucket.name === "avatars")) {
  console.log('Le bucket "avatars" existe déjà.');
  process.exit(0);
}

const { error } = await admin.storage.createBucket("avatars", {
  public: true,
  fileSizeLimit: 2 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
});

if (error) {
  console.error("Erreur création bucket :", error.message);
  console.error(
    "Alternative : exécutez le fichier supabase/migration-avatar.sql dans le SQL Editor Supabase."
  );
  process.exit(1);
}

console.log('Bucket "avatars" créé avec succès.');
