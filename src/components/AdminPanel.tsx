"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  PlusCircle,
  RefreshCw,
  FolderSync,
  AlertCircle,
  Check,
  ShieldCheck,
  BookOpen,
  Calendar,
} from "lucide-react";

interface AdminPanelProps {
  totalDocuments: number;
  totalSessions: number;
  totalExams: number;
}

export function AdminPanel({
  totalDocuments,
  totalSessions,
  totalExams,
}: AdminPanelProps) {
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [docFeedback, setDocFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject_id: "anatomia",
    category_path: "01 Anatomía/Resúmenes de Abel",
    drive_url_or_id: "",
    page_count: "1",
    notes: "",
  });

  async function handleAddSummary(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingDoc(true);
    setDocFeedback(null);

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

      setDocFeedback({
        type: "success",
        text: `¡Resumen "${data.document.title}" registrado correctamente en la base de datos!`,
      });

      setFormData({
        title: "",
        subject_id: "anatomia",
        category_path: "01 Anatomía/Resúmenes de Abel",
        drive_url_or_id: "",
        page_count: "1",
        notes: "",
      });
    } catch (err: any) {
      setDocFeedback({
        type: "error",
        text: err.message || "Error al comunicarse con la base de datos.",
      });
    } finally {
      setIsSubmittingDoc(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-[#2776db]" />
            <span>Panel de Control Administrativo · Abel</span>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mt-0.5">
            Administración del Cronograma y Resúmenes
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Gestiona los archivos de Google Drive, agrega nuevos resúmenes y sincroniza el plan sin perder el progreso de Yanina.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 px-3.5 py-2 rounded-2xl text-slate-800">
          <Database className="w-4 h-4 text-[#169477]" />
          <span>Neon Postgres Conectado</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase">PDFs y Resúmenes</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{totalDocuments}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase">Bloques de Estudio</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{totalSessions}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase">Evaluaciones Oficiales</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{totalExams}</div>
        </div>
      </div>

      {/* Main Section: Add New Summary / PDF */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-foreground">
              Agregar nuevo resumen o material de Drive
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ideal para cuando creas nuevos apuntes o guías de estudio y los subes a tu Google Drive.
            </p>
          </div>
          <PlusCircle className="w-5 h-5 text-[#2776db]" />
        </div>

        {docFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              docFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {docFeedback.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 flex-none" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-none" />
            )}
            <span>{docFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleAddSummary} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-foreground mb-1">
                Título del archivo o resumen *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ej: Bolilla_01_Osteoarticular_Resumen.pdf"
                className="w-full p-2.5 bg-[#f7f9fc] border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-[#2776db]"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Materia *</label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full p-2.5 bg-[#f7f9fc] border border-border rounded-xl text-xs text-foreground font-semibold"
              >
                <option value="anatomia">Anatomía (#2776db)</option>
                <option value="histologia">Histología (#8651cf)</option>
                <option value="biologia">Biología (#169477)</option>
                <option value="biofisica">Biofísica (#d18a13)</option>
                <option value="bioestadistica">Bioestadística (#64718a)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block font-bold text-foreground mb-1">
                Enlace de Google Drive o File ID *
              </label>
              <input
                type="text"
                required
                value={formData.drive_url_or_id}
                onChange={(e) => setFormData({ ...formData, drive_url_or_id: e.target.value })}
                placeholder="https://drive.google.com/file/d/1u1v.../view?usp=drivesdk"
                className="w-full p-2.5 bg-[#f7f9fc] border border-border rounded-xl text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                Páginas físicas *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.page_count}
                onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                className="w-full p-2.5 bg-[#f7f9fc] border border-border rounded-xl text-xs text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-foreground mb-1">
                Carpeta / Categoría
              </label>
              <input
                type="text"
                value={formData.category_path}
                onChange={(e) => setFormData({ ...formData, category_path: e.target.value })}
                placeholder="ej: 01 Anatomía/Resúmenes de Abel"
                className="w-full p-2.5 bg-[#f7f9fc] border border-border rounded-xl text-xs text-foreground"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                Anotaciones pedagógicas
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ej: Resumen sintetizado con esquemas anatómicos para repasar rápido"
                className="w-full p-2.5 bg-[#f7f9fc] border border-border rounded-xl text-xs text-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingDoc}
            className="px-6 py-3 rounded-2xl bg-[#2776db] text-white font-bold hover:bg-blue-600 transition shadow-sm disabled:opacity-50"
          >
            {isSubmittingDoc ? "Guardando en Neon..." : "Guardar Resumen en la Base de Datos"}
          </button>
        </form>
      </div>

      {/* Guide for Google Drive permissions */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="text-lg font-extrabold text-foreground">
          Instrucciones de Acceso a Google Drive
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          La carpeta principal de Drive (<code>1_0-8ExeG1iuGWf_UdTEhtTwD6JpTPxCa</code>) es privada en tu cuenta. Iniciar sesión en esta aplicación web no otorga acceso técnico a Drive. Recuerda:
        </p>
        <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-1.5 font-medium">
          <li>
            Cuando tengas el correo oficial de Yanina, abre la carpeta principal en Google Drive.
          </li>
          <li>
            Pulsa en <strong>Compartir</strong> y agrégala con rol de <strong>Lector</strong>.
          </li>
          <li>
            De esta forma, cuando ella pulse «Abrir en Drive» desde su computadora o celular, el visor oficial de Google le permitirá abrirlo al instante con su cuenta.
          </li>
        </ol>
      </div>
    </div>
  );
}
