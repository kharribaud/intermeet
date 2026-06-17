export const AVATAR_BUCKET = "avatars";
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const MAX_BANNER_BYTES = 3 * 1024 * 1024;
export const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export function formatAvatarUploadError(message: string): string {
  if (message.toLowerCase().includes("bucket not found")) {
    return "Le stockage des photos n'est pas configuré. Exécutez supabase/migration-avatar.sql dans Supabase.";
  }
  return message;
}

export function validateAvatarFile(file: File): { error: string | null } {
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "L'image ne doit pas dépasser 2 Mo." };
  }

  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_AVATAR_TYPES.includes(type as (typeof ALLOWED_AVATAR_TYPES)[number])) {
    return { error: "Format non supporté. Utilisez JPG, PNG, WebP ou GIF." };
  }

  return { error: null };
}

export function getAvatarStoragePath(
  userId: string,
  file: File
): { path: string; contentType: string } {
  const type = file.type.toLowerCase();
  const ext = type.replace("image/", "") || "jpg";
  return {
    path: `${userId}/avatar.${ext}`,
    contentType: type,
  };
}

export function validateBannerFile(file: File): { error: string | null } {
  if (file.size > MAX_BANNER_BYTES) {
    return { error: "L'image ne doit pas dépasser 3 Mo." };
  }

  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_AVATAR_TYPES.includes(type as (typeof ALLOWED_AVATAR_TYPES)[number])) {
    return { error: "Format non supporté. Utilisez JPG, PNG, WebP ou GIF." };
  }

  return { error: null };
}

export function getBannerStoragePath(
  userId: string,
  file: File
): { path: string; contentType: string } {
  const type = file.type.toLowerCase();
  const ext = type.replace("image/", "") || "jpg";
  return {
    path: `${userId}/banner.${ext}`,
    contentType: type,
  };
}
