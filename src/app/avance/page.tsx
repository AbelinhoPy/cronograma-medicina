export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllSessions, getStudentProgressForUser, getReviewsForUser } from "@/lib/data";
import { ProgressView } from "@/components/ProgressView";

export default async function AvancePage() {
  const [sessions, progressMapObj, reviews] = await Promise.all([
    getAllSessions(),
    getStudentProgressForUser("yanina"),
    getReviewsForUser("yanina"),
  ]);

  const progressRecord: Record<string, any> = {};
  for (const [key, val] of progressMapObj.entries()) {
    progressRecord[key] = val;
  }

  return (
    <div className="space-y-6">
      <ProgressView
        sessions={sessions}
        progressMap={progressRecord}
        reviews={reviews}
      />
    </div>
  );
}
