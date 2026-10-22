"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  BookOpen,
  RotateCcw,
  Check,
} from "lucide-react";
import { Session, StudentProgress, Exam } from "@/lib/types";

interface DayDetailProps {
  date: string;
  formattedDate: string;
  exams: Exam[];
  sessions: (Session & { progress?: StudentProgress })[];
  onProgressUpdated?: () => void;
}

export function DayDetail({
  date,
  formattedDate,
  exams,
  sessions,
  onProgressUpdated,
}: DayDetailProps) {
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reschedulingSessionId, setReschedulingSessionId] = useState<string | null>(null);
  const [targetNewDate, setTargetNewDate] = useState<string>("");

  const subjectBorderColors: Record<string, string> = {
    anatomia: "#2776db",
    histologia: "#8651cf",
    biologia: "#169477",
    biofisica: "#d18a13",
    bioestadistica: "#64718a",
  };

  const subjectBgPills: Record<string, string> = {
    anatomia: "bg-[#2776db]/10 text-[#2776db]",
    histologia: "bg-[#8651cf]/10 text-[#8651cf]",
    biologia: "bg-[#169477]/10 text-[#169477]",
    biofisica: "bg-[#d18a13]/10 text-[#d18a13]",
    bioestadistica: "bg-[#64718a]/10 text-[#64718a]",
  };

  async function handleUpdateStatus(
    session: Session & { progress?: StudentProgress },
    newStatus: "pending" | "in_progress" | "completed"
  ) {
    setLoadingSessionId(session.id);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          status: newStatus,
          difficulty_hard: session.progress?.difficulty_hard ?? false,
          notes: session.progress?.notes,
          actual_minutes:
            session.progress?.actual_minutes ?? (newStatus === "completed" ? session.duration_minutes : undefined),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el estado.");
      }

      onProgressUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Error de red al actualizar progreso.");
    } finally {
      setLoadingSessionId(null);
    }
  }

  async function handleToggleHard(
    session: Session & { progress?: StudentProgress }
  ) {
    setLoadingSessionId(session.id);
    setErrorMessage(null);

    const newHard = !(session.progress?.difficulty_hard ?? false);

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          status: session.progress?.status ?? "pending",
          difficulty_hard: newHard,
          notes: session.progress?.notes,
          actual_minutes: session.progress?.actual_minutes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar dificultad.");
      }

      onProgressUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al guardar la dificultad.");
    } finally {
      setLoadingSessionId(null);
    }
  }

  async function handleConfirmReschedule(sessionId: string) {
    if (!targetNewDate) return;
    setLoadingSessionId(sessionId);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          newDate: targetNewDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al reprogramar la sesión.");
      }

      setReschedulingSessionId(null);
      setTargetNewDate("");
      onProgressUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo reprogramar la sesión.");
    } finally {
      setLoadingSessionId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Detalle del día seleccionado
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground capitalize mt-0.5">
              {formattedDate}
            </h2>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
            {sessions.length} {sessions.length === 1 ? "bloque" : "bloques"} ·{" "}
            {sessions.reduce((acc, s) => acc + s.duration_minutes, 0)} min
          </span>
        </div>

        {/* Exam Alert if any */}
        {exams.length > 0 && (
          <div className="mt-4 space-y-2">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="bg-exam-badge text-exam-text border border-exam-border rounded-xl p-3 text-sm font-bold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-600 flex-none" />
                <span>★ Evaluación: {ex.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-none" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-white border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-muted-foreground/60" />
          <p className="font-semibold text-foreground">
            Día de descanso o sin bloques asignados
          </p>
          <p className="text-xs max-w-sm mx-auto">
            Aprovecha para revisar temas que te hayan costado o hacer una pausa activa para recargar energías.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, idx) => {
            const isCompleted = session.progress?.status === "completed";
            const isInProgress = session.progress?.status === "in_progress";
            const isHard = session.progress?.difficulty_hard ?? false;
            const borderColor = subjectBorderColors[session.subject_id] || "#2776db";
            const pillClass = subjectBgPills[session.subject_id] || "bg-blue-100 text-blue-700";

            return (
              <div
                key={session.id}
                style={{ borderLeftColor: borderColor }}
                className={`bg-white border border-border border-l-4 rounded-2xl p-5 shadow-sm transition-all ${
                  isCompleted ? "bg-[#f8fbf9]" : ""
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      Bloque #{session.order || idx + 1}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${pillClass}`}>
                      {session.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{session.duration_minutes} min planificados</span>
                    {session.progress?.actual_minutes && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        ({session.progress.actual_minutes} min reales)
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <p className="text-sm font-semibold text-foreground leading-relaxed mb-3">
                  {session.instructions}
                </p>

                {/* Linked Documents / PDFs */}
                {session.material_refs && session.material_refs.length > 0 ? (
                  <div className="bg-[#f7f9fc] border border-border/80 rounded-xl p-3 mb-4 space-y-2">
                    <span className="text-xs font-bold text-muted-foreground block">
                      Materiales de estudio y lectura:
                    </span>
                    {session.material_refs.map((ref, rIdx) => {
                      const hasDriveUrl = Boolean(ref.view_url);
                      return (
                        <div
                          key={rIdx}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen className="w-3.5 h-3.5 text-[#2776db] flex-none" />
                            <span className="font-semibold text-slate-800 truncate">
                              {ref.source_filename}
                            </span>
                            {ref.page_start && ref.page_end && (
                              <span className="bg-white border border-border px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                                {ref.page_start === ref.page_end
                                  ? `p. ${ref.page_start}`
                                  : `pp. ${ref.page_start}–${ref.page_end}`}
                              </span>
                            )}
                          </div>

                          {hasDriveUrl ? (
                            <a
                              href={ref.view_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#2776db] hover:underline font-bold text-xs bg-white border border-[#2776db]/20 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                            >
                              <span>Abrir en Drive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                              Vínculo pendiente de revisión
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mb-3 italic">
                    Sin material PDF específico vinculado.
                  </div>
                )}

                {/* Actions Row */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  {/* Status buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      disabled={loadingSessionId === session.id}
                      onClick={() => handleUpdateStatus(session, "pending")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        !isCompleted && !isInProgress
                          ? "bg-slate-200 text-slate-800"
                          : "text-muted-foreground hover:bg-slate-100"
                      }`}
                    >
                      Pendiente
                    </button>
                    <button
                      type="button"
                      disabled={loadingSessionId === session.id}
                      onClick={() => handleUpdateStatus(session, "in_progress")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        isInProgress
                          ? "bg-amber-500 text-white shadow-sm"
                          : "text-muted-foreground hover:bg-slate-100"
                      }`}
                    >
                      En curso
                    </button>
                    <button
                      type="button"
                      disabled={loadingSessionId === session.id}
                      onClick={() => handleUpdateStatus(session, "completed")}
                      className={`px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 transition ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-muted-foreground hover:bg-slate-100"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Completada</span>
                    </button>
                  </div>

                  {/* Difficulty & Reprogramming */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      disabled={loadingSessionId === session.id}
                      onClick={() => handleToggleHard(session)}
                      aria-pressed={isHard}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                        isHard
                          ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                          : "border-border text-muted-foreground hover:bg-slate-50"
                      }`}
                      title="Genera repasos a 1, 3 y 7 días"
                    >
                      {isHard ? "★ Me costó (Repasos activos)" : "Me costó"}
                    </button>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() =>
                          setReschedulingSessionId(
                            reschedulingSessionId === session.id ? null : session.id
                          )
                        }
                        className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg hover:bg-slate-100 transition inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reprogramar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Reschedule confirmation box */}
                {reschedulingSessionId === session.id && (
                  <div className="mt-3 bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
                    <p className="font-bold text-amber-900">
                      Reprogramar esta sesión sin sobrecargar exámenes:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={targetNewDate}
                        onChange={(e) => setTargetNewDate(e.target.value)}
                        className="px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs bg-white text-slate-900"
                      />
                      <button
                        type="button"
                        disabled={!targetNewDate || loadingSessionId === session.id}
                        onClick={() => handleConfirmReschedule(session.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
                      >
                        Confirmar reprogramación
                      </button>
                      <button
                        type="button"
                        onClick={() => setReschedulingSessionId(null)}
                        className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
