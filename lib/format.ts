const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ORDINALES = [
  "PRIMERA",
  "SEGUNDA",
  "TERCERA",
  "CUARTA",
  "QUINTA",
  "SEXTA",
  "SÉPTIMA",
  "OCTAVA",
  "NOVENA",
  "DÉCIMA",
  "DÉCIMA PRIMERA",
  "DÉCIMA SEGUNDA",
  "DÉCIMA TERCERA",
  "DÉCIMA CUARTA",
  "DÉCIMA QUINTA",
  "DÉCIMA SEXTA",
  "DÉCIMA SÉPTIMA",
  "DÉCIMA OCTAVA",
  "DÉCIMA NOVENA",
  "VIGÉSIMA",
  "VIGÉSIMA PRIMERA",
  "VIGÉSIMA SEGUNDA",
  "VIGÉSIMA TERCERA",
  "VIGÉSIMA CUARTA",
  "VIGÉSIMA QUINTA",
];

export const BLANCO = "____________________";

function partesFecha(iso: string): [number, number, number] | null {
  if (!iso) return null;
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d || m > 12 || d > 31) return null;
  return [y, m, d];
}

/** 13 de octubre de 2026 */
export function fechaLarga(iso: string): string {
  const p = partesFecha(iso);
  if (!p) return BLANCO;
  return `${p[2]} de ${MESES[p[1] - 1]} de ${p[0]}`;
}

/** trece (13) días del mes de octubre de 2026 — fórmula notarial del encabezado. */
export function fechaLegal(iso: string): string {
  const p = partesFecha(iso);
  if (!p) return "____ días del mes de ____________ de ______";
  const dia = p[2] === 1 ? "un (1) día" : `${apocopar(numeroALetras(p[2])).toLowerCase()} (${p[2]}) días`;
  return `${dia} del mes de ${MESES[p[1] - 1]} de ${p[0]}`;
}

export function fechaCorta(iso: string): string {
  const p = partesFecha(iso);
  if (!p) return "__________";
  return `${String(p[2]).padStart(2, "0")}/${String(p[1]).padStart(2, "0")}/${p[0]}`;
}

export function ordinalClausula(i: number): string {
  if (i >= 1 && i <= ORDINALES.length) return ORDINALES[i - 1];
  return `CLÁUSULA N.° ${i}`;
}

/** Convierte un texto ingresado por el usuario en número. Acepta "1,250.50", "1250,50" y "B/. 1250". */
export function parseMonto(n: string): number | null {
  if (n == null) return null;
  let s = String(n).trim().replace(/[^0-9.,-]/g, "");
  if (!s) return null;
  const ultimaComa = s.lastIndexOf(",");
  const ultimoPunto = s.lastIndexOf(".");
  if (ultimaComa > ultimoPunto) {
    // Formato 1.250,50 o 1250,50
    const decimales = s.length - ultimaComa - 1;
    s = decimales === 3 && ultimoPunto === -1 ? s.replace(/,/g, "") : s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }
  const num = Number(s);
  return Number.isFinite(num) ? num : null;
}

function numFmt(num: number): string {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dinero(n: string): string {
  const num = parseMonto(n);
  if (num === null) return "B/. __________";
  return `B/. ${numFmt(num)}`;
}

export function dineroUSD(n: string): string {
  const num = parseMonto(n);
  if (num === null) return "US$ __________";
  return `US$ ${numFmt(num)}`;
}

export function dineroNum(num: number): string {
  return `B/. ${numFmt(num)}`;
}

const UNIDADES = [
  "",
  "UNO",
  "DOS",
  "TRES",
  "CUATRO",
  "CINCO",
  "SEIS",
  "SIETE",
  "OCHO",
  "NUEVE",
  "DIEZ",
  "ONCE",
  "DOCE",
  "TRECE",
  "CATORCE",
  "QUINCE",
  "DIECISÉIS",
  "DIECISIETE",
  "DIECIOCHO",
  "DIECINUEVE",
  "VEINTE",
  "VEINTIUNO",
  "VEINTIDÓS",
  "VEINTITRÉS",
  "VEINTICUATRO",
  "VEINTICINCO",
  "VEINTISÉIS",
  "VEINTISIETE",
  "VEINTIOCHO",
  "VEINTINUEVE",
];
const DECENAS = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const CENTENAS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

function menorMil(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (r > 0) {
    if (r < 30) partes.push(UNIDADES[r]);
    else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      partes.push(u === 0 ? DECENAS[d] : `${DECENAS[d]} Y ${UNIDADES[u]}`);
    }
  }
  return partes.join(" ");
}

/** Número entero a letras en español (mayúsculas). Soporta hasta 999 999 999 999. */
export function numeroALetras(entero: number): string {
  const n = Math.floor(Math.abs(entero));
  if (n === 0) return "CERO";
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (millones > 0) {
    partes.push(millones === 1 ? "UN MILLÓN" : `${apocopar(numeroALetras(millones))} MILLONES`);
  }
  if (miles > 0) {
    partes.push(miles === 1 ? "MIL" : `${apocopar(menorMil(miles))} MIL`);
  }
  if (resto > 0) partes.push(menorMil(resto));
  return partes.join(" ");
}

/** "VEINTIUNO MIL" → "VEINTIÚN MIL", "UNO" → "UN" */
function apocopar(s: string): string {
  return s.replace(/VEINTIUNO$/, "VEINTIÚN").replace(/UNO$/, "UN");
}

/** MIL DOSCIENTOS CINCUENTA BALBOAS CON 00/100 */
export function montoEnLetras(n: string, moneda: "balboas" | "dolares" = "balboas"): string {
  const num = parseMonto(n);
  if (num === null) return "";
  const entero = Math.floor(Math.abs(num));
  const centavos = Math.round((Math.abs(num) - entero) * 100);
  const nombre =
    moneda === "balboas"
      ? entero === 1
        ? "BALBOA"
        : "BALBOAS"
      : entero === 1
        ? "DÓLAR DE LOS ESTADOS UNIDOS DE AMÉRICA"
        : "DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA";
  const letras = apocopar(numeroALetras(entero));
  const prep = entero >= 1_000_000 && entero % 1_000_000 === 0 ? "DE " : "";
  return `${letras} ${prep}${nombre} CON ${String(centavos).padStart(2, "0")}/100`;
}

/** "MIL DOSCIENTOS CINCUENTA BALBOAS CON 00/100 (B/. 1,250.00)" o solo la cifra si no se desean letras. */
export function montoCompleto(n: string, letras: boolean, moneda: "balboas" | "dolares" = "balboas"): string {
  const cifra = moneda === "balboas" ? dinero(n) : dineroUSD(n);
  const enLetras = letras ? montoEnLetras(n, moneda) : "";
  return enLetras ? `${enLetras} (${cifra})` : cifra;
}

export function diasEntre(inicioIso: string, finIso: string): number {
  if (!inicioIso || !finIso) return 0;
  const a = new Date(inicioIso + "T00:00:00");
  const b = new Date(finIso + "T00:00:00");
  const ms = b.getTime() - a.getTime();
  if (!Number.isFinite(ms)) return 0;
  const dias = Math.round(ms / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
}

export function capitalizar(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function numeroConLetras(n: number): string {
  return `${numeroALetras(n).toLowerCase()} (${n})`;
}
