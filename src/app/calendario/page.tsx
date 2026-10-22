export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllExams, getAllSessions, getStudentProgressForUser } from "@/lib/data";
import { CalendarView } from "@/components/CalendarView";

interface CalendarPageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const [exams, sessions, progressMapObj] = await Promise.all([
    getAllExams(),
    getAllSessions(),
    getStudentProgressForUser("yanina"),
  ]);

  const progressRecord: Record<string, any> = {};
  for (const [key, val] of progressMapObj.entries()) {
    progressRecord[key] = val;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Planificación General
        </span>
        <h2 className="text-2xl font-extrabold text-foreground mt-0.5">
          Calendario Interactivo de Sesiones y Exámenes
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Navega entre los meses de estudio. Las estrellas doradas (★) indican evaluaciones y las tildes (✓) señalan los días completados al 100%.
        </p>
      </div>

      <CalendarView
        initialDate={resolvedParams.date || "2026-10-21"}
        exams={exams}
        sessions={sessions}
        progressMap={progressRecord}
      />
    </div>
  );
}
