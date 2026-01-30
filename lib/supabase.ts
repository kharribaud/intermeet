/**
 * Point d'entrée pour Supabase.
 * - Server: utiliser createClient() depuis lib/supabase/server.ts
 * - Client: utiliser createClient() depuis lib/supabase/client.ts
 */
export { createClient as createServerClient } from "./supabase/server";
export { createClient as createBrowserClient } from "./supabase/client";
