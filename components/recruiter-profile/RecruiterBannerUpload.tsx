"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveRecruiterBannerUrl } from "@/app/actions/recruiter-profile";
import {
  AVATAR_BUCKET,
  formatAvatarUploadError,
  getBannerStoragePath,
  validateBannerFile,
} from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecruiterBannerUploadProps {
  companyName: string;
  initialBannerUrl: string | null;
  className?: string;
}

export function RecruiterBannerUpload({
  companyName,
  initialBannerUrl,
  className,
}: RecruiterBannerUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBannerUrl(initialBannerUrl);
  }, [initialBannerUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateBannerFile(file);
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

      const { path, contentType } = getBannerStoragePath(user.id, file);
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

      const result = await saveRecruiterBannerUrl(publicUrl);
      if (result.error) {
        setError(result.error);
        return;
      }

      setBannerUrl(result.banner_url ?? publicUrl);
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
        className="group relative block w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
        aria-label="Changer la bannière du profil"
      >
        <div
          className={cn(
            "h-40 bg-gradient-to-br from-primary/35 via-muted to-secondary/40 sm:h-48",
            bannerUrl && "bg-cover bg-center"
          )}
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
          role="img"
          aria-label={
            bannerUrl
              ? `Bannière de ${companyName}`
              : `Bannière par défaut de ${companyName}`
          }
        />

        <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white">
            <Camera className="size-4" aria-hidden />
            {isPending ? "Envoi en cours…" : "Changer la bannière"}
          </span>
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
