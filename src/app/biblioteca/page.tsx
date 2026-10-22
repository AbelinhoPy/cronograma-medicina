export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAllDocuments } from "@/lib/data";
import { LibraryView } from "@/components/LibraryView";

export default async function BibliotecaPage() {
  const documents = await getAllDocuments();

  return (
    <div className="space-y-6">
      <LibraryView initialDocuments={documents} />
    </div>
  );
}
