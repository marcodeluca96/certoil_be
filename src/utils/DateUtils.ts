/**
 * dateUtils.ts
 * Funzioni di conversione e gestione date tra Frontend (ISO 8601) e MySQL
 *
 * Frontend → ISO 8601:  "2026-12-31T00:00:00.000Z"
 * MySQL DATETIME:        "2026-12-31 23:59:59"
 * MySQL DATE:            "2026-12-31"
 */

// ─────────────────────────────────────────────────────────────
// TIPI
// ─────────────────────────────────────────────────────────────

/** Stringa ISO 8601 come arriva dal frontend */
type ISODateString = string;

/** Formato DATETIME MySQL: "2026-12-31 23:59:59" */
type MySQLDateTime = string;

/** Formato DATE MySQL: "2026-12-31" */
type MySQLDate = string;

// ─────────────────────────────────────────────────────────────
// FRONTEND → MYSQL
// ─────────────────────────────────────────────────────────────

/**
 * Converte una data ISO dal frontend in formato DATETIME MySQL.
 * "2026-12-31T00:00:00.000Z" → "2026-12-31 00:00:00"
 *
 * @param toLocalTime - Se true usa ora locale, altrimenti UTC (default)
 */
export function isoToMySQLDateTime(
  isoString: ISODateString | null | undefined,
  toLocalTime = false,
): MySQLDateTime | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;

  if (toLocalTime) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    const secs = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const mins = String(date.getUTCMinutes()).padStart(2, "0");
  const secs = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

/**
 * Converte una data ISO dal frontend in formato DATE MySQL (solo data).
 * "2026-12-31T00:00:00.000Z" → "2026-12-31"
 */
export function isoToMySQLDate(isoString: ISODateString | null | undefined): MySQLDate | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─────────────────────────────────────────────────────────────
// MYSQL → FRONTEND
// ─────────────────────────────────────────────────────────────

/**
 * Converte un DATETIME MySQL in stringa ISO 8601 per il frontend.
 * "2026-12-31 23:59:59" → "2026-12-31T23:59:59.000Z"
 *
 * Accetta anche un oggetto Date (come restituisce mysql2/typeorm).
 */
export function mySQLDateTimeToISO(
  mysqlDateTime: MySQLDateTime | Date | null | undefined,
): ISODateString | null {
  if (!mysqlDateTime) return null;
  if (mysqlDateTime instanceof Date) {
    return isNaN(mysqlDateTime.getTime()) ? null : mysqlDateTime.toISOString();
  }
  // Rimpiazza lo spazio con T e aggiunge Z per indicare UTC
  const normalized = (mysqlDateTime as string).replace(" ", "T") + "Z";
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Converte una DATE MySQL in stringa ISO 8601 per il frontend.
 * "2026-12-31" → "2026-12-31T00:00:00.000Z"
 */
export function mySQLDateToISO(
  mysqlDate: MySQLDate | Date | null | undefined,
): ISODateString | null {
  if (!mysqlDate) return null;
  if (mysqlDate instanceof Date) {
    return isNaN(mysqlDate.getTime()) ? null : mysqlDate.toISOString();
  }
  const date = new Date(`${mysqlDate}T00:00:00.000Z`);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

// ─────────────────────────────────────────────────────────────
// VALIDAZIONE
// ─────────────────────────────────────────────────────────────

/** Verifica se una stringa è una data ISO valida */
export function isValidISODate(isoString: unknown): isoString is ISODateString {
  if (typeof isoString !== "string" || !isoString.trim()) return false;
  return !isNaN(new Date(isoString).getTime());
}

/** Verifica se una stringa è un DATETIME MySQL valido: "2026-12-31 23:59:59" */
export function isValidMySQLDateTime(value: unknown): value is MySQLDateTime {
  if (typeof value !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/;
  return regex.test(value) && !isNaN(new Date(value.replace(" ", "T") + "Z").getTime());
}

/** Verifica se una stringa è una DATE MySQL valida: "2026-12-31" */
export function isValidMySQLDate(value: unknown): value is MySQLDate {
  if (typeof value !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(value) && !isNaN(new Date(value + "T00:00:00Z").getTime());
}

// ─────────────────────────────────────────────────────────────
// UTILITÀ EXTRA
// ─────────────────────────────────────────────────────────────

/** Restituisce il DATETIME MySQL corrente in UTC. Utile per created_at / updated_at */
export function nowToMySQLDateTime(): MySQLDateTime {
  return isoToMySQLDateTime(new Date().toISOString()) as MySQLDateTime;
}

/** Restituisce la DATE MySQL corrente in UTC */
export function todayToMySQLDate(): MySQLDate {
  return isoToMySQLDate(new Date().toISOString()) as MySQLDate;
}

/**
 * Calcola la differenza in giorni tra due date ISO.
 * Positivo = isoTo è nel futuro rispetto a isoFrom.
 */
export function daysBetween(isoFrom: ISODateString, isoTo: ISODateString): number | null {
  const from = new Date(isoFrom);
  const to = new Date(isoTo);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/** Controlla se una data ISO è già scaduta rispetto ad oggi (UTC) */
export function isExpired(isoString: ISODateString | null | undefined): boolean {
  if (!isoString) return true;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return true;
  return date.getTime() < Date.now();
}

/**
 * Formatta una data ISO in formato leggibile italiano.
 * "2026-12-31T00:00:00.000Z" → "31/12/2026"
 * Con orario: "31/12/2026 00:00"
 */
export function formatItalianDate(
  isoString: ISODateString | null | undefined,
  includeTime = false,
): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  if (!includeTime) return `${day}/${month}/${year}`;
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const mins = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
}
