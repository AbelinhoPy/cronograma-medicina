export const TIMEZONE = "America/Asuncion";

/**
 * Returns today's date in YYYY-MM-DD format according to America/Asuncion timezone.
 */
export function getTodayAsuncion(): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }
}

/**
 * Adds an integer number of days to a YYYY-MM-DD string without UTC skew.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Checks if a given YYYY-MM-DD is a Sunday.
 */
export function isSundayDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return date.getUTCDay() === 0;
}

/**
 * Formats YYYY-MM-DD into human-friendly Spanish string, e.g. "Miércoles 21 de octubre de 2026".
 */
export function formatSpanishDate(dateStr: string, options?: { short?: boolean; includeYear?: boolean }): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));

  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const weekday = dayNames[date.getUTCDay()];
  const monthName = monthNames[m - 1];

  if (options?.short) {
    return `${d}/${m.toString().padStart(2, "0")}`;
  }

  if (options?.includeYear) {
    return `${weekday} ${d} de ${monthName} de ${y}`;
  }

  return `${weekday} ${d} de ${monthName}`;
}
