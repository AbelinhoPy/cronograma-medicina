import { getAllDocuments, getAllSessions, getAllExams } from "@/lib/data";
import { AdminPanel } from "@/components/AdminPanel";

export default async function AdminPage() {
  const [documents, sessions, exams] = await Promise.all([
    getAllDocuments(),
    getAllSessions(),
    getAllExams(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPanel
        totalDocuments={documents.length}
        totalSessions={sessions.length}
        totalExams={exams.length}
      />
    </div>
  );
}
