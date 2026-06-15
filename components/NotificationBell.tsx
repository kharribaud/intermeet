"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import type { AppNotification } from "@/app/actions/notifications";
import { updateApplicationStatus } from "@/app/actions/job-posts";

function NotificationItem({
  notif,
  onAction,
}: {
  notif: AppNotification;
  onAction: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const payload = notif.payload;

  async function handleAccept() {
    startTransition(async () => {
      await updateApplicationStatus(payload.application_id as string, "ACCEPTED");
      await markNotificationRead(notif.id);
      onAction();
      router.refresh();
    });
  }

  async function handleReject() {
    startTransition(async () => {
      await updateApplicationStatus(payload.application_id as string, "REJECTED");
      await markNotificationRead(notif.id);
      onAction();
      router.refresh();
    });
  }

  async function handleRead() {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      onAction();
    }
  }

  const timeAgo = (() => {
    const diff = Date.now() - new Date(notif.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  })();

  if (notif.type === "NEW_APPLICATION") {
    return (
      <div
        className={`p-3 border-b border-gray-100 last:border-0 ${notif.read ? "bg-white" : "bg-orange-50"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug">
              <span className="text-[#eb7a41]">{payload.intermittent_name as string}</span> a postulé à{" "}
              <span className="font-semibold">« {payload.job_post_title as string} »</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
          </div>
        </div>

        {/* Lien vers le profil */}
        {payload.intermittent_user_id && (
          <Link
            href={`/talents/${payload.intermittent_user_id as string}`}
            className="mt-2 inline-flex items-center gap-1 text-xs text-[#4b8a7b] hover:underline font-medium"
            onClick={() => { if (!notif.read) markNotificationRead(notif.id).then(onAction); }}
          >
            <ExternalLink className="size-3" />
            Voir le profil
          </Link>
        )}

        {!notif.read && payload.application_id && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-gray-200"
              disabled={pending}
              onClick={handleReject}
            >
              Refuser
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs bg-[#eb7a41] hover:bg-[#d66e3a] text-white"
              disabled={pending}
              onClick={handleAccept}
            >
              Accepter
            </Button>
          </div>
        )}
        {notif.read && (
          <p className="text-xs text-muted-foreground mt-1 italic">Traité</p>
        )}
      </div>
    );
  }

  if (notif.type === "APPLICATION_ACCEPTED") {
    return (
      <div
        className={`p-3 border-b border-gray-100 last:border-0 cursor-pointer ${notif.read ? "bg-white" : "bg-green-50"}`}
        onClick={handleRead}
      >
        <p className="text-sm font-medium text-foreground leading-snug">
          🎉 Votre candidature à{" "}
          <span className="font-semibold">« {payload.job_post_title as string} »</span> a été{" "}
          <span className="text-[#4b8a7b]">acceptée</span>
        </p>
        {payload.event_title && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Événement : {payload.event_title as string}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
        {!notif.read && (
          <p className="text-xs text-[#4b8a7b] mt-1 font-medium">
            → Retrouvez l&apos;événement dans &quot;Mes événements&quot;
          </p>
        )}
      </div>
    );
  }

  if (notif.type === "APPLICATION_REJECTED") {
    return (
      <div
        className={`p-3 border-b border-gray-100 last:border-0 cursor-pointer ${notif.read ? "bg-white" : "bg-gray-50"}`}
        onClick={handleRead}
      >
        <p className="text-sm font-medium text-foreground leading-snug">
          Votre candidature à{" "}
          <span className="font-semibold">« {payload.job_post_title as string} »</span> a été{" "}
          <span className="text-gray-500">refusée</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
      </div>
    );
  }

  return null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function loadNotifications() {
    const { data } = await getMyNotifications();
    setNotifications(data ?? []);
  }

  useEffect(() => {
    loadNotifications();

    // Polling léger toutes les 30s pour les nouvelles notifications
    const interval = setInterval(loadNotifications, 30000);

    // Realtime Supabase sur la table notifications
    const supabase = createClient();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    await loadNotifications();
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#eb7a41] text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#4b8a7b] hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucune notification
              </p>
            ) : (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  onAction={loadNotifications}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
