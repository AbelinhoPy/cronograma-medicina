import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

const BIO_DOC = {
  id: "material_16FAAo3qNQN8hyFIhHovl5veRrFuQPpEZ",
  title: "Guia_Biofisica_Examen_Medicina.pdf",
  driveFileId: "16FAAo3qNQN8hyFIhHovl5veRrFuQPpEZ",
  viewUrl: "https://drive.google.com/file/d/16FAAo3qNQN8hyFIhHovl5veRrFuQPpEZ/view?usp=drivesdk",
};

const HISTO_DOC = {
  id: "material_1ZpP5u2mVk-kVaYYi4I0qLNxbIALghkUn",
  title: "Atlas_Practico_Histologia_Yanina.pdf",
  driveFileId: "1ZpP5u2mVk-kVaYYi4I0qLNxbIALghkUn",
  viewUrl: "https://drive.google.com/file/d/1ZpP5u2mVk-kVaYYi4I0qLNxbIALghkUn/view?usp=drivesdk",
};

interface SessionPlan {
  sessionId: string;
  instructions: string;
  doc: typeof BIO_DOC;
  pageStart: number;
  pageEnd: number;
}

const MAPPINGS: SessionPlan[] = [
  // --- Biofísica: Práctico del 26/10 (pp. 25-33) ---
  {
    sessionId: "session_2026-10-22_1",
    instructions: "Biofísica práctica · pp. 25–28. Mecánica de fluidos, presión e hidrostática. Resolución de problemas resueltos y propuestos para el práctico del 26/10.",
    doc: BIO_DOC,
    pageStart: 25,
    pageEnd: 28,
  },
  {
    sessionId: "session_2026-10-24_1",
    instructions: "Biofísica práctica · pp. 29–31. Tensión superficial, capilaridad, viscosidad y hemodinámica. Fórmulas aplicadas y problemas de examen.",
    doc: BIO_DOC,
    pageStart: 29,
    pageEnd: 31,
  },
  {
    sessionId: "session_2026-10-25_1",
    instructions: "Biofísica práctica · pp. 32–33 (difusión, osmosis, bioelectricidad) y repaso general de problemas pp. 25–33. Simulacro previo al examen práctico de mañana.",
    doc: BIO_DOC,
    pageStart: 25,
    pageEnd: 33,
  },

  // --- Biofísica: Final del 02/11 (teoría, fórmulas, banco de preguntas) ---
  {
    sessionId: "session_2026-10-28_1",
    instructions: "Biofísica teórica · pp. 3–24. Repaso teórico integral de los temas fundamentales para el examen final del 02/11.",
    doc: BIO_DOC,
    pageStart: 3,
    pageEnd: 24,
  },
  {
    sessionId: "session_2026-10-30_1",
    instructions: "Biofísica examen · p. 34 (fórmulas clave) y pp. 35–36 (ejercicios de examen y respuestas). Entrenamiento de precisión para el final.",
    doc: BIO_DOC,
    pageStart: 34,
    pageEnd: 36,
  },
  {
    sessionId: "session_2026-11-01_1",
    instructions: "Biofísica simulacro final · pp. 37–40. Banco de 40 preguntas de examen y cotejo con respuestas oficiales antes del final de mañana.",
    doc: BIO_DOC,
    pageStart: 37,
    pageEnd: 40,
  },

  // --- Histología: Primera vuelta de preparados (06/11 al 14/11) ---
  {
    sessionId: "session_2026-11-06_2",
    instructions: "Histología · Aparato Digestivo III (pp. 4–13 del Atlas). Preparados de hígado, lobulillos, vesícula biliar y páncreas exocrino/endocrino.",
    doc: HISTO_DOC,
    pageStart: 4,
    pageEnd: 13,
  },
  {
    sessionId: "session_2026-11-07_1",
    instructions: "Histología · Aparato Urinario (pp. 14–20 del Atlas). Cortes histológicos de riñón, glomérulos, túbulos proximales/distales y vías urinarias.",
    doc: HISTO_DOC,
    pageStart: 14,
    pageEnd: 20,
  },
  {
    sessionId: "session_2026-11-07_3",
    instructions: "Histología · Sistema Endocrino (pp. 21–28 del Atlas). Reconocimiento de hipófisis, tiroides, paratiroides y corteza/médula suprarrenal.",
    doc: HISTO_DOC,
    pageStart: 21,
    pageEnd: 28,
  },
  {
    sessionId: "session_2026-11-09_1",
    instructions: "Histología · Aparato Genital Masculino (pp. 39–45 del Atlas). Túbulos seminíferos, células de Leydig/Sertoli, epidídimo y próstata.",
    doc: HISTO_DOC,
    pageStart: 39,
    pageEnd: 45,
  },
  {
    sessionId: "session_2026-11-09_3",
    instructions: "Histología · Aparato Genital Femenino (pp. 29–38 del Atlas). Folículos ováricos en distintas etapas, trompas uterinas y capas del útero.",
    doc: HISTO_DOC,
    pageStart: 29,
    pageEnd: 38,
  },
  {
    sessionId: "session_2026-11-13_1",
    instructions: "Histología práctica · Integración y diagnóstico diferencial (pp. 46–51 del Atlas). Comparación de preparados parecidos y rasgos distintivos.",
    doc: HISTO_DOC,
    pageStart: 46,
    pageEnd: 51,
  },
  {
    sessionId: "session_2026-11-14_2",
    instructions: "Histología práctica · Integración y diagnósticos diferenciales (pp. 46–51 del Atlas). Consolidación antes de la segunda vuelta práctica.",
    doc: HISTO_DOC,
    pageStart: 46,
    pageEnd: 51,
  },

  // --- Histología: Segunda vuelta y simulacro práctico (15/11 al 18/11) ---
  {
    sessionId: "session_2026-11-15_2",
    instructions: "Histología práctica · Segunda vuelta: Digestivo III (pp. 4–13 del Atlas). Reconocimiento rápido de imágenes y preparados sin rótulos.",
    doc: HISTO_DOC,
    pageStart: 4,
    pageEnd: 13,
  },
  {
    sessionId: "session_2026-11-16_1",
    instructions: "Histología práctica · Segunda vuelta: Urinario (pp. 14–20 del Atlas). Diagnóstico rápido diferencial de preparados renales y vías.",
    doc: HISTO_DOC,
    pageStart: 14,
    pageEnd: 20,
  },
  {
    sessionId: "session_2026-11-16_2",
    instructions: "Histología práctica · Segunda vuelta: Endocrino (pp. 21–28 del Atlas). Láminas de glándulas y preparados sin rótulos.",
    doc: HISTO_DOC,
    pageStart: 21,
    pageEnd: 28,
  },
  {
    sessionId: "session_2026-11-17_1",
    instructions: "Histología práctica · Simulacro y Autoevaluación práctica (pp. 52–54 del Atlas). Test con imágenes sin rótulos y verificación con respuestas (pp. 55–56).",
    doc: HISTO_DOC,
    pageStart: 52,
    pageEnd: 56,
  },
  {
    sessionId: "session_2026-11-17_2",
    instructions: "Histología práctica · Genital Masculino (pp. 39–45 del Atlas). Repaso de láminas clave y detalles diagnósticos.",
    doc: HISTO_DOC,
    pageStart: 39,
    pageEnd: 45,
  },
  {
    sessionId: "session_2026-11-18_2",
    instructions: "Histología práctica · Repaso final de preparados críticos: Genital Femenino (pp. 29–38 del Atlas) y láminas dudosas para el examen práctico.",
    doc: HISTO_DOC,
    pageStart: 29,
    pageEnd: 38,
  },
];

async function updateSeedJson() {
  const seedPath = path.join(process.cwd(), "cronograma.seed.json");
  const rawSeed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  let updatedCount = 0;
  for (const m of MAPPINGS) {
    const session = rawSeed.sessions.find((s: any) => s.id === m.sessionId);
    if (session) {
      session.instructions = m.instructions;
      session.needs_material_mapping = false;
      session.material_refs = [
        {
          source_filename: m.doc.title,
          page_start: m.pageStart,
          page_end: m.pageEnd,
          page_basis: "physical_pdf_pages",
          mapping_status: "verified",
          material_id: m.doc.id,
          drive_file_id: m.doc.driveFileId,
          view_url: m.doc.viewUrl,
        },
      ];
      updatedCount++;
    }
  }

  fs.writeFileSync(seedPath, JSON.stringify(rawSeed, null, 2), "utf-8");
  console.log(`Updated cronograma.seed.json for ${updatedCount} sessions.`);
}

async function updateNeonDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not found!");
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    // Check initial student progress count to ensure zero data loss
    const initialProgressRes = await pool.query("SELECT COUNT(*) FROM student_progress");
    console.log(`Initial student_progress count in Neon: ${initialProgressRes.rows[0].count}`);

    for (const m of MAPPINGS) {
      // 1. Update session instructions and mark needs_material_mapping = false
      await pool.query(
        `UPDATE sessions SET instructions = $1, needs_material_mapping = false WHERE id = $2`,
        [m.instructions, m.sessionId]
      );

      // 2. Insert or replace session_documents row
      const sessionDocId = `sdoc_${m.sessionId}_${m.doc.driveFileId.slice(0, 8)}`;
      await pool.query(
        `INSERT INTO session_documents (id, session_id, document_id, source_filename, page_start, page_end, page_basis, mapping_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'physical_pdf_pages', 'verified')
         ON CONFLICT (id) DO UPDATE SET
           document_id = EXCLUDED.document_id,
           source_filename = EXCLUDED.source_filename,
           page_start = EXCLUDED.page_start,
           page_end = EXCLUDED.page_end,
           mapping_status = EXCLUDED.mapping_status`,
        [sessionDocId, m.sessionId, m.doc.id, m.doc.title, m.pageStart, m.pageEnd]
      );
    }
    console.log(`Successfully updated ${MAPPINGS.length} sessions in Neon.`);

    // Check final student progress count
    const finalProgressRes = await pool.query("SELECT COUNT(*) FROM student_progress");
    console.log(`Final student_progress count in Neon: ${finalProgressRes.rows[0].count}`);
    if (initialProgressRes.rows[0].count !== finalProgressRes.rows[0].count) {
      throw new Error("CRITICAL WARNING: student_progress count changed!");
    }

    // Verify session documents join
    const verifyRes = await pool.query(
      `SELECT s.id as session_id, s.date, s.subject_id, sd.source_filename, sd.page_start, sd.page_end, d.drive_file_id
       FROM sessions s
       JOIN session_documents sd ON s.id = sd.session_id
       JOIN documents d ON sd.document_id = d.id
       WHERE s.id = ANY($1)
       ORDER BY s.date, s.order`,
      [MAPPINGS.map((m) => m.sessionId)]
    );
    console.log(`Verification: Found ${verifyRes.rows.length} verified joined session documents in Neon:`);
    verifyRes.rows.forEach((r) => {
      console.log(`[${r.date}] (${r.subject_id}) ${r.source_filename} pp. ${r.page_start}-${r.page_end} (Drive ID: ${r.drive_file_id})`);
    });

  } finally {
    await pool.end();
  }
}

async function main() {
  await updateSeedJson();
  await updateNeonDatabase();
}

main().catch(console.error);
