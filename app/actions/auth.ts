"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export type AuthError = string | null;

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function uploadAvatarAndUpdateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  table: "recruiter_profiles" | "intermittent_profiles"
): Promise<void> {
  if (file.size > MAX_AVATAR_BYTES) return;
  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_TYPES.includes(type)) return;
  const ext = type.replace("image/", "") || "jpg";
  const path = `${userId}/avatar.${ext}`;
  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, buffer, { contentType: type, upsert: true });
  if (uploadError) return;
  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  await supabase.from(table).update({ avatar_url: urlData.publicUrl }).eq("user_id", userId);
}

/** Inscription recruteur */
export async function signUpRecruiter(formData: FormData): Promise<{ error: AuthError }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const company_name = (formData.get("company_name") as string)?.trim();
  const website_url = (formData.get("website_url") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const avatar = formData.get("avatar") as File | null;

  if (!email || !password || !company_name) {
    return { error: "Email, mot de passe et nom d'entreprise requis." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "RECRUITER" as UserRole,
        company_name,
        website_url,
        city,
      },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Erreur lors de la création du compte." };

  const userId = data.user.id;
  if (avatar?.size && avatar.size > 0) {
    await uploadAvatarAndUpdateProfile(supabase, userId, avatar, "recruiter_profiles");
  }

  redirect("/connexion?message=Compte recruteur créé. Connectez-vous.");
}

/** Inscription intermittent */
export async function signUpIntermittent(formData: FormData): Promise<{ error: AuthError }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const display_name = (formData.get("display_name") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const avatar = formData.get("avatar") as File | null;

  if (!email || !password || !display_name) {
    return { error: "Email, mot de passe et nom d'affichage requis." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "INTERMITTENT" as UserRole,
        display_name,
        bio,
        city,
      },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Erreur lors de la création du compte." };

  const userId = data.user.id;
  if (avatar?.size && avatar.size > 0) {
    await uploadAvatarAndUpdateProfile(supabase, userId, avatar, "intermittent_profiles");
  }

  redirect("/connexion?message=Compte intermittent créé. Connectez-vous.");
}

/** Connexion (recruteur ou intermittent). Retourne success sans rediriger pour que le client puisse recharger la page (et mettre à jour le Header). */
export async function signIn(formData: FormData): Promise<{ error: AuthError }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Email ou mot de passe incorrect." };

  return { error: null };
}

/** Déconnexion (ne redirige pas ; le client doit faire un rechargement complet pour mettre à jour la navbar). */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/** Récupère l’URL de l’avatar du compte connecté (recruteur ou intermittent). */
export async function getCurrentUserAvatar(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return null;
  const { data: rec } = await supabase
    .from("recruiter_profiles")
    .select("avatar_url")
    .eq("user_id", user.id)
    .single();
  if (rec?.avatar_url) return rec.avatar_url;
  const { data: inter } = await supabase
    .from("intermittent_profiles")
    .select("avatar_url")
    .eq("user_id", user.id)
    .single();
  return inter?.avatar_url ?? null;
}
