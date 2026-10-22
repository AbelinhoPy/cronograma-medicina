import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { addNewDocument, linkDocumentToSession } from "@/lib/data";
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
      session_id,
      session_date,
      session_block,
      page_start,
      page_end,
      instructions,
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

    if (session_id || (session_date && session_block)) {
      await linkDocumentToSession({
        sessionId: session_id,
        sessionDate: session_date,
        sessionBlock: session_block ? Number(session_block) : undefined,
        documentId: doc.id,
        sourceFilename: doc.title,
        pageStart: page_start ? Number(page_start) : undefined,
        pageEnd: page_end ? Number(page_end) : undefined,
        instructions: instructions ? String(instructions) : undefined,
      });
    }

    revalidatePath("/biblioteca");
    revalidatePath("/admin");
    revalidatePath("/avance");
    revalidatePath("/calendario");
    revalidatePath("/");

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error("Error en POST /api/admin/documents:", error);
    return NextResponse.json(
      { error: "Error al agregar el nuevo documento.", details: error.message },
      { status: 500 }
    );
  }
}
