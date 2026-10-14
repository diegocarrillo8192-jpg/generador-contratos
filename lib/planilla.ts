/**
 * Estimaciones referenciales de planilla para la República de Panamá.
 * Las tasas son editables en la interfaz; verifique siempre las vigentes con la CSS y la DGI.
 */

export interface Tasas {
  cssTrabajador: number;
  seTrabajador: number;
  cssEmpleador: number;
  seEmpleador: number;
  riesgos: number;
}

/** Cuota patronal CSS escalonada: 13.25% (abr-2025 a feb-2027), 14.25% (mar-2027 a feb-2029), 15.25% (desde mar-2029). */
export function cssPatronalVigente(fechaIso: string): number {
  const f = fechaIso || new Date().toISOString().slice(0, 10);
  if (f >= "2029-03-01") return 15.25;
  if (f >= "2027-03-01") return 14.25;
  return 13.25;
}

export function tasasPorDefecto(fechaIso: string): Tasas {
  return {
    cssTrabajador: 9.75,
    seTrabajador: 1.25,
    cssEmpleador: cssPatronalVigente(fechaIso),
    seEmpleador: 1.5,
    riesgos: 0.98,
  };
}

/** ISR anual de asalariados: 0% hasta 11,000; 15% del excedente hasta 50,000; 5,850 + 25% del excedente sobre 50,000. */
export function isrAnual(ingresoAnual: number): number {
  if (ingresoAnual <= 11000) return 0;
  if (ingresoAnual <= 50000) return (ingresoAnual - 11000) * 0.15;
  return 5850 + (ingresoAnual - 50000) * 0.25;
}

export interface ResultadoPlanilla {
  bruto: number;
  cssTrabajador: number;
  seTrabajador: number;
  isr: number;
  neto: number;
  cssEmpleador: number;
  seEmpleador: number;
  riesgos: number;
  provisionXiii: number;
  provisionVacaciones: number;
  costoMensual: number;
  costoAnual: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function calcularPlanilla(salarioMensual: number, t: Tasas): ResultadoPlanilla {
  const s = Math.max(0, salarioMensual);
  // Cada concepto se redondea antes de sumar para que el neto cuadre con el desglose.
  const cssT = r2((s * t.cssTrabajador) / 100);
  const seT = r2((s * t.seTrabajador) / 100);
  // Proyección anual: 12 salarios + XIII mes (≈ salario × 13)
  const isr = r2(isrAnual(s * 13) / 12);
  const cssE = r2((s * t.cssEmpleador) / 100);
  const seE = r2((s * t.seEmpleador) / 100);
  const rp = r2((s * t.riesgos) / 100);
  const xiii = r2(s / 12);
  const vac = r2(s / 11);
  const costoMensual = s + cssE + seE + rp + xiii + vac;
  return {
    bruto: r2(s),
    cssTrabajador: r2(cssT),
    seTrabajador: r2(seT),
    isr: r2(isr),
    neto: r2(s - cssT - seT - isr),
    cssEmpleador: r2(cssE),
    seEmpleador: r2(seE),
    riesgos: r2(rp),
    provisionXiii: r2(xiii),
    provisionVacaciones: r2(vac),
    costoMensual: r2(costoMensual),
    costoAnual: r2(costoMensual * 12),
  };
}

export const ITBMS = 7;
