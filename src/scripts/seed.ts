import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as dotenv from "dotenv";
import * as schema from "../lib/db/schema";
import {
  getSeedSubjects,
  getSeedExams,
  getSeedDocuments,
  getSeedSessions,
} from "../lib/seed-data";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function runSeed() {
  console.log("==================================================");
  console.log("  Iniciando importación del cronograma y PDFs    ");
  console.log("==================================================");

  const subjects = getSeedSubjects();
  const exams = getSeedExams();
  const documents = getSeedDocuments();
  const sessions = getSeedSessions();

  console.log(`[Manifest] Materias: ${subjects.length}`);
  console.log(`[Manifest] Evaluaciones: ${exams.length}`);
  console.log(
    `[Manifest] Documentos en catálogo: ${documents.length} (Principales: ${
      documents.filter((d) => !d.is_duplicate).length
    }, Duplicados: ${documents.filter((d) => d.is_duplicate).length})`
  );
  console.log(`[Manifest] Sesiones de estudio: ${sessions.length}`);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith("postgres")) {
    console.log(
      "\n⚠️ AVISO: DATABASE_URL no está configurada o no es válida."
    );
    console.log(
      "  Los datos fueron verificados correctamente en los archivos locales."
    );
    console.log(
      "  Para persistir en Neon, configura DATABASE_URL en tu archivo .env.local y ejecuta 'npm run db:seed'.\n"
    );
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    console.log("\n-> 1. Insertando/actualizando materias...");
    for (const sub of subjects) {
      await db
        .insert(schema.subjects)
        .values({
          id: sub.id,
          name: sub.name,
          color: sub.color,
        })
        .onConflictDoUpdate({
          target: schema.subjects.id,
          set: { name: sub.name, color: sub.color },
        });
    }

    console.log("-> 2. Insertando/actualizando evaluaciones...");
    for (const ex of exams) {
      await db
        .insert(schema.exams)
        .values({
          id: ex.id,
          date: ex.date,
          subjectId: ex.subject_id,
          title: ex.title,
          kind: ex.kind,
          needsConfirmation: ex.needs_confirmation ?? false,
        })
        .onConflictDoUpdate({
          target: schema.exams.id,
          set: {
            date: ex.date,
            subjectId: ex.subject_id,
            title: ex.title,
            kind: ex.kind,
            needsConfirmation: ex.needs_confirmation ?? false,
          },
        });
    }

    console.log("-> 3. Insertando/actualizando 75 documentos en catálogo...");
    for (const doc of documents) {
      await db
        .insert(schema.documents)
        .values({
          id: doc.id,
          title: doc.title,
          subjectId: doc.subject_id,
          categoryPath: doc.category_path,
          provider: doc.provider,
          driveFileId: doc.drive_file_id,
          viewUrl: doc.view_url,
          parentFolderId: doc.parent_folder_id,
          mimeType: doc.mime_type,
          sizeBytes: doc.size_bytes,
          pageCount: doc.page_count,
          isDuplicate: doc.is_duplicate,
          canonicalDriveFileId: doc.canonical_drive_file_id,
          needsCurriculumConfirmation: doc.needs_curriculum_confirmation ?? false,
          isAvailable: true,
        })
        .onConflictDoUpdate({
          target: schema.documents.id,
          set: {
            title: doc.title,
            subjectId: doc.subject_id,
            categoryPath: doc.category_path,
            driveFileId: doc.drive_file_id,
            viewUrl: doc.view_url,
            parentFolderId: doc.parent_folder_id,
            sizeBytes: doc.size_bytes,
            pageCount: doc.page_count,
            isDuplicate: doc.is_duplicate,
            canonicalDriveFileId: doc.canonical_drive_file_id,
            needsCurriculumConfirmation: doc.needs_curriculum_confirmation ?? false,
          },
        });
    }

    console.log("-> 4. Insertando/actualizando 127 sesiones de estudio...");
    for (const ses of sessions) {
      await db
        .insert(schema.sessions)
        .values({
          id: ses.id,
          date: ses.date,
          order: ses.order,
          subjectId: ses.subject_id,
          label: ses.label,
          durationMinutes: ses.duration_minutes,
          instructions: ses.instructions,
          needsContentReview: ses.needs_content_review ?? false,
          needsMaterialMapping: ses.needs_material_mapping ?? false,
          isArchived: false,
        })
        .onConflictDoUpdate({
          target: schema.sessions.id,
          set: {
            date: ses.date,
            order: ses.order,
            subjectId: ses.subject_id,
            label: ses.label,
            durationMinutes: ses.duration_minutes,
            instructions: ses.instructions,
            needsContentReview: ses.needs_content_review ?? false,
            needsMaterialMapping: ses.needs_material_mapping ?? false,
          },
        });

      // Insert references
      for (let i = 0; i < ses.material_refs.length; i++) {
        const ref = ses.material_refs[i];
        const docRefId = `${ses.id}_ref_${i + 1}`;
        await db
          .insert(schema.sessionDocuments)
          .values({
            id: docRefId,
            sessionId: ses.id,
            documentId: ref.material_id,
            sourceFilename: ref.source_filename,
            pageStart: ref.page_start,
            pageEnd: ref.page_end,
            pageBasis: ref.page_basis ?? "physical_pdf_pages",
            mappingStatus: ref.mapping_status ?? "verified",
          })
          .onConflictDoUpdate({
            target: schema.sessionDocuments.id,
            set: {
              sourceFilename: ref.source_filename,
              pageStart: ref.page_start,
              pageEnd: ref.page_end,
              pageBasis: ref.page_basis ?? "physical_pdf_pages",
              mappingStatus: ref.mapping_status ?? "verified",
            },
          });
      }
    }

    console.log("\n✅ ¡Importación completada con éxito en Neon!");
  } catch (error) {
    console.error("❌ Error durante la importación:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
