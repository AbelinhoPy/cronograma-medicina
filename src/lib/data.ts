import { db, isDbConfigured, schema } from "./db";
import { eq, and, sql, asc } from "drizzle-orm";
import {
  Subject,
  Exam,
  DriveDocument,
  Session,
  StudentProgress,
  ScheduleReview,
  DayPlan,
} from "./types";
import {
  getSeedSubjects,
  getSeedExams,
  getSeedDocuments,
  getSeedSessions,
} from "./seed-data";
import { addDaysToDateString, isSundayDate } from "./date-utils";

// Memory storage fallback when DATABASE_URL is not yet connected
const inMemoryProgress: Map<string, StudentProgress> = new Map();
const inMemoryReviews: Map<string, ScheduleReview> = new Map();
const inMemoryCustomDocs: DriveDocument[] = [];

export async function getAllSubjects(): Promise<Subject[]> {
  if (isDbConfigured && db) {
    try {
      const rows = await db.select().from(schema.subjects);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id as any,
          name: r.name,
          color: r.color,
        }));
      }
    } catch (err) {
      console.warn("DB query failed, using seed subjects:", err);
    }
  }
  return getSeedSubjects();
}

export async function getAllExams(): Promise<Exam[]> {
  if (isDbConfigured && db) {
    try {
      const rows = await db.select().from(schema.exams).orderBy(asc(schema.exams.date));
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          date: r.date,
          subject_id: r.subjectId as any,
          title: r.title,
          kind: r.kind as any,
          needs_confirmation: r.needsConfirmation,
        }));
      }
    } catch (err) {
      console.warn("DB query failed, using seed exams:", err);
    }
  }
  return getSeedExams();
}

export async function getAllDocuments(): Promise<DriveDocument[]> {
  if (isDbConfigured && db) {
    try {
      const rows = await db.select().from(schema.documents).orderBy(schema.documents.title);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          title: r.title,
          subject_id: r.subjectId as any,
          category_path: r.categoryPath,
          provider: "google_drive",
          drive_file_id: r.driveFileId,
          view_url: r.viewUrl,
          parent_folder_id: r.parentFolderId ?? undefined,
          mime_type: r.mimeType ?? undefined,
          size_bytes: r.sizeBytes,
          page_count: r.pageCount,
          is_duplicate: r.isDuplicate,
          canonical_drive_file_id: r.canonicalDriveFileId,
          needs_curriculum_confirmation: r.needsCurriculumConfirmation,
          is_available: r.isAvailable,
          notes: r.notes ?? undefined,
          created_at: r.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("DB query failed, using seed documents:", err);
    }
  }
  return [...getSeedDocuments(), ...inMemoryCustomDocs];
}

export async function getAllSessions(): Promise<Session[]> {
  if (isDbConfigured && db) {
    try {
      const sessionRows = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.isArchived, false))
        .orderBy(asc(schema.sessions.date), asc(schema.sessions.order));

      if (sessionRows.length > 0) {
        const docRefRows = await db.select().from(schema.sessionDocuments);
        const docsMap = new Map<string, any>();
        const allDocs = await getAllDocuments();
        allDocs.forEach((d) => docsMap.set(d.id, d));

        return sessionRows.map((s) => {
          const refs = docRefRows
            .filter((dr) => dr.sessionId === s.id)
            .map((dr) => {
              const matchedDoc = dr.documentId ? docsMap.get(dr.documentId) : null;
              return {
                source_filename: dr.sourceFilename || matchedDoc?.title || "Documento PDF",
                page_start: dr.pageStart ?? undefined,
                page_end: dr.pageEnd ?? undefined,
                page_basis: dr.pageBasis ?? "physical_pdf_pages",
                mapping_status: dr.mappingStatus ?? "verified",
                material_id: dr.documentId ?? undefined,
                drive_file_id: matchedDoc?.drive_file_id,
                view_url: matchedDoc?.view_url,
              };
            });

          return {
            id: s.id,
            date: s.date,
            order: s.order,
            subject_id: s.subjectId as any,
            label: s.label,
            duration_minutes: s.durationMinutes,
            instructions: s.instructions,
            material_refs: refs,
            needs_content_review: s.needsContentReview,
            needs_material_mapping: s.needsMaterialMapping,
            is_archived: s.isArchived,
          };
        });
      }
    } catch (err) {
      console.warn("DB query failed, using seed sessions:", err);
    }
  }
  return getSeedSessions();
}

export async function getStudentProgressForUser(userId: string): Promise<Map<string, StudentProgress>> {
  const map = new Map<string, StudentProgress>();

  if (isDbConfigured && db) {
    try {
      const rows = await db
        .select()
        .from(schema.studentProgress)
        .where(eq(schema.studentProgress.userId, userId));

      rows.forEach((r) => {
        map.set(r.sessionId, {
          id: r.id,
          user_id: r.userId,
          session_id: r.sessionId,
          status: r.status as any,
          difficulty_hard: r.difficultyHard,
          notes: r.notes ?? undefined,
          actual_minutes: r.actualMinutes ?? undefined,
          updated_at: r.updatedAt.toISOString(),
        });
      });
      return map;
    } catch (err) {
      console.warn("DB query for progress failed:", err);
    }
  }

  // Fallback to in-memory progress for this user
  for (const [key, val] of inMemoryProgress.entries()) {
    if (val.user_id === userId) {
      map.set(val.session_id, val);
    }
  }
  return map;
}

export async function getDayPlan(dateStr: string, userId: string = "yanina"): Promise<DayPlan> {
  const [exams, sessions, progressMap] = await Promise.all([
    getAllExams(),
    getAllSessions(),
    getStudentProgressForUser(userId),
  ]);

  const dayExams = exams.filter((e) => e.date === dateStr);
  const daySessions = sessions
    .filter((s) => s.date === dateStr)
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      ...s,
      progress: progressMap.get(s.id),
    }));

  const totalPlannedMinutes = daySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalActualMinutes = daySessions.reduce(
    (acc, s) => acc + (s.progress?.actual_minutes ?? (s.progress?.status === "completed" ? s.duration_minutes : 0)),
    0
  );

  const isFullyCompleted =
    daySessions.length > 0 &&
    daySessions.every((s) => s.progress?.status === "completed");

  return {
    date: dateStr,
    isSunday: isSundayDate(dateStr),
    exams: dayExams,
    sessions: daySessions,
    totalPlannedMinutes,
    totalActualMinutes,
    isFullyCompleted,
  };
}

export async function updateSessionProgress(
  userId: string,
  sessionId: string,
  data: {
    status?: "pending" | "in_progress" | "completed";
    difficulty_hard?: boolean;
    notes?: string;
    actual_minutes?: number;
  }
): Promise<StudentProgress> {
  const progressId = `progress_${userId}_${sessionId}`;
  const now = new Date();

  if (isDbConfigured && db) {
    try {
      const existing = await db
        .select()
        .from(schema.studentProgress)
        .where(
          and(
            eq(schema.studentProgress.userId, userId),
            eq(schema.studentProgress.sessionId, sessionId)
          )
        );

      const status = data.status ?? existing[0]?.status ?? "pending";
      const difficultyHard = data.difficulty_hard ?? existing[0]?.difficultyHard ?? false;
      const notes = data.notes !== undefined ? data.notes : (existing[0]?.notes ?? null);
      const actualMinutes =
        data.actual_minutes !== undefined ? data.actual_minutes : (existing[0]?.actualMinutes ?? null);

      await db
        .insert(schema.studentProgress)
        .values({
          id: progressId,
          userId,
          sessionId,
          status,
          difficultyHard,
          notes,
          actualMinutes,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [schema.studentProgress.userId, schema.studentProgress.sessionId],
          set: {
            status,
            difficultyHard,
            notes,
            actualMinutes,
            updatedAt: now,
          },
        });

      // If marked as difficulty_hard === true, propose reviews
      if (difficultyHard) {
        await scheduleSpacedReviews(userId, sessionId);
      }

      return {
        id: progressId,
        user_id: userId,
        session_id: sessionId,
        status: status as any,
        difficulty_hard: difficultyHard,
        notes: notes ?? undefined,
        actual_minutes: actualMinutes ?? undefined,
        updated_at: now.toISOString(),
      };
    } catch (err) {
      console.error("DB update error:", err);
      throw new Error("No se pudo guardar el progreso en la base de datos.");
    }
  }

  // In-memory fallback
  const current = inMemoryProgress.get(`${userId}_${sessionId}`);
  const updated: StudentProgress = {
    id: progressId,
    user_id: userId,
    session_id: sessionId,
    status: data.status ?? current?.status ?? "pending",
    difficulty_hard: data.difficulty_hard ?? current?.difficulty_hard ?? false,
    notes: data.notes !== undefined ? data.notes : current?.notes,
    actual_minutes: data.actual_minutes !== undefined ? data.actual_minutes : current?.actual_minutes,
    updated_at: now.toISOString(),
  };

  inMemoryProgress.set(`${userId}_${sessionId}`, updated);

  if (updated.difficulty_hard) {
    await scheduleSpacedReviews(userId, sessionId);
  }

  return updated;
}

export async function scheduleSpacedReviews(userId: string, sessionId: string): Promise<ScheduleReview[]> {
  const allSessions = await getAllSessions();
  const session = allSessions.find((s) => s.id === sessionId);
  if (!session) return [];

  const intervals = [1, 3, 7];
  const reviews: ScheduleReview[] = [];

  for (const interval of intervals) {
    const reviewDate = addDaysToDateString(session.date, interval);
    const reviewId = `review_${userId}_${sessionId}_${interval}`;

    if (isDbConfigured && db) {
      try {
        await db
          .insert(schema.scheduleReviews)
          .values({
            id: reviewId,
            userId,
            sessionId,
            reviewDate,
            intervalDays: interval,
            completed: false,
          })
          .onConflictDoNothing();
      } catch (err) {
        console.warn("Could not insert review in DB:", err);
      }
    } else {
      if (!inMemoryReviews.has(reviewId)) {
        inMemoryReviews.set(reviewId, {
          id: reviewId,
          user_id: userId,
          session_id: sessionId,
          review_date: reviewDate,
          interval_days: interval,
          completed: false,
          session_title: `${session.label} - Repaso (${interval}d)`,
          subject_id: session.subject_id,
          created_at: new Date().toISOString(),
        });
      }
    }

    reviews.push({
      id: reviewId,
      user_id: userId,
      session_id: sessionId,
      review_date: reviewDate,
      interval_days: interval,
      completed: false,
      session_title: `${session.label} - Repaso (${interval}d)`,
      subject_id: session.subject_id,
      created_at: new Date().toISOString(),
    });
  }

  return reviews;
}

export async function getReviewsForUser(userId: string): Promise<ScheduleReview[]> {
  const allSessions = await getAllSessions();
  const sessionMap = new Map(allSessions.map((s) => [s.id, s]));

  if (isDbConfigured && db) {
    try {
      const rows = await db
        .select()
        .from(schema.scheduleReviews)
        .where(eq(schema.scheduleReviews.userId, userId))
        .orderBy(asc(schema.scheduleReviews.reviewDate));

      return rows.map((r) => {
        const ses = sessionMap.get(r.sessionId);
        return {
          id: r.id,
          user_id: r.userId,
          session_id: r.sessionId,
          review_date: r.reviewDate,
          interval_days: r.intervalDays,
          completed: r.completed,
          session_title: ses ? `${ses.label} · ${ses.instructions.slice(0, 45)}...` : undefined,
          subject_id: ses?.subject_id,
          created_at: r.createdAt.toISOString(),
        };
      });
    } catch (err) {
      console.warn("DB query for reviews failed:", err);
    }
  }

  return Array.from(inMemoryReviews.values()).filter((r) => r.user_id === userId);
}

/**
 * Adds a new PDF / summary to the database and Drive catalog
 */
export async function addNewDocument(input: {
  title: string;
  subject_id: string;
  category_path: string;
  drive_url_or_id: string;
  page_count: number;
  size_bytes?: number;
  notes?: string;
}): Promise<DriveDocument> {
  // Extract clean Drive file ID
  let driveFileId = input.drive_url_or_id.trim();
  const match = driveFileId.match(/\/d\/([a-zA-Z0-9_-]+)/) || driveFileId.match(/id=([a-zA-Z0-9_-]+)/);
  if (match) {
    driveFileId = match[1];
  }

  const docId = `material_${driveFileId}`;
  const viewUrl = `https://drive.google.com/file/d/${driveFileId}/view?usp=drivesdk`;

  const newDoc: DriveDocument = {
    id: docId,
    title: input.title.endsWith(".pdf") ? input.title : `${input.title}.pdf`,
    subject_id: input.subject_id as any,
    category_path: input.category_path || "01 Anatomía/Resúmenes",
    provider: "google_drive",
    drive_file_id: driveFileId,
    view_url: viewUrl,
    size_bytes: input.size_bytes || 1024 * 1024,
    page_count: input.page_count,
    is_duplicate: false,
    canonical_drive_file_id: null,
    needs_curriculum_confirmation: false,
    is_available: true,
    notes: input.notes,
    created_at: new Date().toISOString(),
  };

  if (isDbConfigured && db) {
    try {
      await db
        .insert(schema.documents)
        .values({
          id: newDoc.id,
          title: newDoc.title,
          subjectId: newDoc.subject_id,
          categoryPath: newDoc.category_path,
          provider: newDoc.provider,
          driveFileId: newDoc.drive_file_id,
          viewUrl: newDoc.view_url,
          sizeBytes: newDoc.size_bytes,
          pageCount: newDoc.page_count,
          isDuplicate: false,
          needsCurriculumConfirmation: false,
          isAvailable: true,
          notes: newDoc.notes,
        })
        .onConflictDoUpdate({
          target: schema.documents.driveFileId,
          set: {
            title: newDoc.title,
            subjectId: newDoc.subject_id,
            categoryPath: newDoc.category_path,
            viewUrl: newDoc.view_url,
            pageCount: newDoc.page_count,
            notes: newDoc.notes,
            isAvailable: true,
          },
        });
    } catch (err) {
      console.error("Error inserting document in DB:", err);
      throw new Error("Error al guardar el nuevo documento en la base de datos.");
    }
  } else {
    const existingIndex = inMemoryCustomDocs.findIndex((d) => d.drive_file_id === driveFileId);
    if (existingIndex >= 0) {
      inMemoryCustomDocs[existingIndex] = newDoc;
    } else {
      inMemoryCustomDocs.push(newDoc);
    }
  }

  return newDoc;
}

export async function rescheduleSession(
  sessionId: string,
  newDate: string,
  adminUserId: string = "abel"
): Promise<{ success: boolean; message: string }> {
  if (isDbConfigured && db) {
    try {
      const existing = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId));
      if (existing.length === 0) {
        throw new Error("Sesión no encontrada");
      }
      const oldDate = existing[0].date;

      await db
        .update(schema.sessions)
        .set({ date: newDate })
        .where(eq(schema.sessions.id, sessionId));

      await db.insert(schema.planChanges).values({
        id: `change_${Date.now()}`,
        userId: adminUserId,
        entityType: "session",
        entityId: sessionId,
        changeSummary: `Reprogramada de ${oldDate} al ${newDate}`,
        oldValue: oldDate,
        newValue: newDate,
      });

      return { success: true, message: `Sesión reprogramada con éxito al ${newDate}` };
    } catch (err: any) {
      return { success: false, message: err?.message || "Error al reprogramar" };
    }
  }

  return { success: true, message: `Sesión reprogramada al ${newDate} (memoria)` };
}
