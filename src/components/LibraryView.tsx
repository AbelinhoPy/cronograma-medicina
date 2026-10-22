"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ExternalLink,
  PlusCircle,
  FileText,
  Filter,
  Check,
  AlertCircle,
  Layers,
  FolderOpen,
} from "lucide-react";
import { DriveDocument, SubjectId } from "@/lib/types";

interface LibraryViewProps {
  initialDocuments: DriveDocument[];
}

export function LibraryView({ initialDocuments }: LibraryViewProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DriveDocument[]>(initialDocuments);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [hideDuplicates, setHideDuplicates] = useState(true);

  // New Summary / PDF modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject_id: "anatomia",
    category_path: "01 Anatomía/Resúmenes de Abel",
    drive_url_or_id: "",
    page_count: "1",
    notes: "",
  });

  const subjects = [
    { id: "all", label: "Todas las materias" },
    { id: "anatomia", label: "Anatomía", color: "#2776db" },
    { id: "histologia", label: "Histología", color: "#8651cf" },
    { id: "biologia", label: "Biología", color: "#169477" },
    { id: "biofisica", label: "Biofísica", color: "#d18a13" },
    { id: "bioestadistica", label: "Bioestadística", color: "#64718a" },
  ];

  // Filtering
  const filteredDocs = documents.filter((doc) => {
    if (hideDuplicates && doc.is_duplicate) return false;
    if (selectedSubject !== "all" && doc.subject_id !== selectedSubject) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchCat = doc.category_path.toLowerCase().includes(q);
      const matchSub = doc.subject_id.toLowerCase().includes(q);
      return matchTitle || matchCat || matchSub;
    }
    return true;
  });

  function formatBytes(bytes: number) {
    if (!bytes || bytes === 0) return "0 KB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  async function handleCreateDocument(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          page_count: Number(formData.page_count) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al agregar el resumen.");
      }

      setSubmitSuccess("¡Resumen agregado correctamente a la biblioteca y base de datos!");
      setDocuments((prev) => [data.document, ...prev]);
      router.refresh();
      setFormData({
        title: "",
        subject_id: "anatomia",
        category_path: "01 Anatomía/Resúmenes de Abel",
        drive_url_or_id: "",
        page_count: "1",
        notes: "",
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(null);
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Biblioteca de archivos de Drive
          </span>
          <h2 className="text-2xl font-extrabold text-foreground mt-0.5">
            Catálogo Oficial de PDFs y Resúmenes
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Total en catálogo: {documents.length} archivos · {documents.filter((d) => !d.is_duplicate).length} principales y {documents.filter((d) => d.is_duplicate).length} duplicados identificados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#2776db] hover:bg-blue-600 text-white font-bold text-sm shadow-sm transition hover:shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Agregar nuevo resumen a Drive</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, tema o carpeta..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9fc] border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#2776db]"
            />
          </div>

          {/* Hide duplicates switch */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground select-none px-2">
            <input
              type="checkbox"
              checked={hideDuplicates}
              onChange={(e) => setHideDuplicates(e.target.checked)}
              className="w-4 h-4 rounded text-[#2776db] focus:ring-0"
            />
            <span>Ocultar duplicados exactos (6 copias)</span>
          </label>
        </div>

        {/* Subject Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? "bg-hero text-white shadow-sm"
                    : "bg-[#f7f9fc] text-muted-foreground hover:text-foreground hover:bg-slate-200"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isDup = doc.is_duplicate;
          return (
            <div
              key={doc.id}
              className={`bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                isDup ? "opacity-75 border-dashed" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 truncate">
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400 flex-none" />
                    <span className="truncate">{doc.category_path}</span>
                  </span>

                  {isDup && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-none">
                      Copia idéntica
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2 mb-2">
                  {doc.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="font-semibold text-slate-700">
                    {doc.page_count} páginas
                  </span>
                  <span>•</span>
                  <span>{formatBytes(doc.size_bytes)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-muted-foreground capitalize">
                  {doc.subject_id}
                </span>

                <a
                  href={doc.view_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#2776db] hover:bg-[#2776db] hover:text-white text-xs font-bold transition shadow-2xs"
                >
                  <span>Abrir en Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding new PDF / summary */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-foreground">
                Agregar nuevo resumen a Drive
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Sube tu archivo a tu carpeta de Google Drive, copia el enlace o ID de archivo y regístralo aquí. Se sincronizará inmediatamente en la base de datos de Yanina.
            </p>

            {submitError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-none text-red-500" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-none text-emerald-600" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Título del resumen o PDF *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej: Resumen_Articulaciones_Miembro_Inferior.pdf"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-[#f7f9fc] text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Materia *</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-[#f7f9fc] text-foreground font-medium"
                  >
                    <option value="anatomia">Anatomía</option>
                    <option value="histologia">Histología</option>
                    <option value="biologia">Biología</option>
                    <option value="biofisica">Biofísica</option>
                    <option value="bioestadistica">Bioestadística</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Cantidad de páginas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.page_count}
                    onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl text-xs bg-[#f7f9fc] text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Enlace o ID de archivo de Google Drive *
                </label>
                <input
                  type="text"
                  required
                  value={formData.drive_url_or_id}
                  onChange={(e) =>
                    setFormData({ ...formData, drive_url_or_id: e.target.value })
                  }
                  placeholder="https://drive.google.com/file/d/.../view o ID directo"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-[#f7f9fc] text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Carpeta / Categoría
                </label>
                <input
                  type="text"
                  value={formData.category_path}
                  onChange={(e) =>
                    setFormData({ ...formData, category_path: e.target.value })
                  }
                  placeholder="ej: 01 Anatomía/Resúmenes de Abel"
                  className="w-full p-2.5 border border-border rounded-xl text-xs bg-[#f7f9fc] text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotaciones sobre este material..."
                  className="w-full p-2 border border-border rounded-xl text-xs bg-[#f7f9fc] text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2776db] text-white font-bold hover:bg-blue-600 transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar en catálogo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
