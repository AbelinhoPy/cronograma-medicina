import { NextRequest, NextResponse } from "next/server";
import { addNewDocument } from "@/lib/data";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Allow if user is admin or if running in local environment without strict auth
    const role = (session?.user as any)?.role;
    if (process.env.ADMIN_EMAILS && role && role !== "admin") {
      return NextResponse.json(
        { error: "Acceso no autorizado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      subject_id,
      category_path,
      drive_url_or_id,
      page_count,
      size_bytes,
      notes,
    } = body;

    if (!title || !subject_id || !drive_url_or_id || !page_count) {
      return NextResponse.json(
        {
          error:
            "Campos requeridos faltantes: título, materia, enlace de Drive y cantidad de páginas.",
        },
        { status: 400 }
      );
    }

    const doc = await addNewDocument({
      title,
      subject_id,
      category_path: category_path || "Resúmenes y apuntes",
      drive_url_or_id,
      page_count: Number(page_count),
      size_bytes: size_bytes ? Number(size_bytes) : undefined,
      notes,
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error("Error en POST /api/admin/documents:", error);
    return NextResponse.json(
      { error: "Error al agregar el nuevo documento.", details: error.message },
      { status: 500 }
    );
  }
}
