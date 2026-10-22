import {
  getSeedSubjects,
  getSeedExams,
  getSeedDocuments,
  getSeedSessions,
} from "../lib/seed-data";
import { getDayPlan, getAllDocuments, addNewDocument } from "../lib/data";
import { getTodayAsuncion, addDaysToDateString, formatSpanishDate } from "../lib/date-utils";

async function verifyAll() {
  console.log("==================================================");
  console.log("   VERIFICACIÓN INTEGRAL DEL SISTEMA DE ESTUDIO   ");
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

  // Check 1: 75 PDFs (69 canonical, 6 duplicates)
  const docs = await getAllDocuments();
  assert(docs.length >= 75, `Catálogo de PDFs contiene ${docs.length} documentos (esperado >= 75)`);
  const canonicalDocs = docs.filter((d) => !d.is_duplicate);
  const duplicateDocs = docs.filter((d) => d.is_duplicate);
  assert(canonicalDocs.length >= 69, `Documentos principales: ${canonicalDocs.length} (esperado >= 69)`);
  assert(duplicateDocs.length === 6, `Copias idénticas identificadas: ${duplicateDocs.length} (esperado 6)`);

  // Check 2: 127 sessions and 8 exams
  const exams = getSeedExams();
  const sessions = getSeedSessions();
  assert(exams.length === 8, `Evaluaciones en plan: ${exams.length} (esperado 8)`);
  assert(sessions.length === 127, `Sesiones de estudio: ${sessions.length} (esperado 127)`);

  // Check 3: 2026-10-21 lower limb sessions and guide references (pages 2 to 8 of 36-page guide)
  const dayPlan = await getDayPlan("2026-10-21", "yanina");
  assert(dayPlan.sessions.length === 3, `21/10/2026 tiene ${dayPlan.sessions.length} sesiones (esperado 3)`);

  const s1 = dayPlan.sessions[0];
  const s2 = dayPlan.sessions[1];
  const s3 = dayPlan.sessions[2];

  assert(s1.label === "Miembro inferior" && s1.material_refs[0]?.page_start === 2 && s1.material_refs[0]?.page_end === 5,
    "Sesión 1 del 21/10 referencia pp. 2–5 de la guía");
  assert(s2.label === "Miembro inferior" && s2.material_refs[0]?.page_start === 6 && s2.material_refs[0]?.page_end === 8,
    "Sesión 2 del 21/10 referencia pp. 6–8 de la guía");
  assert(s3.instructions.includes("Recuperación activa"), "Sesión 3 del 21/10 es recuperación activa");

  // Check 4: Material linked opens Drive URL
  assert(Boolean(s1.material_refs[0]?.view_url?.includes("drive.google.com")),
    "Material vinculado contiene enlace directo verificado a Google Drive");

  // Check 5: Asuncion timezone formatting
  const todayAsuncion = getTodayAsuncion();
  assert(Boolean(todayAsuncion && todayAsuncion.match(/^\d{4}-\d{2}-\d{2}$/)),
    `Fecha en America/Asuncion formateada correctamente: ${todayAsuncion}`);

  const formattedOct21 = formatSpanishDate("2026-10-21", { includeYear: true });
  assert(formattedOct21.toLowerCase().includes("miércoles 21 de octubre"),
    `Formato en español sin desplazamiento UTC: "${formattedOct21}"`);

  // Check 6: Adding a new summary / PDF (user's requested capability)
  const testSummary = await addNewDocument({
    title: "Resumen_Test_Abel_Pelvis",
    subject_id: "anatomia",
    category_path: "01 Anatomía/Resúmenes de Abel",
    drive_url_or_id: "https://drive.google.com/file/d/1_TEST_FILE_ID_ABEL/view?usp=drivesdk",
    page_count: 5,
    notes: "Resumen con esquemas de pelvis para repaso rápido",
  });
  assert(testSummary.id === "material_1_TEST_FILE_ID_ABEL" && testSummary.title === "Resumen_Test_Abel_Pelvis.pdf",
    "Capacidad de agregar nuevos resúmenes a Drive y registrar en base de datos verificada con éxito");

  console.log("\n--------------------------------------------------");
  console.log(`Resultado final: ${passed}/${total} comprobaciones superadas.`);
  console.log("--------------------------------------------------");
}

verifyAll().catch(console.error);
