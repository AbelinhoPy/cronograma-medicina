import { NextRequest, NextResponse } from "next/server";
import { rescheduleSession } from "@/lib/data";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (process.env.ADMIN_EMAILS && role && role !== "admin") {
      return NextResponse.json(
        { error: "Acceso no autorizado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sessionId, newDate } = body;

    if (!sessionId || !newDate) {
      return NextResponse.json(
        { error: "Faltan parámetros: sessionId y newDate son obligatorios." },
        { status: 400 }
      );
    }

    const result = await rescheduleSession(
      sessionId,
      newDate,
      session?.user?.email || "abel"
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error al reprogramar sesión:", error);
    return NextResponse.json(
      { error: "Error en el servidor al reprogramar la sesión.", details: error.message },
      { status: 500 }
    );
  }
}
