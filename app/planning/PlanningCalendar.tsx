"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanningBooking } from "@/app/actions/events";

interface Props {
  bookings: PlanningBooking[];
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const COLORS = [
  { bg: "bg-[#4b8a7b]", text: "text-white", light: "bg-[#e8f3f1]", border: "border-[#4b8a7b]" },
  { bg: "bg-[#eb7a41]", text: "text-white", light: "bg-[#fdf0e8]", border: "border-[#eb7a41]" },
  { bg: "bg-indigo-500", text: "text-white", light: "bg-indigo-50", border: "border-indigo-400" },
  { bg: "bg-rose-500", text: "text-white", light: "bg-rose-50", border: "border-rose-400" },
  { bg: "bg-amber-500", text: "text-white", light: "bg-amber-50", border: "border-amber-400" },
];

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function PlanningCalendar({ bookings }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<PlanningBooking | null>(null);

  const weeks = buildMonthGrid(year, month);
  const colorMap = new Map<string, number>();
  bookings.forEach((b, i) => colorMap.set(b.id, i));

  function bookingsForDay(day: Date): PlanningBooking[] {
    const d = startOfDay(day);
    return bookings.filter((b) => {
      const s = startOfDay(new Date(b.start_at));
      const e = startOfDay(new Date(b.end_at));
      return d >= s && d <= e;
    });
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mois précédent">
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground capitalize">{monthLabel}</h2>
        <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Mois suivant">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-gray-100 border-b border-gray-100 last:border-0">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="min-h-[80px] bg-gray-50/50 p-1" />;
              const isToday = isSameDay(day, today);
              const dayBookings = bookingsForDay(day);
              return (
                <div key={di} className="min-h-[80px] p-1 flex flex-col gap-0.5">
                  <span className={`self-start mb-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-[#eb7a41] text-white" : "text-foreground"}`}>
                    {day.getDate()}
                  </span>
                  {dayBookings.slice(0, 3).map((b) => {
                    const color = getColor(colorMap.get(b.id) ?? 0);
                    const isStart = isSameDay(day, new Date(b.start_at));
                    const label = b.job_post_title ?? b.event_title ?? "Mission";
                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelected(selected?.id === b.id ? null : b)}
                        className={`w-full text-left rounded px-1 py-0.5 text-[10px] font-medium truncate border-l-2 ${color.light} ${color.border} text-gray-800 hover:opacity-80 transition-opacity`}
                        title={label}
                      >
                        {isStart && formatTime(b.start_at) + " "}{label}
                      </button>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <span className="text-[9px] text-muted-foreground pl-1">+{dayBookings.length - 3} autres</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <div className={`rounded-xl border p-4 shadow-sm ${getColor(colorMap.get(selected.id) ?? 0).light} border-l-4 ${getColor(colorMap.get(selected.id) ?? 0).border}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{selected.job_post_title ?? selected.event_title ?? "Mission"}</p>
              {selected.event_title && selected.job_post_title && (
                <p className="text-sm text-muted-foreground">Événement : {selected.event_title}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Du <span className="font-medium text-foreground">{formatDate(selected.start_at)}</span>{" "}
                au <span className="font-medium text-foreground">{formatDate(selected.end_at)}</span>
              </p>
              <p className="text-sm text-muted-foreground">{formatTime(selected.start_at)} → {formatTime(selected.end_at)}</p>
              {selected.city && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />{selected.city}
                </p>
              )}
              {selected.agreed_pay_amount != null && (
                <p className="text-sm font-medium text-foreground">
                  Rémunération : {selected.agreed_pay_amount.toLocaleString("fr-FR")} €
                </p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none" aria-label="Fermer">×</button>
          </div>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mes interventions</p>
          <div className="flex flex-wrap gap-2">
            {bookings.map((b, i) => {
              const color = getColor(i);
              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(selected?.id === b.id ? null : b)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${color.bg} ${color.text} hover:opacity-80 transition-opacity`}
                >
                  {b.job_post_title ?? b.event_title ?? "Mission"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
