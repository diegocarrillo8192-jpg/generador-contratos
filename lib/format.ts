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
];

export function fechaLarga(iso: string): string {
  if (!iso) return "____________________";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return iso;
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

export function fechaCorta(iso: string): string {
  if (!iso) return "__________";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function ordinalClausula(i: number): string {
  if (i >= 1 && i <= ORDINALES.length) return ORDINALES[i - 1];
  return `CLÁUSULA NÚMERO ${i}`;
}

export function dinero(n: string): string {
  const num = Number(String(n).replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) return String(n);
  return `B/. ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dineroUSD(n: string): string {
  const num = Number(String(n).replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) return String(n);
  return `US$ ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function diasEntre(inicioIso: string, finIso: string): number {
  if (!inicioIso || !finIso) return 0;
  const a = new Date(inicioIso + "T00:00:00");
  const b = new Date(finIso + "T00:00:00");
  const ms = b.getTime() - a.getTime();
  const dias = Math.round(ms / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
}

export function capitalizar(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
