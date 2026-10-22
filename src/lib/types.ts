export type SubjectId = "anatomia" | "histologia" | "biologia" | "biofisica" | "bioestadistica";

export interface Subject {
  id: SubjectId;
  name: string;
  color: string;
}

export type ExamKind = "practical" | "final" | "assignment";

export interface Exam {
  id: string;
  date: string; // "YYYY-MM-DD"
  subject_id: SubjectId;
  title: string;
  kind: ExamKind;
  needs_confirmation?: boolean;
}

export interface MaterialRef {
  source_filename: string;
  page_start?: number;
  page_end?: number;
  page_basis?: string;
  mapping_status?: string;
  material_id?: string;
  drive_file_id?: string;
  view_url?: string;
}

export interface Session {
  id: string; // e.g. "session_2026-10-21_1"
  date: string; // "YYYY-MM-DD"
  order: number;
  subject_id: SubjectId;
  label: string;
  duration_minutes: number;
  instructions: string;
  material_refs: MaterialRef[];
  needs_content_review?: boolean;
  needs_material_mapping?: boolean;
  is_archived?: boolean;
}

export interface DriveDocument {
  id: string;
  title: string;
  subject_id: SubjectId;
  category_path: string;
  provider: "google_drive";
  drive_file_id: string;
  view_url: string;
  parent_folder_id?: string;
  mime_type?: string;
  size_bytes: number;
  page_count: number;
  is_duplicate: boolean;
  canonical_drive_file_id?: string | null;
  needs_curriculum_confirmation?: boolean;
  is_available?: boolean;
  notes?: string;
  created_at?: string;
}

export type SessionStatus = "pending" | "in_progress" | "completed";

export interface StudentProgress {
  id: string;
  user_id: string;
  session_id: string;
  status: SessionStatus;
  difficulty_hard: boolean;
  notes?: string;
  actual_minutes?: number;
  updated_at: string;
}

export interface ScheduleReview {
  id: string;
  user_id: string;
  session_id: string;
  review_date: string; // "YYYY-MM-DD"
  interval_days: number; // 1 | 3 | 7
  completed: boolean;
  session_title?: string;
  subject_id?: SubjectId;
  created_at: string;
}

export interface UserRole {
  id: string;
  email: string;
  name: string;
  role: "admin" | "student";
}

export interface DayPlan {
  date: string;
  isSunday: boolean;
  exams: Exam[];
  sessions: (Session & { progress?: StudentProgress })[];
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  isFullyCompleted: boolean;
}
