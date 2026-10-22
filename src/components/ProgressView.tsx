"use client";

import React from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Session, StudentProgress, ScheduleReview, SubjectId } from "@/lib/types";

interface ProgressViewProps {
  sessions: Session[];
  progressMap: Record<string, StudentProgress>;
  reviews: ScheduleReview[];
}

export function ProgressView({ sessions, progressMap, reviews }: ProgressViewProps) {
  const totalSessions = sessions.length;
  const completedSessions = Object.values(progressMap).filter(
    (p) => p.status === "completed"
  ).length;

  const totalPlannedMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalActualMinutes = Object.values(progressMap).reduce(
    (acc, p) => acc + (p.actual_minutes || 0),
    0
  );

  const hardSessionsCount = Object.values(progressMap).filter(
    (p) => p.difficulty_hard
  ).length;

  // Breakdown by subject
  const subjects: Array<{ id: SubjectId; name: string; color: string }> = [
    { id: "anatomia", name: "Anatomía", color: "#2776db" },
    { id: "histologia", name: "Histología y Embriología", color: "#8651cf" },
    { id: "biologia", name: "Biología", color: "#169477" },
    { id: "biofisica", name: "Biofísica", color: "#d18a13" },
  ];

  const overallPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Métricas de estudio · Yanina
        </span>
        <h2 className="text-2xl font-extrabold text-foreground mt-0.5">
          Mi Avance y Repasos Programados
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Seguimiento del cronograma, tiempo invertido y consolidación del bolillero y preparados.
        </p>

        {/* Big Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-foreground">
              Progreso global: {completedSessions} de {totalSessions} bloques completados
            </span>
            <span className="text-[#169477] text-sm">{overallPercent}%</span>
          </div>
          <div className="h-3 w-full bg-[#e8edf4] rounded-full overflow-hidden">
            <div
              style={{ width: `${overallPercent}%` }}
              className="h-full bg-[#169477] transition-all duration-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Bloques listos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{completedSessions}</div>
          <p className="text-xs text-muted-foreground">
            {totalSessions - completedSessions} pendientes en el cronograma
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Tiempo planificado</span>
            <Clock className="w-4 h-4 text-[#2776db]" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">
            {(totalPlannedMinutes / 60).toFixed(1)} h
          </div>
          <p className="text-xs text-muted-foreground">{totalPlannedMinutes} minutos totales</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Tiempo registrado</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">
            {(totalActualMinutes / 60).toFixed(1)} h
          </div>
          <p className="text-xs text-muted-foreground">
            {totalActualMinutes} minutos netos estudiados
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Temas complejos</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{hardSessionsCount}</div>
          <p className="text-xs text-muted-foreground">
            Marcados con «Me costó» para repaso
          </p>
        </div>
      </div>

      {/* Progress by Subject */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-foreground">
          Avance detallado por materia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const subSessions = sessions.filter((s) => s.subject_id === sub.id);
            const subCompleted = subSessions.filter(
              (s) => progressMap[s.id]?.status === "completed"
            ).length;
            const pct = subSessions.length > 0 ? Math.round((subCompleted / subSessions.length) * 100) : 0;

            return (
              <div
                key={sub.id}
                style={{ borderLeftColor: sub.color }}
                className="p-4 rounded-2xl border border-border border-l-4 bg-[#fbfcfd] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{sub.name}</span>
                  <span className="text-xs font-extrabold text-muted-foreground">
                    {subCompleted} / {subSessions.length} ({pct}%)
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: sub.color }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spaced Reviews Table */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-foreground">
              Repasos Espaciados Activos (1, 3 y 7 días)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Programados automáticamente al marcar una sesión con «Me costó».
            </p>
          </div>
          <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200">
            {reviews.length} repasos
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-2xl">
            No tienes repasos pendientes aún. Al marcar «Me costó» en una sesión de estudio, el sistema propondrá repasos espaciados a 1, 3 y 7 días para asegurar el tema.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-[#f8fafc] text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold bg-white border border-border px-2.5 py-1 rounded-lg text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{rev.review_date}</span>
                  </span>
                  <div>
                    <strong className="text-foreground block font-bold">
                      {rev.session_title || `Repaso a los ${rev.interval_days} días`}
                    </strong>
                    <span className="text-muted-foreground text-[11px]">
                      Intervalo de {rev.interval_days} {rev.interval_days === 1 ? "día" : "días"}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                    rev.completed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {rev.completed ? "✓ Consolidado" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
