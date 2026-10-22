"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Session, Exam, StudentProgress } from "@/lib/types";
import { formatSpanishDate } from "@/lib/date-utils";
import { DayDetail } from "./DayDetail";

interface CalendarViewProps {
  initialDate?: string;
  exams: Exam[];
  sessions: Session[];
  progressMap: Record<string, StudentProgress>;
}

export function CalendarView({
  initialDate = "2026-10-21",
  exams,
  sessions,
  progressMap,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  // Default to October 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 is October

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Subject codes and badge styles
  const subjectBadges: Record<string, { code: string; bg: string; text: string }> = {
    anatomia: { code: "A", bg: "#2776db", text: "#ffffff" },
    histologia: { code: "H", bg: "#8651cf", text: "#ffffff" },
    biologia: { code: "B", bg: "#169477", text: "#ffffff" },
    biofisica: { code: "Bf", bg: "#d18a13", text: "#ffffff" },
    bioestadistica: { code: "Be", bg: "#64718a", text: "#ffffff" },
  };

  // Build sessions by date lookup
  const sessionsByDate = new Map<string, Session[]>();
  sessions.forEach((s) => {
    const list = sessionsByDate.get(s.date) || [];
    list.push(s);
    sessionsByDate.set(s.date, list);
  });

  // Build exams by date lookup
  const examsByDate = new Map<string, Exam[]>();
  exams.forEach((e) => {
    const list = examsByDate.get(e.date) || [];
    list.push(e);
    examsByDate.set(e.date, list);
  });

  // Month navigation
  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  // Days in month calculation (UTC based to prevent timezone shift)
  const firstDayOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
  // Convert Sunday=0 to Monday=0..Sunday=6
  const startingDayIndex = (firstDayOfMonth.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();

  // Exams for the current month view
  const currentMonthExams = exams.filter((e) => {
    const [y, m] = e.date.split("-").map(Number);
    return y === currentYear && m === currentMonth + 1;
  });

  // Selected day data
  const selectedDaySessions = (sessionsByDate.get(selectedDate) || []).map((s) => ({
    ...s,
    progress: progressMap[s.id],
  }));
  const selectedDayExams = examsByDate.get(selectedDate) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Calendar Grid Section */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white border border-border rounded-3xl p-5 md:p-6 shadow-sm">
          {/* Month Header & Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Mes anterior"
                className="p-2 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Mes siguiente"
                className="p-2 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-foreground transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-xs font-bold text-muted-foreground">
            {weekdays.map((w, idx) => (
              <div key={idx} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: startingDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[72px] md:min-h-[84px] opacity-20" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
                dayNum
              ).padStart(2, "0")}`;
              const daySessions = sessionsByDate.get(dateStr) || [];
              const dayExams = examsByDate.get(dateStr) || [];
              const isSelected = selectedDate === dateStr;
              const hasExams = dayExams.length > 0;

              const isAllCompleted =
                daySessions.length > 0 &&
                daySessions.every((s) => progressMap[s.id]?.status === "completed");

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  aria-pressed={isSelected}
                  className={`min-h-[72px] md:min-h-[84px] p-1.5 md:p-2 rounded-xl border text-left flex flex-col justify-between transition relative ${
                    isSelected
                      ? "bg-[#e9f0ff] border-2 border-[#2776db] shadow-sm"
                      : "bg-[#f7f9fc] border-transparent hover:bg-[#eaf0fa] hover:-translate-y-0.5"
                  } ${hasExams ? "shadow-[inset_0_-4px_#e4a134]" : ""}`}
                >
                  {/* Top row: day number & status check */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs md:text-sm font-bold ${
                        isSelected ? "text-[#2776db]" : "text-foreground"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isAllCompleted && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Subject Codes Badges */}
                  <div className="flex flex-wrap gap-1 mt-1 justify-center">
                    {daySessions.map((ses, sIdx) => {
                      const badge = subjectBadges[ses.subject_id] || {
                        code: "?",
                        bg: "#64718a",
                        text: "#fff",
                      };
                      return (
                        <span
                          key={sIdx}
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                          className="text-[10px] md:text-[11px] font-extrabold px-1.5 py-0.2 rounded leading-tight shadow-2xs"
                        >
                          {badge.code}
                        </span>
                      );
                    })}
                  </div>

                  {/* Bottom indicator for exam */}
                  {hasExams && (
                    <div className="text-[10px] font-extrabold text-amber-700 truncate w-full text-center">
                      ★ {dayExams[0].kind === "practical" ? "Práctico" : "Final"}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Month exams footer */}
          {currentMonthExams.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Evaluaciones de {monthNames[currentMonth]}:
              </span>
              {currentMonthExams.map((ex) => (
                <div
                  key={ex.id}
                  className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                >
                  <span className="text-amber-500">★</span>
                  <span>
                    {ex.date.slice(8, 10)}/{ex.date.slice(5, 7)} · {ex.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informative Note */}
        <div className="bg-white border border-border rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground block mb-1">
            Borrador de carga y secuencia:
          </strong>
          Carga estimada de 4 h 30 netas por día, domingos de 2 h y carga reducida los días de examen. Anatomía utiliza el bolillero de 25 bolillas y la guía de miembro inferior.
        </div>
      </div>

      {/* Side Day Detail Section */}
      <div className="lg:col-span-5 sticky top-6">
        <DayDetail
          date={selectedDate}
          formattedDate={formatSpanishDate(selectedDate, { includeYear: true })}
          exams={selectedDayExams}
          sessions={selectedDaySessions}
          onProgressUpdated={() => {
            // Can trigger data revalidation
          }}
        />
      </div>
    </div>
  );
}
