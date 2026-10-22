import fs from "fs";
import path from "path";
import { Subject, Exam, DriveDocument, Session } from "./types";

export const STUDY_PHRASES = [
  "Todo es inútil si no crees en ti mismo.",
  "¿Dices que no puedo ser doctora? ¿Y quién lo decidió? ¿Que este examen apagará mi sol? ¿Y quién lo decidió? Soy la única que decide hasta dónde voy a llegar. — Inspirada en Escanor",
  "Mi sueño no termina en una página difícil. Hoy entreno para la doctora que voy a ser. — Frase original, espíritu de anime",
  "Una bolilla más. Un miedo menos. Mi historia todavía se está escribiendo. — Frase original, espíritu de anime",
  "No necesito dominarlo todo hoy. Necesito volver a intentarlo y dar el siguiente paso. — Frase original",
  "Yanina, tu próximo poder no aparece de golpe: se construye con cada sesión de estudio. — Frase original, espíritu de anime",
];

interface RawMaterialsFile {
  schema_version: number;
  count: number;
  canonical_count: number;
  files: Array<{
    id: string;
    title: string;
    subject_id: string;
    category_path: string;
    provider: string;
    drive_file_id: string;
    view_url: string;
    parent_folder_id?: string;
    mime_type?: string;
    size_bytes: number;
    page_count: number;
    is_duplicate: boolean;
    canonical_drive_file_id?: string | null;
    needs_curriculum_confirmation?: boolean;
    remote_verification?: string;
  }>;
}

interface RawSeedFile {
  schema_version: number;
  edition: string;
  timezone: string;
  title: string;
  student_display_name: string;
  start_date: string;
  end_date: string;
  daily_minutes_assumed: number;
  sunday_minutes_assumed: number;
  notes: string[];
  subjects: Array<{ id: string; name: string; color: string }>;
  exams: Array<{
    id: string;
    date: string;
    subject_id: string;
    title: string;
    kind: string;
    needs_confirmation?: boolean;
  }>;
  sessions: Array<{
    id: string;
    date: string;
    order: number;
    subject_id: string;
    label: string;
    duration_minutes: number;
    instructions: string;
    material_refs: Array<{
      source_filename: string;
      page_start?: number;
      page_end?: number;
      page_basis?: string;
      mapping_status?: string;
      material_id?: string;
      drive_file_id?: string;
      view_url?: string;
    }>;
    needs_content_review?: boolean;
    needs_material_mapping?: boolean;
  }>;
}

function resolveFilePath(filename: string): string {
  const localPath = path.join(process.cwd(), filename);
  if (fs.existsSync(localPath)) return localPath;
  const outputsPath = path.join(
    "C:",
    "Users",
    "abelk",
    "Documents",
    "Codex",
    "2026-10-21",
    "ne",
    "outputs",
    "paquete-antigravity",
    filename
  );
  if (fs.existsSync(outputsPath)) return outputsPath;
  return localPath;
}

export function getRawMaterials(): RawMaterialsFile {
  const filePath = resolveFilePath("materiales.drive.json");
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getRawSeed(): RawSeedFile {
  const filePath = resolveFilePath("cronograma.seed.json");
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getSeedSubjects(): Subject[] {
  const seed = getRawSeed();
  return seed.subjects.map((s) => ({
    id: s.id as any,
    name: s.name,
    color: s.color,
  }));
}

export function getSeedExams(): Exam[] {
  const seed = getRawSeed();
  return seed.exams.map((e) => ({
    id: e.id,
    date: e.date,
    subject_id: e.subject_id as any,
    title: e.title,
    kind: e.kind as any,
    needs_confirmation: e.needs_confirmation,
  }));
}

export function getSeedDocuments(): DriveDocument[] {
  const mat = getRawMaterials();
  return mat.files.map((f) => ({
    id: f.id,
    title: f.title,
    subject_id: f.subject_id as any,
    category_path: f.category_path,
    provider: "google_drive",
    drive_file_id: f.drive_file_id,
    view_url: f.view_url,
    parent_folder_id: f.parent_folder_id,
    mime_type: f.mime_type,
    size_bytes: f.size_bytes,
    page_count: f.page_count,
    is_duplicate: f.is_duplicate,
    canonical_drive_file_id: f.canonical_drive_file_id,
    needs_curriculum_confirmation: f.needs_curriculum_confirmation,
    is_available: true,
  }));
}

export function getSeedSessions(): Session[] {
  const seed = getRawSeed();
  return seed.sessions.map((s) => ({
    id: s.id,
    date: s.date,
    order: s.order,
    subject_id: s.subject_id as any,
    label: s.label,
    duration_minutes: s.duration_minutes,
    instructions: s.instructions,
    material_refs: s.material_refs,
    needs_content_review: s.needs_content_review,
    needs_material_mapping: s.needs_material_mapping,
    is_archived: false,
  }));
}
