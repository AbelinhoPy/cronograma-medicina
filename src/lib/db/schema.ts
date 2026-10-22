import { pgTable, text, integer, bigint, boolean, timestamp, varchar, uniqueIndex, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").$type<"admin" | "student">().notNull().default("student"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subjects = pgTable("subjects", {
  id: text("id").primaryKey(), // anatomia, biologia, histologia, biofisica, bioestadistica
  name: text("name").notNull(),
  color: varchar("color", { length: 20 }).notNull(),
});

export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  title: text("title").notNull(),
  kind: varchar("kind", { length: 50 }).notNull().default("final"), // practical, final, assignment
  needsConfirmation: boolean("needs_confirmation").default(false).notNull(),
}, (table) => [
  index("idx_exams_date").on(table.date),
]);

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  categoryPath: text("category_path").notNull().default(""),
  provider: varchar("provider", { length: 50 }).notNull().default("google_drive"),
  driveFileId: text("drive_file_id").notNull().unique(),
  viewUrl: text("view_url").notNull(),
  parentFolderId: text("parent_folder_id"),
  mimeType: varchar("mime_type", { length: 100 }).default("application/pdf"),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
  pageCount: integer("page_count").notNull().default(0),
  isDuplicate: boolean("is_duplicate").default(false).notNull(),
  canonicalDriveFileId: text("canonical_drive_file_id"),
  needsCurriculumConfirmation: boolean("needs_curriculum_confirmation").default(false).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_documents_subject").on(table.subjectId),
  index("idx_documents_drive_id").on(table.driveFileId),
]);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // session_2026-10-21_1
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  order: integer("order").notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  label: text("label").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(90),
  instructions: text("instructions").notNull(),
  needsContentReview: boolean("needs_content_review").default(false).notNull(),
  needsMaterialMapping: boolean("needs_material_mapping").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
}, (table) => [
  index("idx_sessions_date").on(table.date),
  index("idx_sessions_subject").on(table.subjectId),
]);

export const sessionDocuments = pgTable("session_documents", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
  documentId: text("document_id").references(() => documents.id, { onDelete: "cascade" }),
  sourceFilename: text("source_filename"),
  pageStart: integer("page_start"),
  pageEnd: integer("page_end"),
  pageBasis: varchar("page_basis", { length: 50 }).default("physical_pdf_pages"),
  mappingStatus: varchar("mapping_status", { length: 50 }).default("verified"),
}, (table) => [
  index("idx_session_docs_session").on(table.sessionId),
  index("idx_session_docs_doc").on(table.documentId),
]);

export const studentProgress = pgTable("student_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // user email or stable id
  sessionId: text("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 20 }).$type<"pending" | "in_progress" | "completed">().notNull().default("pending"),
  difficultyHard: boolean("difficulty_hard").default(false).notNull(),
  notes: text("notes"),
  actualMinutes: integer("actual_minutes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("uidx_user_session").on(table.userId, table.sessionId),
  index("idx_progress_user").on(table.userId),
]);

export const scheduleReviews = pgTable("schedule_reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  sessionId: text("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
  reviewDate: varchar("review_date", { length: 10 }).notNull(), // YYYY-MM-DD
  intervalDays: integer("interval_days").notNull(), // 1, 3, 7
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("uidx_user_session_interval").on(table.userId, table.sessionId, table.intervalDays),
  index("idx_reviews_date").on(table.reviewDate),
  index("idx_reviews_user").on(table.userId),
]);

export const planChanges = pgTable("plan_changes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // session, document, exam
  entityId: text("entity_id").notNull(),
  changeSummary: text("change_summary").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
