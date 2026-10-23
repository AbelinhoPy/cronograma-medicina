import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

dotenv.config({ path: ".env.local" });
dotenv.config();

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        params[key] = args[i + 1];
        i++;
      } else {
        params[key] = true;
      }
    }
  }
  return params;
}

function extractDriveId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed;
}

function getSubjectCategory(subject: string): string {
  switch (subject.toLowerCase()) {
    case "anatomia":
      return "01 Anatomía/Resúmenes de Abel";
    case "biologia":
      return "02 Biología/Resúmenes";
    case "histologia":
      return "03 Histología y Embriología/Resúmenes";
    case "biofisica":
      return "05 Biofísica/Resúmenes";
    case "bioestadistica":
      return "04 Bioestadística/Resúmenes";
    default:
      return "Resúmenes y apuntes";
  }
}

async function main() {
  const args = parseArgs();

  if (args.help || (!args.drive && !args.title)) {
    console.log(`
========================================================================
⚡ SYNC MATERIAL — Cronograma de Medicina de Yanina
========================================================================
Uso rápido en una sola línea:
  npx tsx src/scripts/sync-material.ts [opciones]

Parámetros requeridos:
  --title "<nombre>"      Título del documento o apunte (ej: "Resumen Pelvis Abel")
  --drive "<url_o_id>"    Enlace de Google Drive o ID del archivo

Parámetros opcionales del material:
  --subject "<materia>"   anatomia | histologia | biologia | biofisica | bioestadistica (def: anatomia)
  --pages <numero>        Cantidad de páginas físicas del PDF (def: 1)
  --category "<carpeta>"  Ruta de categoría en Drive (def: según materia)
  --notes "<notas>"       Observaciones para Yanina

Vinculación directa a sesión (Opcional):
  --session "<id>"        ID de la sesión (ej: "session_2026-10-24_1")
  --date "YYYY-MM-DD"     Fecha de la sesión (ej: "2026-10-24")
  --block <1|2|3>         Número de bloque del día (1, 2 o 3)
  --range "X-Y"           Rango de páginas para esa sesión (ej: "25-28" o "34")
  --instructions "<txt>"  Nueva indicación para la sesión (reemplaza o complementa)

Despliegue automático a producción:
  --deploy                Ejecuta git add, git commit y git push origin main
                          para que Vercel actualice en vivo automáticamente.

Ejemplo completo:
  npx tsx src/scripts/sync-material.ts --title "Guia_Cardiovascular" --drive "https://drive.google.com/file/d/1abcXYZ/view" --subject histologia --pages 24 --date "2026-11-06" --block 2 --range "1-12" --deploy
========================================================================
    `);
    process.exit(0);
  }

  const rawTitle = String(args.title || "Nuevo Documento");
  const title = rawTitle.endsWith(".pdf") ? rawTitle : `${rawTitle}.pdf`;
  const driveFileId = extractDriveId(String(args.drive || ""));
  if (!driveFileId) {
    console.error("❌ Error: Se requiere el parámetro --drive con el enlace o ID de Drive.");
    process.exit(1);
  }

  const subjectId = String(args.subject || "anatomia").toLowerCase();
  const pageCount = Number(args.pages) || 1;
  const sizeBytes = args.bytes || args.size ? Number(args.bytes || args.size) : undefined;
  const categoryPath = String(args.category || getSubjectCategory(subjectId));
  const notes = args.notes ? String(args.notes) : undefined;
  const shouldDeploy = Boolean(args.deploy);

  const docId = `material_${driveFileId}`;
  const viewUrl = `https://drive.google.com/file/d/${driveFileId}/view?usp=drivesdk`;

  console.log(`\n⏳ Procesando material: ${title}`);
  console.log(`   Drive File ID: ${driveFileId}`);
  console.log(`   Materia: ${subjectId} | Páginas: ${pageCount}${sizeBytes ? ` | Tamaño: ${sizeBytes} bytes` : ""}`);

  // 1. Neon Database Update
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL no encontrada en el entorno.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    // Insert or update document
    await pool.query(
      `INSERT INTO documents (
        id, title, subject_id, category_path, provider, drive_file_id,
        view_url, size_bytes, page_count, is_duplicate, needs_curriculum_confirmation, is_available, notes
      ) VALUES ($1, $2, $3, $4, 'google_drive', $5, $6, COALESCE($7, 1048576), $8, false, false, true, $9)
      ON CONFLICT (drive_file_id) DO UPDATE SET
        title = EXCLUDED.title,
        subject_id = EXCLUDED.subject_id,
        category_path = EXCLUDED.category_path,
        view_url = EXCLUDED.view_url,
        size_bytes = COALESCE(NULLIF(EXCLUDED.size_bytes, 1048576), documents.size_bytes, EXCLUDED.size_bytes),
        page_count = EXCLUDED.page_count,
        notes = EXCLUDED.notes,
        is_available = true`,
      [docId, title, subjectId, categoryPath, driveFileId, viewUrl, sizeBytes || null, pageCount, notes || null]
    );
    console.log("✅ Documento guardado en Neon PostgreSQL.");

    // 2. Link to Session if requested
    let targetSessionId = args.session ? String(args.session) : null;
    if (!targetSessionId && args.date && args.block) {
      const sessQuery = await pool.query(
        `SELECT id FROM sessions WHERE date = $1 AND "order" = $2 LIMIT 1`,
        [String(args.date), Number(args.block)]
      );
      if (sessQuery.rows.length > 0) {
        targetSessionId = sessQuery.rows[0].id;
      } else {
        console.warn(`⚠️ No se encontró sesión para fecha ${args.date} bloque ${args.block}.`);
      }
    }

    let pageStart: number | undefined;
    let pageEnd: number | undefined;
    if (args.range) {
      const rangeParts = String(args.range).split("-").map((n) => Number(n.trim()));
      pageStart = rangeParts[0];
      pageEnd = rangeParts.length > 1 ? rangeParts[1] : rangeParts[0];
    }

    if (targetSessionId) {
      const sdocId = `sdoc_${targetSessionId}_${driveFileId.slice(0, 8)}`;
      await pool.query(
        `INSERT INTO session_documents (id, session_id, document_id, source_filename, page_start, page_end, page_basis, mapping_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'physical_pdf_pages', 'verified')
         ON CONFLICT (id) DO UPDATE SET
           document_id = EXCLUDED.document_id,
           source_filename = EXCLUDED.source_filename,
           page_start = EXCLUDED.page_start,
           page_end = EXCLUDED.page_end,
           mapping_status = EXCLUDED.mapping_status`,
        [sdocId, targetSessionId, docId, title, pageStart || null, pageEnd || null]
      );

      // Update instructions or mark needs_material_mapping = false
      if (args.instructions) {
        await pool.query(
          `UPDATE sessions SET instructions = $1, needs_material_mapping = false WHERE id = $2`,
          [String(args.instructions), targetSessionId]
        );
      } else {
        await pool.query(
          `UPDATE sessions SET needs_material_mapping = false WHERE id = $2`,
          [targetSessionId]
        );
      }
      console.log(`✅ Vinculado a la sesión ${targetSessionId} (pp. ${pageStart ?? 1}–${pageEnd ?? pageCount}).`);
    }

    // 3. Update materiales.drive.json
    const materialesPath = path.join(process.cwd(), "materiales.drive.json");
    if (fs.existsSync(materialesPath)) {
      const rawMat = JSON.parse(fs.readFileSync(materialesPath, "utf-8"));
      const existingIdx = rawMat.files.findIndex((f: any) => f.drive_file_id === driveFileId);
      const docEntry = {
        id: docId,
        title,
        subject_id: subjectId,
        category_path: categoryPath,
        provider: "google_drive",
        drive_file_id: driveFileId,
        view_url: viewUrl,
        size_bytes: sizeBytes || rawMat.files[existingIdx]?.size_bytes || 1024 * 1024,
        page_count: pageCount,
        is_duplicate: false,
        canonical_drive_file_id: null,
        needs_curriculum_confirmation: false,
        notes,
      };

      if (existingIdx >= 0) {
        rawMat.files[existingIdx] = { ...rawMat.files[existingIdx], ...docEntry };
      } else {
        rawMat.files.push(docEntry);
      }
      rawMat.count = rawMat.files.length;
      rawMat.canonical_count = rawMat.files.filter((f: any) => !f.is_duplicate).length;
      fs.writeFileSync(materialesPath, JSON.stringify(rawMat, null, 2), "utf-8");
      console.log(`✅ Archivo materiales.drive.json actualizado (total: ${rawMat.count}).`);
    }

    // 4. Update cronograma.seed.json if session was linked
    if (targetSessionId) {
      const seedPath = path.join(process.cwd(), "cronograma.seed.json");
      if (fs.existsSync(seedPath)) {
        const rawSeed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
        const session = rawSeed.sessions.find((s: any) => s.id === targetSessionId);
        if (session) {
          if (args.instructions) session.instructions = String(args.instructions);
          session.needs_material_mapping = false;
          if (!session.material_refs) session.material_refs = [];
          
          const existingRefIdx = session.material_refs.findIndex((r: any) => r.drive_file_id === driveFileId);
          const refEntry = {
            source_filename: title,
            page_start: pageStart,
            page_end: pageEnd,
            page_basis: "physical_pdf_pages",
            mapping_status: "verified",
            material_id: docId,
            drive_file_id: driveFileId,
            view_url: viewUrl,
          };
          if (existingRefIdx >= 0) {
            session.material_refs[existingRefIdx] = refEntry;
          } else {
            session.material_refs.push(refEntry);
          }
          fs.writeFileSync(seedPath, JSON.stringify(rawSeed, null, 2), "utf-8");
          console.log(`✅ Archivo cronograma.seed.json actualizado.`);
        }
      }
    }

    // 5. Automatic Git & Vercel Deploy if --deploy is passed
    if (shouldDeploy) {
      console.log("\n🚀 Desplegando cambios a GitHub y Vercel...");
      execSync("git add materiales.drive.json cronograma.seed.json", { stdio: "inherit" });
      execSync(`git commit -m "feat: agregar material ${title}"`, { stdio: "inherit" });
      execSync("git push origin main", { stdio: "inherit" });
      console.log("✅ Cambios subidos a GitHub. Vercel desplegará automáticamente la nueva versión.");
    } else {
      console.log("\n💡 Tip: Para subir y desplegar automáticamente en Vercel, agrega el flag --deploy.");
    }

    console.log(`
========================================================================
🎉 OPERACIÓN COMPLETADA CON ÉXITO
------------------------------------------------------------------------
Documento: ${title}
Drive URL: ${viewUrl}
Materia:   ${subjectId} (${pageCount} páginas)
${targetSessionId ? `Sesión:    ${targetSessionId} (pp. ${pageStart ?? 1}–${pageEnd ?? pageCount})` : "Sesión:    No vinculado a sesión específica (disponible en /biblioteca)"}
========================================================================
    `);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
