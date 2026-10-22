"use client";

import React from "react";
import { Sparkles, Calendar, BookOpen } from "lucide-react";

interface HeroSectionProps {
  totalDays?: number;
  totalExams?: number;
}

export function HeroSection({
  totalDays = 48,
  totalExams = 8,
}: HeroSectionProps) {
  return (
    <header className="bg-hero text-white rounded-3xl p-6 md:p-9 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#8ad4cf]">
          <Sparkles className="w-4 h-4 text-[#8ad4cf]" />
          <span>Primer año · Medicina · Yanina</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Una materia a la vez.
          <br />
          Un paso hacia tus finales.
        </h1>
        <p className="text-sm md:text-base text-[#cad4e7] max-w-2xl">
          Plan de estudio con tus 75 PDFs de Google Drive y bolillero de 25
          bolillas. 21 de octubre — 7 de diciembre de 2026.
        </p>
      </div>

      <div className="hidden sm:flex flex-row md:flex-col gap-3 min-w-[170px] bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 text-center">
        <div>
          <strong className="block text-3xl font-extrabold text-white">
            {totalDays} días
          </strong>
          <span className="text-xs text-[#cad4e7] font-medium">
            {totalExams} evaluaciones
          </span>
        </div>
        <div className="pt-2 border-t border-white/10 text-xs text-[#8ad4cf] font-medium flex items-center justify-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Plan ajustable</span>
        </div>
      </div>
    </header>
  );
}
