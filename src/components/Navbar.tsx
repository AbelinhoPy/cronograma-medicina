"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarRange,
  BookMarked,
  TrendingUp,
  Settings,
  Printer,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Hoy", icon: CalendarDays },
    { href: "/calendario", label: "Calendario", icon: CalendarRange },
    { href: "/biblioteca", label: "Biblioteca (PDF)", icon: BookMarked },
    { href: "/avance", label: "Mi Avance", icon: TrendingUp },
    { href: "/admin", label: "Administración", icon: Settings },
  ];

  return (
    <div className="space-y-4 my-6">
      {/* Top Navigation Tabs */}
      <nav className="flex items-center gap-1.5 p-1.5 bg-white border border-border rounded-2xl overflow-x-auto shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-hero text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#f3f5fa]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Toolbar & Subject Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-white border border-border rounded-full px-3 py-1 font-semibold border-l-4 border-l-[#2776db]">
            A · Anatomía
          </span>
          <span className="bg-white border border-border rounded-full px-3 py-1 font-semibold border-l-4 border-l-[#8651cf]">
            H · Histología
          </span>
          <span className="bg-white border border-border rounded-full px-3 py-1 font-semibold border-l-4 border-l-[#169477]">
            B · Biología
          </span>
          <span className="bg-white border border-border rounded-full px-3 py-1 font-semibold border-l-4 border-l-[#d18a13]">
            Bf · Biofísica
          </span>
          <span className="bg-white border border-border rounded-full px-3 py-1 font-semibold border-l-4 border-l-[#2776db]">
            MI · Entrega
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#202f4a] text-white hover:bg-hero text-xs font-semibold shadow-sm transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>
    </div>
  );
}
