import type { FormData, Persona } from "./types";
import { HORAS_MAXIMAS } from "./types";
import { diasEntre, parseMonto } from "./format";
import { parseLista } from "./legal";
import type { DocModel } from "./doc";

export type Nivel = "error" | "aviso" | "sugerencia";

export type SeccionId =
  | "tipo"
  | "parteA"
  | "parteB"
  | "condiciones"
  | "labores"
  | "clausulas"
  | "firmas"
  | "formato";

export interface Hallazgo {
  id: string;
  nivel: Nivel;
  seccion: SeccionId;
  /** id del input a enfocar al hacer clic */
  campo?: string;
  mensaje: string;
}

export interface Revision {
  hallazgos: Hallazgo[];
  completitud: number;
  porSeccion: Record<SeccionId, { total: number; listos: number }>;
}

const RE_CEDULA = /^(?:(?:[1-9]|1[0-3])(?:AV|PI)?|PE|E|N)-\d{1,4}-\d{1,6}$/i;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function cedulaValida(c: string): boolean {
  return RE_CEDULA.test(c.trim().replace(/\s+/g, ""));
}

interface Requisito {
  seccion: SeccionId;
  campo: string;
  etiqueta: string;
  ok: boolean;
}

function requisitosPersona(p: Persona, prefix: string, seccion: SeccionId, rol: string): Requisito[] {
  const r: Requisito[] = [
    {
      seccion,
      campo: `${prefix}-nombre`,
      etiqueta: `${rol}: ${p.tipo === "juridica" ? "razón social" : "nombre completo"}`,
      ok: !!p.nombre.trim(),
    },
    {
      seccion,
      campo: `${prefix}-cedula`,
      etiqueta: `${rol}: cédula${p.tipo === "juridica" ? " del representante" : ""}`,
      ok: !!p.cedula.trim(),
    },
    { seccion, campo: `${prefix}-direccion`, etiqueta: `${rol}: dirección exacta`, ok: !!p.direccion.trim() },
  ];
  if (p.tipo === "juridica") {
    r.push(
      { seccion, campo: `${prefix}-representante`, etiqueta: `${rol}: representante legal`, ok: !!p.representante.trim() },
      { seccion, campo: `${prefix}-ruc`, etiqueta: `${rol}: RUC`, ok: !!p.ruc.trim() }
    );
  }
  return r;
}

export function revisar(d: FormData, doc?: DocModel): Revision {
  const servicios = d.tipo === "servicios";
  const A = servicios ? "Contratante" : "Empleador";
  const B = servicios ? "Contratista" : "Trabajador";
  const req: Requisito[] = [
    ...requisitosPersona(d.empleador, "empleador", "parteA", A),
    ...requisitosPersona(d.trabajador, "trabajador", "parteB", B),
  ];

  if (servicios) {
    req.push(
      { seccion: "condiciones", campo: "objeto", etiqueta: "Objeto del contrato", ok: !!d.objeto.trim() },
      { seccion: "condiciones", campo: "honorarios", etiqueta: "Honorarios", ok: parseMonto(d.honorarios) !== null },
      { seccion: "condiciones", campo: "fecha-inicio", etiqueta: "Fecha de inicio", ok: !!d.fechaInicio },
      { seccion: "labores", campo: "funciones", etiqueta: "Entregables", ok: parseLista(d.entregables).length > 0 }
    );
  } else {
    req.push(
      { seccion: "condiciones", campo: "cargo", etiqueta: "Cargo o puesto", ok: !!d.cargo.trim() },
      { seccion: "condiciones", campo: "lugar-trabajo", etiqueta: "Lugar de trabajo", ok: !!d.lugarTrabajo.trim() },
      { seccion: "condiciones", campo: "fecha-inicio", etiqueta: "Fecha de inicio", ok: !!d.fechaInicio },
      { seccion: "condiciones", campo: "salario", etiqueta: "Salario", ok: parseMonto(d.salario) !== null },
      { seccion: "labores", campo: "funciones", etiqueta: "Funciones del cargo", ok: parseLista(d.funciones).length > 0 }
    );
    if (d.tipo === "definido") {
      req.push({ seccion: "condiciones", campo: "fecha-fin", etiqueta: "Fecha de finalización", ok: !!d.fechaFin });
    }
    if (d.tipo === "obra") {
      req.push({
        seccion: "tipo",
        campo: "obra-descripcion",
        etiqueta: "Descripción de la obra",
        ok: !!d.obraDescripcion.trim(),
      });
    }
  }
  req.push({ seccion: "labores", campo: "causales", etiqueta: "Causales de terminación", ok: parseLista(d.causales).length > 0 });

  if (d.testigosActivo) {
    req.push(
      { seccion: "firmas", campo: "testigo1-nombre", etiqueta: "Testigo 1: nombre", ok: !!d.testigo1Nombre.trim() },
      { seccion: "firmas", campo: "testigo1-cedula", etiqueta: "Testigo 1: cédula", ok: !!d.testigo1Cedula.trim() },
      { seccion: "firmas", campo: "testigo2-nombre", etiqueta: "Testigo 2: nombre", ok: !!d.testigo2Nombre.trim() },
      { seccion: "firmas", campo: "testigo2-cedula", etiqueta: "Testigo 2: cédula", ok: !!d.testigo2Cedula.trim() }
    );
  }
  if (d.firmaModo === "virtual") {
    req.push(
      { seccion: "firmas", campo: "firma-izquierda", etiqueta: `Firma virtual de ${A.toLowerCase()}`, ok: !!d.firmasVirtuales.izquierda?.img },
      { seccion: "firmas", campo: "firma-derecha", etiqueta: `Firma virtual de ${B.toLowerCase()}`, ok: !!d.firmasVirtuales.derecha?.img }
    );
  }
  if (d.anexoEquipos) {
    req.push({ seccion: "clausulas", campo: "equipos", etiqueta: "Lista de equipos entregados", ok: parseLista(d.equipos).length > 0 });
  }
  req.push(
    { seccion: "formato", campo: "fecha-suscripcion", etiqueta: "Fecha de suscripción", ok: !!d.fechaSuscripcion },
    { seccion: "formato", campo: "ciudad-suscripcion", etiqueta: "Ciudad de suscripción", ok: !!d.ciudadSuscripcion.trim() }
  );

  const hallazgos: Hallazgo[] = req
    .filter((r) => !r.ok)
    .map((r) => ({ id: `falta-${r.campo}`, nivel: "error", seccion: r.seccion, campo: r.campo, mensaje: `Falta: ${r.etiqueta}` }));

  // ---- Validaciones de formato y reglas legales ----
  const personas: Array<[Persona, string, SeccionId, string]> = [
    [d.empleador, "empleador", "parteA", A],
    [d.trabajador, "trabajador", "parteB", B],
  ];
  for (const [p, prefix, seccion, rol] of personas) {
    if (p.cedula.trim() && !cedulaValida(p.cedula)) {
      hallazgos.push({
        id: `ced-${prefix}`,
        nivel: "aviso",
        seccion,
        campo: `${prefix}-cedula`,
        mensaje: `${rol}: la cédula «${p.cedula.trim()}» no tiene el formato habitual (ej.: 8-123-4567, PE-1-234, E-8-12345).`,
      });
    }
    if (p.correo.trim() && !RE_CORREO.test(p.correo.trim())) {
      hallazgos.push({ id: `mail-${prefix}`, nivel: "aviso", seccion, campo: `${prefix}-correo`, mensaje: `${rol}: el correo no parece válido.` });
    }
    if (p.ruc.trim() && !p.dv.trim()) {
      hallazgos.push({ id: `dv-${prefix}`, nivel: "aviso", seccion, campo: `${prefix}-dv`, mensaje: `${rol}: indique el Dígito Verificador (DV) del RUC.` });
    }
  }

  if (!servicios) {
    const horas = parseMonto(d.horasSemanales);
    const max = HORAS_MAXIMAS[d.jornada];
    if (horas !== null && horas > max) {
      hallazgos.push({
        id: "horas",
        nivel: "error",
        seccion: "condiciones",
        campo: "horas-semanales",
        mensaje: `La jornada ${d.jornada} admite como máximo ${max} horas semanales (Art. 31 C.T.). Indicó ${horas}.`,
      });
    }
    const sal = parseMonto(d.salario);
    if (sal !== null && sal <= 0) {
      hallazgos.push({ id: "sal0", nivel: "error", seccion: "condiciones", campo: "salario", mensaje: "El salario debe ser mayor que cero." });
    } else if (sal !== null && sal < 300) {
      hallazgos.push({
        id: "salmin",
        nivel: "aviso",
        seccion: "condiciones",
        campo: "salario",
        mensaje: "El salario parece bajo. Verifique el salario mínimo vigente para la actividad y región (MITRADEL).",
      });
    }
    if (d.tipo === "indefinido" && d.periodoPrueba) {
      const m = parseMonto(d.mesesPrueba);
      if (m !== null && m > 3) {
        hallazgos.push({
          id: "prueba",
          nivel: "error",
          seccion: "condiciones",
          campo: "meses-prueba",
          mensaje: "El período de prueba no puede exceder 3 meses (Art. 78 C.T.). Se usará 3 en el documento.",
        });
      }
    }
    if (d.tipo === "definido" && d.fechaInicio && d.fechaFin) {
      const dias = diasEntre(d.fechaInicio, d.fechaFin);
      if (dias <= 0) {
        hallazgos.push({ id: "fechas", nivel: "error", seccion: "condiciones", campo: "fecha-fin", mensaje: "La fecha de finalización debe ser posterior a la de inicio." });
      } else if (dias > 366) {
        hallazgos.push({
          id: "anio",
          nivel: "aviso",
          seccion: "condiciones",
          campo: "fecha-fin",
          mensaje: `El contrato por tiempo definido no debe exceder 1 año (hasta 3 años si requiere preparación técnica especial · Art. 74 C.T.). Duración actual: ${dias} días.`,
        });
      }
    }
    if (!d.confidencialidad) {
      hallazgos.push({
        id: "nda",
        nivel: "sugerencia",
        seccion: "clausulas",
        mensaje: "Considere incluir la cláusula de confidencialidad y protección de datos (Ley 81 de 2019).",
      });
    }
  } else {
    if (d.fechaInicio && d.fechaFin && diasEntre(d.fechaInicio, d.fechaFin) <= 0) {
      hallazgos.push({ id: "fechas-s", nivel: "error", seccion: "condiciones", campo: "fecha-fin", mensaje: "La fecha de fin debe ser posterior a la de inicio." });
    }
    const pd = parseMonto(d.penalidadDia);
    const pt = parseMonto(d.penalidadTecho);
    if (pd !== null && pt !== null && pd > pt) {
      hallazgos.push({ id: "pen", nivel: "aviso", seccion: "condiciones", campo: "penalidad-dia", mensaje: "La penalidad diaria es mayor que el tope máximo." });
    }
    if (d.trabajador.tipo === "natural" && !d.trabajador.ruc.trim()) {
      hallazgos.push({
        id: "ruc-ct",
        nivel: "sugerencia",
        seccion: "parteB",
        campo: "trabajador-ruc",
        mensaje: "El contratista independiente normalmente debe tener RUC para facturar sus honorarios.",
      });
    }
  }

  if (!servicios && d.fechaSuscripcion && d.fechaInicio && diasEntre(d.fechaInicio, d.fechaSuscripcion) > 0) {
    hallazgos.push({
      id: "susc",
      nivel: "aviso",
      seccion: "formato",
      campo: "fecha-suscripcion",
      mensaje: "La fecha de firma es posterior al inicio. El contrato laboral debe firmarse al inicio de la relación (Art. 67 C.T.).",
    });
  }

  if (doc) {
    const firmadas = [doc.firmas.izquierda, doc.firmas.derecha, ...doc.testigos].filter((f) => f.img);
    const viejas = firmadas.filter((f) => f.desactualizada);
    if (viejas.length > 0) {
      hallazgos.push({
        id: "firma-vieja",
        nivel: "error",
        seccion: "firmas",
        mensaje: `El contrato cambió después de firmar (${viejas.map((f) => f.titulo.toLowerCase()).join(", ")}). Vuelva a firmar para que la firma corresponda al texto actual.`,
      });
    }
  }

  const secciones: SeccionId[] = ["tipo", "parteA", "parteB", "condiciones", "labores", "clausulas", "firmas", "formato"];
  const porSeccion = Object.fromEntries(secciones.map((s) => [s, { total: 0, listos: 0 }])) as Revision["porSeccion"];
  for (const r of req) {
    porSeccion[r.seccion].total += 1;
    if (r.ok) porSeccion[r.seccion].listos += 1;
  }
  const listos = req.filter((r) => r.ok).length;
  const orden: Record<Nivel, number> = { error: 0, aviso: 1, sugerencia: 2 };
  hallazgos.sort((a, b) => orden[a.nivel] - orden[b.nivel]);

  return {
    hallazgos,
    completitud: req.length ? Math.round((listos / req.length) * 100) : 100,
    porSeccion,
  };
}
