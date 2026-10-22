import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { getAllDocuments, getAllSessions, getDayPlan } from "../lib/data";

async function verifyAll() {
  console.log("==================================================");
  console.log("   VERIFICACIÓN INTEGRAL DE ACTUALIZACIÓN        ");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`✅ [OK] ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${description}`);
    }
  }

  // 1. Catálogo de documentos: 77 en total, 71 canónicos y 6 duplicados
  const docs = await getAllDocuments();
  assert(docs.length === 77, `Catálogo de PDFs contiene ${docs.length} documentos (esperado exactamente 77)`);
  const canonicalDocs = docs.filter((d) => !d.is_duplicate);
  const duplicateDocs = docs.filter((d) => d.is_duplicate);
  assert(canonicalDocs.length === 71, `Documentos principales canónicos: ${canonicalDocs.length} (esperado 71)`);
  assert(duplicateDocs.length === 6, `Copias duplicadas identificadas: ${duplicateDocs.length} (esperado 6)`);

  // 2. Comprobar presencia del Atlas de Histología y la Guía de Biofísica
  const atlas = docs.find((d) => d.drive_file_id === "1ZpP5u2mVk-kVaYYi4I0qLNxbIALghkUn");
  const bio = docs.find((d) => d.drive_file_id === "16FAAo3qNQN8hyFIhHovl5veRrFuQPpEZ");
  assert(Boolean(atlas && atlas.page_count === 57), `Atlas de Histología presente con 57 páginas: ${atlas?.title}`);
  assert(Boolean(bio && bio.page_count === 43), `Guía de Biofísica presente con 43 páginas: ${bio?.title}`);

  // 3. Comprobar 127 sesiones totales
  const sessions = await getAllSessions();
  assert(sessions.length === 127, `Total de sesiones en el cronograma: ${sessions.length} (esperado 127)`);

  // 4. Comprobar sesiones de Biofísica antes del práctico (26/10)
  const pOct22 = await getDayPlan("2026-10-22", "yanina");
  const sOct22Bio = pOct22.sessions.find((s) => s.subject_id === "biofisica");
  assert(
    sOct22Bio?.material_refs[0]?.page_start === 25 && sOct22Bio?.material_refs[0]?.page_end === 28,
    "22/10 Biofísica vinculado a pp. 25–28 (mecánica de fluidos, hidrostática)"
  );

  const pOct24 = await getDayPlan("2026-10-24", "yanina");
  const sOct24Bio = pOct24.sessions.find((s) => s.subject_id === "biofisica");
  assert(
    sOct24Bio?.material_refs[0]?.page_start === 29 && sOct24Bio?.material_refs[0]?.page_end === 31,
    "24/10 Biofísica vinculado a pp. 29–31 (tensión superficial, viscosidad, hemodinámica)"
  );

  const pOct25 = await getDayPlan("2026-10-25", "yanina");
  const sOct25Bio = pOct25.sessions.find((s) => s.subject_id === "biofisica");
  assert(
    sOct25Bio?.material_refs[0]?.page_start === 25 && sOct25Bio?.material_refs[0]?.page_end === 33,
    "25/10 Biofísica vinculado a repaso de problemas pp. 25–33"
  );

  // 5. Comprobar sesiones de Biofísica antes del final (02/11)
  const pOct28 = await getDayPlan("2026-10-28", "yanina");
  const sOct28Bio = pOct28.sessions.find((s) => s.subject_id === "biofisica");
  assert(
    sOct28Bio?.material_refs[0]?.page_start === 3 && sOct28Bio?.material_refs[0]?.page_end === 24,
    "28/10 Biofísica vinculado a pp. 3–24 (teoría integral para el final)"
  );

  const pOct30 = await getDayPlan("2026-10-30", "yanina");
  const sOct30Bio = pOct30.sessions.find((s) => s.subject_id === "biofisica");
  assert(
    sOct30Bio?.material_refs[0]?.page_start === 34 && sOct30Bio?.material_refs[0]?.page_end === 36,
    "30/10 Biofísica vinculado a p. 34 (fórmulas) y pp. 35–36 (ejercicios y respuestas)"
  );

  const pNov01 = await getDayPlan("2026-11-01", "yanina");
  const sNov01Bio = pNov01.sessions.find((s) => s.subject_id === "biofisica");
  assert(
    sNov01Bio?.material_refs[0]?.page_start === 37 && sNov01Bio?.material_refs[0]?.page_end === 40,
    "01/11 Biofísica vinculado a pp. 37–40 (banco de 40 preguntas y respuestas)"
  );

  // 6. Comprobar sesiones de Histología (Atlas práctico)
  const pNov06 = await getDayPlan("2026-11-06", "yanina");
  const sNov06Histo = pNov06.sessions.find((s) => s.subject_id === "histologia");
  assert(
    sNov06Histo?.material_refs[0]?.page_start === 4 && sNov06Histo?.material_refs[0]?.page_end === 13,
    "06/11 Histología vinculado a Digestivo III (pp. 4–13 del Atlas)"
  );

  const pNov07 = await getDayPlan("2026-11-07", "yanina");
  const sNov07Histo1 = pNov07.sessions[0];
  const sNov07Histo3 = pNov07.sessions[2];
  assert(
    sNov07Histo1?.material_refs[0]?.page_start === 14 && sNov07Histo1?.material_refs[0]?.page_end === 20,
    "07/11 Bloque 1 Histología vinculado a Urinario (pp. 14–20 del Atlas)"
  );
  assert(
    sNov07Histo3?.material_refs[0]?.page_start === 21 && sNov07Histo3?.material_refs[0]?.page_end === 28,
    "07/11 Bloque 3 Histología vinculado a Endocrino (pp. 21–28 del Atlas)"
  );

  const pNov17 = await getDayPlan("2026-11-17", "yanina");
  const sNov17Histo1 = pNov17.sessions[0];
  assert(
    sNov17Histo1?.material_refs[0]?.page_start === 52 && sNov17Histo1?.material_refs[0]?.page_end === 56,
    "17/11 Bloque 1 Histología vinculado a Autoevaluación práctica (pp. 52–56 del Atlas)"
  );

  // 7. Comprobar que los botones de Drive tienen la URL correcta
  assert(
    Boolean(sOct22Bio?.material_refs[0]?.view_url?.includes("16FAAo3qNQN8hyFIhHovl5veRrFuQPpEZ")),
    "Botón de Drive para Biofísica apunta a la URL oficial del documento"
  );
  assert(
    Boolean(sNov06Histo?.material_refs[0]?.view_url?.includes("1ZpP5u2mVk-kVaYYi4I0qLNxbIALghkUn")),
    "Botón de Drive para Atlas Histología apunta a la URL oficial del documento"
  );

  // 8. Comprobar que las 25 bolillas y sesiones de Anatomía siguen intactas
  const anatSessions = sessions.filter((s) => s.subject_id === "anatomia");
  assert(
    anatSessions.length > 50,
    `Sesiones de Anatomía preservadas intactas: ${anatSessions.length} bloques programados`
  );

  console.log("\n--------------------------------------------------");
  console.log(`Resultado final: ${passed}/${total} comprobaciones superadas.`);
  console.log("==================================================");
}

verifyAll().catch(console.error);
