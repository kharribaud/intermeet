"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAvatarUrl } from "@/app/actions/auth";
import {
  AVATAR_BUCKET,
  formatAvatarUploadError,
  getAvatarStoragePath,
  validateAvatarFile,
} from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/talent-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecruiterAvatarUploadProps {
  companyName: string;
  initialAvatarUrl: string | null;
  className?: string;
}

export function RecruiterAvatarUpload({
  companyName,
  initialAvatarUrl,
  className,
}: RecruiterAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initials = getInitials(companyName);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (validation.error) {
      setError(validation.error);
      event.target.value = "";
      return;
    }

    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        setError("Non authentifié.");
        return;
      }

      const { path, contentType } = getAvatarStoragePath(user.id, file);
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { contentType, upsert: true });

      if (uploadError) {
        setError(formatAvatarUploadError(uploadError.message));
        return;
      }

      const { data: urlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const result = await saveProfileAvatarUrl(publicUrl);
      if (result.error) {
        setError(result.error);
        return;
      }

      setAvatarUrl(result.avatar_url ?? publicUrl);
      router.refresh();
    });

    event.target.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
        aria-label="Changer la photo de profil"
      >
        <Avatar className="size-24 border-4 border-card shadow-sm sm:size-28">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={companyName} />
          ) : null}
          <AvatarFallback className="bg-muted text-xl font-semibold text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-6 text-white" aria-hidden />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
      />

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
