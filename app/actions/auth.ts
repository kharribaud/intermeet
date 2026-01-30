"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export type AuthError = string | null;

/** Inscription recruteur */
export async function signUpRecruiter(formData: FormData): Promise<{ error: AuthError }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const company_name = (formData.get("company_name") as string)?.trim();
  const website_url = (formData.get("website_url") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;

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

  // La ligne public.users et le profil recruteur sont créés par le trigger
  // handle_new_auth_user() sur auth.users (voir supabase/trigger-auth-user.sql)
  redirect("/connexion?message=Compte recruteur créé. Connectez-vous.");
}

/** Inscription intermittent */
export async function signUpIntermittent(formData: FormData): Promise<{ error: AuthError }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const display_name = (formData.get("display_name") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;

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

  // La ligne public.users et le profil intermittent sont créés par le trigger
  // handle_new_auth_user() sur auth.users (voir supabase/trigger-auth-user.sql)
  redirect("/connexion?message=Compte intermittent créé. Connectez-vous.");
}

/** Connexion (recruteur ou intermittent) */
export async function signIn(formData: FormData): Promise<{ error: AuthError }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Email ou mot de passe incorrect." };

  redirect("/");
}

/** Déconnexion */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
