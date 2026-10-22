export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getDayPlan } from "@/lib/data";
import { getTodayAsuncion, formatSpanishDate } from "@/lib/date-utils";
import { DayDetail } from "@/components/DayDetail";
import Link from "next/link";
import { CalendarRange, Sparkles, BookOpen } from "lucide-react";

interface PageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const todayAsuncion = getTodayAsuncion();

  // If today is outside plan start/end, default to 2026-10-21 (Start of plan: Miembro inferior)
  const defaultDate =
    todayAsuncion >= "2026-10-21" && todayAsuncion <= "2026-12-07"
      ? todayAsuncion
      : "2026-10-21";

  const targetDate = resolvedParams.date || defaultDate;
  const dayPlan = await getDayPlan(targetDate, "yanina");
  const formattedDate = formatSpanishDate(targetDate, { includeYear: true });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Today Session Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* Date Selector Navigation Bar */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="text-muted-foreground">Viendo fecha:</span>
            <span className="text-base text-[#2776db]">{targetDate}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/?date=2026-10-21"
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                targetDate === "2026-10-21"
                  ? "bg-[#2776db] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              21/10 (Miembro Inferior)
            </Link>
            <Link
              href="/?date=2026-10-26"
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                targetDate === "2026-10-26"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              26/10 (Práctico Biofísica)
            </Link>
            <Link
              href="/calendario"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground font-semibold"
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Ver calendario completo</span>
            </Link>
          </div>
        </div>

        {/* Day Detail Component */}
        <DayDetail
          date={targetDate}
          formattedDate={formattedDate}
          exams={dayPlan.exams}
          sessions={dayPlan.sessions}
        />
      </div>

      {/* Side Phases & Routine Guide Column */}
      <div className="lg:col-span-4 space-y-4">
        {/* Academic Focus Card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8651cf]" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              El foco cambia con vos
            </h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 bg-[#f8fafc] rounded-xl border border-border">
              <strong className="block text-slate-900 font-bold mb-0.5">
                21 oct — 5 nov
              </strong>
              Miembro inferior por regiones hasta el 03/11; Biofísica y Biología cerca de sus fechas. Anatomía e Histología avanzan en paralelo.
            </div>

            <div className="p-3 bg-[#f8fafc] rounded-xl border border-border">
              <strong className="block text-slate-900 font-bold mb-0.5">
                6 — 18 nov
              </strong>
              Histología práctica al frente con su teoría; primera vuelta de las 25 bolillas de Anatomía hasta el 21/11.
            </div>

            <div className="p-3 bg-[#f8fafc] rounded-xl border border-border">
              <strong className="block text-slate-900 font-bold mb-0.5">
                19 nov — 1 dic
              </strong>
              Cerrar pendientes y simular el práctico. Del 26 al 30/11: segunda vuelta oral de las 25 bolillas.
            </div>

            <div className="p-3 bg-[#f8fafc] rounded-xl border border-border">
              <strong className="block text-slate-900 font-bold mb-0.5">
                2 — 7 dic
              </strong>
              Recta final de Histología para integrar y simular diagnósticos de preparados al microscopio.
            </div>
          </div>
        </div>

        {/* Sustainable Routine Advice */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#169477]" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Una rutina que se pueda sostener
            </h3>
          </div>

          <ul className="space-y-2 text-muted-foreground list-disc pl-4 font-medium">
            <li>Pausas de 15–20 min entre bloques. Dividí cada bloque de 90 min si lo necesitás.</li>
            <li>Cerrá con preguntas sin apuntes y una lista corta de errores.</li>
            <li>Si un día queda pendiente, priorizá el próximo examen y usá el domingo para recuperar.</li>
            <li>La noche anterior al examen: repaso breve y descanso; no agregues temas nuevos.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
