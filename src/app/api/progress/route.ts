import { NextRequest, NextResponse } from "next/server";
import { updateSessionProgress, getDayPlan } from "@/lib/data";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const session = await auth();

    const userId = session?.user?.email || "yanina";

    if (!date) {
      return NextResponse.json({ error: "Falta el parámetro de fecha (date)" }, { status: 400 });
    }

    const plan = await getDayPlan(date, userId);
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Error en GET /api/progress:", error);
    return NextResponse.json(
      { error: "Error al obtener el plan del día", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Default to 'yanina' if demo mode, else authenticated user's email
    const userId = session?.user?.email || "yanina";

    const body = await request.json();
    const { sessionId, status, difficulty_hard, notes, actual_minutes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Falta sessionId" }, { status: 400 });
    }

    const updated = await updateSessionProgress(userId, sessionId, {
      status,
      difficulty_hard,
      notes,
      actual_minutes,
    });

    return NextResponse.json({ success: true, progress: updated });
  } catch (error: any) {
    console.error("Error en POST /api/progress:", error);
    return NextResponse.json(
      {
        error: "No se pudo guardar el progreso. Verifica la conexión a la base de datos.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
