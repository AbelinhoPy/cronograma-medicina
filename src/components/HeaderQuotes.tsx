"use client";

import React, { useState, useEffect, useRef } from "react";
import { STUDY_PHRASES } from "@/lib/constants";
import { Play, Pause } from "lucide-react";

export function HeaderQuotes() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const currentPhrase = STUDY_PHRASES[index];
    const wordCount = currentPhrase.split(/\s+/).length;
    const delay = Math.max(8500, wordCount * 450);

    timerRef.current = setTimeout(() => {
      // Check prefers-reduced-motion
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!prefersReduced) {
        setIsChanging(true);
      }

      setTimeout(
        () => {
          setIndex((prev) => (prev + 1) % STUDY_PHRASES.length);
          setIsChanging(false);
        },
        prefersReduced ? 0 : 250
      );
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, paused]);

  return (
    <div
      className="max-w-4xl mx-auto mb-3.5 px-3 py-2 flex items-center justify-center gap-3 text-xs md:text-sm text-muted-foreground min-h-[58px] text-center"
      aria-label="Frases para tu camino a ser doctora"
    >
      <p
        className={`flex-1 transition-opacity duration-300 font-medium ${
          isChanging ? "opacity-0" : "opacity-100"
        }`}
      >
        {STUDY_PHRASES[index]}
      </p>
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
        aria-label={
          paused
            ? "Continuar el cambio automático de frases"
            : "Pausar el cambio automático de frases"
        }
        className="flex-none inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 rounded hover:bg-white/60 transition"
      >
        {paused ? (
          <>
            <Play className="w-3 h-3" />
            <span>Continuar</span>
          </>
        ) : (
          <>
            <Pause className="w-3 h-3" />
            <span>Pausar</span>
          </>
        )}
      </button>
    </div>
  );
}
