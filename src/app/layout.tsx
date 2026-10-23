import type { Metadata } from "next";
import "./globals.css";
import { HeaderQuotes } from "@/components/HeaderQuotes";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Mi ruta a los finales · Medicina",
  description:
    "Aplicación de estudio para Yanina, alumna de primer año de Medicina. Calendario de estudio, biblioteca de 77 PDFs en Drive y seguimiento de avance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased text-foreground">
        <main className="max-w-[1440px] mx-auto p-4 md:p-9">
          <HeaderQuotes />
          <HeroSection totalDays={48} totalExams={8} />
          <Navbar />
          {children}
          <footer className="mt-12 py-6 border-t border-border text-center text-xs text-muted-foreground space-y-1">
            <p>
              Mi ruta a los finales · Medicina — Creado con dedicación para la futura Dra. Yanina.
            </p>
            <p className="text-[11px] text-slate-400">
              Datos sincronizados con Neon PostgreSQL · Biblioteca privada en Google Drive.
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}
