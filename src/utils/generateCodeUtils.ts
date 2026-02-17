import { randomBytes } from "crypto";

function generateUniqueCode(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(length);
  return (
    "CERTOIL-" +
    Array.from(bytes)
      .map((byte) => chars[byte % chars.length])
      .join("")
      .slice(0, length)
  );
}

/**
 * Genera un codice univoco verificando che non esista già nel DB.
 * Riprova automaticamente in caso di collisione (max 5 tentativi).
 *
 * @param checkExists - Funzione che interroga il DB: restituisce true se il codice esiste già
 */
export async function generateSafeUniqueCode(
  checkExists: (code: string) => Promise<boolean>,
  length = 10,
  maxRetries = 5,
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const code = generateUniqueCode(length);
    const exists = await checkExists(code);
    if (!exists) return code;

    console.warn(`Codice duplicato al tentativo ${attempt}, rigenerazione...`);
  }

  throw new Error(`Impossibile generare un codice univoco dopo ${maxRetries} tentativi.`);
}
