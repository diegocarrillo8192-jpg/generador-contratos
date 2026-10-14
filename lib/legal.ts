import type { FirmaVirtual, Firmante, FormData, Persona } from "./types";
import { HORAS_MAXIMAS } from "./types";
import {
  type DocModel,
  type Block,
  type FirmaBloque,
  bloqueFirma,
  encabezadoContrato,
  huellaTexto,
  renderTextoTxt,
} from "./doc";
import { clausulasDisponibles, textoClausula } from "./clausulas";
import {
  BLANCO,
  diasEntre,
  fechaLarga,
  fechaLegal,
  montoCompleto,
  numeroConLetras,
  ordinalClausula,
  parseMonto,
} from "./format";

type Seccion = {
  titulo: string;
  items: Array<string | string[]>;
};

export const NOMBRE_TIPO: Record<FormData["tipo"], string> = {
  definido: "Contrato individual de trabajo · tiempo definido",
  obra: "Contrato individual de trabajo · obra determinada",
  indefinido: "Contrato individual de trabajo · tiempo indefinido",
  servicios: "Contrato de prestación de servicios profesionales",
};

function noVacio(...partes: Array<string | undefined | false>): string {
  return partes.filter((p): p is string => !!p && p.trim().length > 0).join(", ");
}

export function parseLista(multiline: string): string[] {
  return (multiline || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.replace(/^(?:[-*•]|\d{1,2}[.)]|[a-zA-Z][)])\s*/, ""))
    .filter((s) => s.length > 0);
}

function quitarPuntoFinal(s: string): string {
  return s.trim().replace(/[.;,:\s]+$/, "");
}

function mayus(s: string, ph = BLANCO): string {
  const t = (s || "").trim();
  return t ? t.toUpperCase() : ph;
}

function entero(s: string, porDefecto: number): number {
  const n = parseInt(String(s).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : porDefecto;
}

function rucTexto(p: Persona, femenino: boolean): string {
  if (!p.ruc.trim()) return "";
  const prefijo = femenino ? "con Registro Único de Contribuyentes (RUC)" : "inscrito(a) en el Registro Único de Contribuyentes (RUC) con el";
  return `${prefijo} N.° ${p.ruc.trim()}${p.dv.trim() ? `, Dígito Verificador (DV) ${p.dv.trim()}` : ""}`;
}

function detalleFirma(p: Persona): string {
  const partes: string[] = [];
  if (p.tipo === "juridica" && p.representante.trim()) {
    partes.push(`Representante legal: ${p.representante.trim()}`);
  }
  if (p.cedula.trim()) partes.push(`Cédula N.° ${p.cedula.trim()}`);
  if (p.ruc.trim()) partes.push(`RUC N.° ${p.ruc.trim()}${p.dv.trim() ? ` DV ${p.dv.trim()}` : ""}`);
  return partes.join(" · ");
}

function testigosDocumento(d: FormData): FirmaBloque[] {
  if (!d.testigosActivo) return [];
  return [
    bloqueFirma("TESTIGO", d.testigo1Nombre, d.testigo1Cedula.trim() ? `Cédula N.° ${d.testigo1Cedula.trim()}` : undefined),
    bloqueFirma("TESTIGO", d.testigo2Nombre, d.testigo2Cedula.trim() ? `Cédula N.° ${d.testigo2Cedula.trim()}` : undefined),
  ];
}

function anexoEquipos(d: FormData, parte: "EL TRABAJADOR" | "EL CONTRATISTA"): Block[] {
  if (!d.anexoEquipos) return [];
  const lista = parseLista(d.equipos);
  const items = lista.length > 0 ? lista : ["[Descripción del equipo o herramienta entregado]"];
  const laboral = parte === "EL TRABAJADOR";
  const contraparte = laboral ? "EL EMPLEADOR" : "EL CONTRATANTE";
  return [
    {
      t: "h",
      text: "ANEXO ÚNICO · ENTREGA, CUSTODIA Y DEVOLUCIÓN DE EQUIPOS Y HERRAMIENTAS DE TRABAJO",
    },
    {
      t: "p",
      text: `“${parte}” declara haber recibido de “${contraparte}”, a su entera satisfacción, en buen estado de funcionamiento y conservación, los equipos, herramientas y accesorios de trabajo que se detallan a continuación, los cuales serán utilizados exclusivamente para el desempeño de las labores contratadas:`,
    },
    {
      t: "num",
      items: items.map((it) => `${quitarPuntoFinal(it)}. — Recibido: ____/____/______  Firma: ______________`),
    },
    {
      t: "p",
      text: `En consecuencia, “${parte}” asume la responsabilidad por la custodia, cuidado y conservación de los bienes recibidos y se obliga a: (a) utilizarlos únicamente para las labores contratadas y conforme a las instrucciones de “${contraparte}”; (b) no enajenarlos, darlos en garantía, cederlos, prestarlos ni retirarlos del lugar de trabajo sin autorización previa y escrita; (c) mantenerlos en buen estado y reportar de inmediato cualquier daño, pérdida o hurto; y (d) devolverlos en la fecha de terminación de la relación contractual, o dentro de los tres (3) días hábiles siguientes, en el mismo estado en que los recibió, salvo el deterioro normal por su uso.`,
    },
    {
      t: "p",
      text: laboral
        ? `“EL TRABAJADOR” responderá por los daños o pérdidas de los bienes que le sean imputables por dolo o negligencia grave. Cualquier responsabilidad o descuento se hará exclusivamente dentro de los límites y procedimientos establecidos en el Código de Trabajo y demás normas aplicables, sin que ello implique renuncia a los derechos irrenunciables del trabajador.`
        : `“EL CONTRATISTA” responderá por los daños o pérdidas de los bienes que le sean imputables por negligencia, uso indebido, dolo o falta de custodia, de conformidad con la legislación civil y comercial vigente de la República de Panamá.`,
    },
  ];
}

function bloqueCierre(laboral: boolean): Block[] {
  return [
    {
      t: "p",
      text: laboral
        ? "Las partes declaran que conocen el contenido y alcance del presente contrato y de sus anexos, lo aceptan y firman en señal de conformidad en el lugar y la fecha indicados en el encabezamiento, en tres (3) ejemplares de igual tenor y efecto: uno para cada parte y otro para su registro ante el Ministerio de Trabajo y Desarrollo Laboral (MITRADEL), conforme al Artículo 67 del Código de Trabajo."
        : "Las partes declaran que conocen el contenido y alcance del presente contrato y de sus anexos, lo aceptan y firman en señal de conformidad en el lugar y la fecha indicados en el encabezamiento, en dos (2) ejemplares de igual tenor y efecto, uno para cada parte.",
    },
    { t: "sp" },
  ];
}

function marcaDomicilio(p: Persona): string {
  return noVacio(
    p.direccion.trim(),
    p.corregimiento.trim() && `corregimiento de ${p.corregimiento.trim()}`,
    p.distrito.trim() && `distrito de ${p.distrito.trim()}`,
    p.provincia.trim() && `provincia de ${p.provincia.trim()}`,
    "República de Panamá"
  );
}

function personaNaturalTexto(p: Persona, conProfesion: boolean): string {
  const out: string[] = [`el (la) señor(a) ${mayus(p.nombre)}`];
  out.push(`de nacionalidad ${p.nacionalidad.trim() || "panameña"}, mayor de edad`);
  if (conProfesion && p.profesion.trim()) out.push(`de profesión u oficio ${p.profesion.trim()}`);
  out.push(
    p.cedula.trim()
      ? `portador(a) de la Cédula de Identidad Personal N.° ${p.cedula.trim()}`
      : `portador(a) de la Cédula de Identidad Personal N.° ${BLANCO}`
  );
  const ruc = rucTexto(p, false);
  if (ruc) out.push(ruc);
  if (esExtranjero(p) && p.permisoTrabajo.trim()) {
    out.push(`con permiso de trabajo N.° ${p.permisoTrabajo.trim()} expedido por el Ministerio de Trabajo y Desarrollo Laboral`);
  }
  return out.join(", ");
}

export function esExtranjero(p: Persona): boolean {
  const n = p.nacionalidad.trim().toLowerCase();
  return n.length > 0 && !n.startsWith("panameñ") && !n.startsWith("panamen");
}

function personaJuridicaTexto(p: Persona, conGiro: boolean): string {
  const out: string[] = [
    `la sociedad ${mayus(p.nombre)}, persona jurídica debidamente constituida, inscrita y vigente en el Registro Público de Panamá`,
  ];
  if (conGiro && p.profesion.trim()) out.push(`dedicada a ${p.profesion.trim()}`);
  const ruc = rucTexto(p, true);
  if (ruc) out.push(ruc);
  const repr = [`debidamente representada en este acto por ${mayus(p.representante)}`];
  repr.push(
    p.cedula.trim()
      ? `portador(a) de la Cédula de Identidad Personal N.° ${p.cedula.trim()}`
      : `portador(a) de la Cédula de Identidad Personal N.° ${BLANCO}`
  );
  repr.push("con facultades suficientes para este acto");
  out.push(repr.join(", "));
  return out.join(", ");
}

function personaTexto(p: Persona, conProfesion = false): string {
  return p.tipo === "juridica" ? personaJuridicaTexto(p, conProfesion) : personaNaturalTexto(p, conProfesion);
}

function bloqueSecciones(secciones: Seccion[]): Block[] {
  const bloques: Block[] = [];
  let n = 0;
  for (const s of secciones) {
    const contenido = s.items.filter((it) => (typeof it === "string" ? it.trim().length > 0 : it.length > 0));
    if (contenido.length === 0) continue;
    n += 1;
    bloques.push({ t: "clause", n: ordinalClausula(n), text: s.titulo });
    for (const item of contenido) {
      if (typeof item === "string") bloques.push({ t: "p", text: item });
      else bloques.push({ t: "enum", items: item });
    }
  }
  return bloques;
}

function seccionesBiblioteca(d: FormData): Seccion[] {
  const servicios = d.tipo === "servicios";
  const elegidas = new Set(d.clausulasExtra);
  return clausulasDisponibles(servicios)
    .filter((c) => elegidas.has(c.id))
    .map((c) => ({ titulo: c.titulo, items: textoClausula(c, servicios) }));
}

function seccionAdicionales(d: FormData): Seccion | null {
  const lista = parseLista(d.clausulasAdicionales);
  if (lista.length === 0) return null;
  return {
    titulo: "Estipulaciones adicionales",
    items: ["Las partes convienen, además, las siguientes estipulaciones:", lista],
  };
}

/* ------------------------------------------------------------------ */
/* Contrato laboral                                                    */
/* ------------------------------------------------------------------ */

const NOMBRE_JORNADA: Record<FormData["jornada"], string> = {
  diurna: "diurna",
  mixta: "mixta",
  nocturna: "nocturna",
};

const NOMBRE_PERIODO: Record<FormData["periodicidadPago"], string> = {
  semanal: "semanal",
  quincenal: "quincenal",
  mensual: "mensual",
};

function salarioTexto(d: FormData): string {
  const monto = parseMonto(d.salario) === null ? "B/. __________" : montoCompleto(d.salario, d.montoEnLetras);
  const periodo =
    d.periodicidadPago === "mensual"
      ? "pagadero en forma mensual"
      : `pagadero en forma ${NOMBRE_PERIODO[d.periodicidadPago]}, en partes proporcionales`;
  return `“EL EMPLEADOR” pagará a “EL TRABAJADOR”, como remuneración por sus servicios, un salario mensual de ${monto}, ${periodo}, en Balboas (B/.) o su equivalente en dólares de los Estados Unidos de América, moneda de curso legal en la República de Panamá, mediante ${d.formaPago || "transferencia bancaria"}.`;
}

function jornadaTexto(d: FormData): string {
  const max = HORAS_MAXIMAS[d.jornada];
  const horas = entero(d.horasSemanales, max);
  const horario = d.horario.trim() ? `, en el horario de ${quitarPuntoFinal(d.horario)}` : "";
  return `“EL TRABAJADOR” laborará en jornada ${NOMBRE_JORNADA[d.jornada]} de ${numeroConLetras(horas)} horas semanales${horario}, dentro de los límites máximos legales (jornada diurna: 8 horas diarias y 48 semanales; mixta: 7½ horas diarias y 45 semanales; nocturna: 7 horas diarias y 42 semanales), conforme a los Artículos 30, 31 y 32 del Código de Trabajo.`;
}

function horasExtraTexto(): string {
  return `El trabajo en horas extraordinarias sólo procederá en los casos permitidos por la ley, no podrá exceder de tres (3) horas diarias ni de nueve (9) horas semanales, y se remunerará con los recargos del Artículo 33 del Código de Trabajo: veinticinco por ciento (25 %) si se efectúa en el período diurno; cincuenta por ciento (50 %) si se efectúa en el período nocturno o es prolongación de la jornada mixta iniciada en el período diurno; y setenta y cinco por ciento (75 %) si es prolongación de la jornada nocturna o de la mixta iniciada en el período nocturno, así como el exceso sobre los límites indicados. “EL TRABAJADOR” disfrutará de al menos un (1) día de descanso semanal remunerado y de los días de fiesta o duelo nacional establecidos en el Artículo 46 del Código de Trabajo.`;
}

function modalidadItems(d: FormData): string[] {
  if (d.modalidad === "presencial") return [];
  const base =
    d.modalidad === "teletrabajo"
      ? `Las partes convienen que “EL TRABAJADOR” prestará sus servicios bajo la modalidad de teletrabajo, desde el lugar que se indica en el presente contrato o el que las partes acuerden por escrito, conforme a la Ley N.° 126 de 2020 que regula el teletrabajo en la República de Panamá.`
      : `Las partes convienen que “EL TRABAJADOR” prestará sus servicios bajo una modalidad híbrida, combinando jornadas presenciales en las instalaciones de “EL EMPLEADOR” con jornadas de teletrabajo, conforme a la Ley N.° 126 de 2020 que regula el teletrabajo en la República de Panamá.`;
  return [
    base,
    `El teletrabajo no altera las condiciones de la relación de trabajo, los derechos ni las obligaciones de las partes. “EL EMPLEADOR” garantizará los medios tecnológicos necesarios o acordará con “EL TRABAJADOR” la compensación de los costos derivados de su uso, y se respetará el derecho a la desconexión digital fuera de la jornada pactada.`,
  ];
}

function fechaTermino(d: FormData): string {
  if (!d.fechaFin) return `y terminará el día ${BLANCO}`;
  const dias = diasEntre(d.fechaInicio, d.fechaFin);
  const dur = dias > 0 ? `, es decir, por un término de ${numeroConLetras(dias)} días calendario` : "";
  return `y terminará el día ${fechaLarga(d.fechaFin)}${dur}`;
}

function laboral(d: FormData): DocModel {
  const E = d.empleador;
  const T = d.trabajador;
  const esIndefinido = d.tipo === "indefinido";
  const esObra = d.tipo === "obra";

  let titulo = "CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO DEFINIDO";
  if (esObra) titulo = "CONTRATO INDIVIDUAL DE TRABAJO POR OBRA DETERMINADA";
  if (esIndefinido) titulo = "CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDEFINIDO";

  const encabezado = encabezadoContrato(titulo, d.ciudadSuscripcion, fechaLegal(d.fechaSuscripcion));

  const comparecen = [
    `Por una parte, ${personaTexto(E)}, con domicilio en ${marcaDomicilio(E)}, quien en lo sucesivo y para todos los efectos legales se denominará “EL EMPLEADOR”; y, por la otra parte, ${personaNaturalTexto(T, true)}, con domicilio en ${marcaDomicilio(T)}, quien en lo sucesivo se denominará “EL TRABAJADOR”.`,
    `Ambas partes, capaces para contratar y obligarse, de manera libre y voluntaria, celebran el presente contrato individual de trabajo, el cual se regirá por las disposiciones del Código de Trabajo de la República de Panamá y sus reformas, y por las siguientes cláusulas:`,
  ];

  const secciones: Seccion[] = [];
  const cargo = d.cargo.trim() || BLANCO;
  const lugar = d.lugarTrabajo.trim() || BLANCO;

  const objeto: Seccion = {
    titulo: esObra ? "Objeto del contrato y obra determinada" : "Objeto del contrato, cargo y funciones",
    items: [],
  };
  if (esObra) {
    const detalle = parseLista(d.obraDescripcion);
    const resumen = detalle.length === 1 ? quitarPuntoFinal(detalle[0]) : "la obra que se describe a continuación";
    objeto.items.push(
      `“EL EMPLEADOR” contrata los servicios personales de “EL TRABAJADOR” para desempeñarse como ${cargo} en la ejecución de ${detalle.length === 0 ? BLANCO : resumen}. La relación de trabajo terminará una vez concluida la obra determinada objeto de este contrato.`
    );
    if (detalle.length > 1) objeto.items.push(detalle);
    const funciones = parseLista(d.funciones);
    if (funciones.length > 0) {
      objeto.items.push("Las funciones principales de “EL TRABAJADOR” en la obra son las siguientes:", funciones);
    }
  } else {
    objeto.items.push(
      `“EL EMPLEADOR” contrata los servicios personales de “EL TRABAJADOR” para que desempeñe el cargo de ${cargo}, en ${lugar}, o en cualquier otro lugar que determine “EL EMPLEADOR” dentro del territorio de la República de Panamá, siempre que ello no implique desmejora de sus condiciones de trabajo.`
    );
    const funciones = parseLista(d.funciones);
    objeto.items.push(
      "Las funciones principales de “EL TRABAJADOR” son las siguientes:",
      funciones.length > 0
        ? funciones
        : [`Desempeñar el cargo de ${cargo} y las demás funciones afines que le sean asignadas por “EL EMPLEADOR”, dentro del giro normal de sus actividades.`]
    );
  }
  secciones.push(objeto);

  secciones.push({
    titulo: "Lugar y modalidad de trabajo",
    items: [
      `“EL TRABAJADOR” prestará sus servicios en ${lugar}, República de Panamá. “EL EMPLEADOR” podrá trasladar temporalmente a “EL TRABAJADOR” dentro del territorio nacional cuando así lo exijan las necesidades del servicio, sin que ello implique desmejora de sus condiciones de trabajo ni de su salario.`,
      ...modalidadItems(d),
    ],
  });

  secciones.push({ titulo: "Jornada de trabajo, horas extraordinarias y descanso", items: [jornadaTexto(d), horasExtraTexto()] });

  secciones.push({
    titulo: "Salario y forma de pago",
    items: [
      salarioTexto(d),
      `“EL EMPLEADOR” efectuará las deducciones y retenciones de ley: cuotas de la Caja de Seguro Social (CSS), Seguro Educativo, Impuesto sobre la Renta (ISR) cuando corresponda, cuotas sindicales cuando aplique, y las demás autorizadas por el Código de Trabajo. En ningún caso el salario podrá ser inferior al salario mínimo vigente para la actividad, el tamaño de empresa y la región correspondiente, fijado por el Decreto Ejecutivo N.° 13 de 31 de diciembre de 2025 o la norma que lo reemplace.`,
    ],
  });

  const beneficios = parseLista(d.beneficios);
  const duracion: Array<string | string[]> = [];
  if (esIndefinido) {
    duracion.push(
      `El presente contrato se celebra por tiempo indefinido y la relación de trabajo inicia el día ${fechaLarga(d.fechaInicio)}.`
    );
  } else if (esObra) {
    duracion.push(
      `El presente contrato se celebra por obra determinada. La relación de trabajo inicia el día ${fechaLarga(d.fechaInicio)} y culminará con la terminación total de la obra descrita en la cláusula PRIMERA${d.fechaFin ? `, estimándose su finalización para el día ${fechaLarga(d.fechaFin)}` : ""}.`
    );
  } else {
    duracion.push(
      `El presente contrato se celebra por tiempo definido, conforme al Artículo 74 del Código de Trabajo: inicia el día ${fechaLarga(d.fechaInicio)} ${fechaTermino(d)}.`
    );
  }
  if (beneficios.length > 0) {
    duracion.push("Adicionalmente, “EL EMPLEADOR” otorga a “EL TRABAJADOR” los siguientes beneficios:", beneficios);
  }
  secciones.push({ titulo: beneficios.length > 0 ? "Duración del contrato y beneficios" : "Duración del contrato", items: duracion });

  if (esIndefinido && d.periodoPrueba) {
    const meses = Math.min(entero(d.mesesPrueba, 3), 3);
    secciones.push({
      titulo: "Período de prueba",
      items: [
        `De conformidad con el Artículo 78 del Código de Trabajo de la República de Panamá, las partes convienen un período de prueba de ${numeroConLetras(meses)} ${meses === 1 ? "mes" : "meses"}, contado a partir del inicio de la relación de trabajo. Durante este período, cualquiera de las partes podrá dar por terminada la relación de trabajo sin responsabilidad alguna, salvo el pago de los salarios y prestaciones devengados.`,
      ],
    });
  }

  secciones.push({
    titulo: "Vacaciones, décimo tercer mes y prestaciones laborales",
    items: [
      `“EL TRABAJADOR” tendrá derecho a vacaciones anuales remuneradas de treinta (30) días por cada once (11) meses de trabajo continuo, conforme al Código de Trabajo, así como al décimo tercer mes, el cual será pagado en tres partidas: el 15 de abril, el 15 de agosto y el 15 de diciembre de cada año, de conformidad con la legislación vigente.`,
      `Igualmente, “EL TRABAJADOR” tendrá derecho a la prima de antigüedad y, cuando hubiere lugar a ello, a la indemnización correspondiente, en los términos establecidos en los Artículos 224 y 225 del Código de Trabajo.`,
    ],
  });

  secciones.push({
    titulo: "Licencias y protección de la maternidad y la paternidad",
    items: [
      `“EL EMPLEADOR” reconocerá a “EL TRABAJADOR” las licencias y permisos establecidos en la ley. En particular, la trabajadora en estado de gravidez gozará del fuero de maternidad del Artículo 106 del Código de Trabajo, por lo que sólo podrá ser despedida por causa justificada y previa autorización judicial, y tendrá derecho a una licencia de maternidad remunerada de catorce (14) semanas conforme al Artículo 107 del mismo Código. El trabajador tendrá derecho a la licencia de paternidad de tres (3) días hábiles establecida en la Ley N.° 27 de 2017.`,
    ],
  });

  secciones.push({
    titulo: "Causales de terminación de la relación de trabajo",
    items: [
      esIndefinido
        ? `La relación de trabajo podrá terminar por las causas previstas en el Artículo 210 del Código de Trabajo y, en particular, por las siguientes justas causas imputables a “EL TRABAJADOR”:`
        : `Sin perjuicio de ${esObra ? "la conclusión de la obra determinada" : "la expiración del término pactado"}, la relación de trabajo podrá terminar por las causas previstas en el Artículo 210 del Código de Trabajo y, en particular, por las siguientes justas causas imputables a “EL TRABAJADOR”:`,
      parseLista(d.causales),
    ],
  });

  secciones.push({
    titulo: "Obligaciones de las partes y reglamento interno",
    items: [
      `“EL TRABAJADOR” se obliga a desempeñar sus labores con eficiencia, honradez, dedicación y buena fe; a observar las normas de seguridad e higiene ocupacional; a no concurrir al trabajo en estado de embriaguez o bajo el influjo de drogas; y a cumplir el reglamento interno de trabajo de “EL EMPLEADOR” y las disposiciones de la ley.`,
      `“EL EMPLEADOR” se obliga a pagar oportunamente el salario, a garantizar condiciones dignas y seguras de trabajo, y a inscribir a “EL TRABAJADOR” en la Caja de Seguro Social desde el inicio de la relación de trabajo, efectuando las cotizaciones obrero-patronales conforme a la Ley Orgánica de la Caja de Seguro Social, reformada por la Ley N.° 462 de 2025.`,
    ],
  });

  secciones.push({
    titulo: "Prevención del acoso y la discriminación",
    items: [
      `Las partes se obligan a mantener un ambiente de trabajo libre de hostigamiento, acoso sexual o moral, racismo, sexismo y cualquier forma de discriminación. “EL EMPLEADOR” mantendrá la política interna y el procedimiento de quejas exigidos por la Ley N.° 7 de 14 de febrero de 2018, en armonía con el Convenio 190 de la Organización Internacional del Trabajo sobre la violencia y el acoso, aprobado por la Ley N.° 321 de 2022, y “EL TRABAJADOR” se obliga a cumplirlos.`,
    ],
  });

  if (d.confidencialidad) {
    secciones.push({
      titulo: "Confidencialidad, protección de datos personales y propiedad intelectual",
      items: [
        `“EL TRABAJADOR” reconoce que, en el ejercicio de sus funciones, tendrá acceso a información confidencial de “EL EMPLEADOR” y de terceros, incluyendo secretos empresariales, listas de clientes, información comercial, técnica y financiera, procesos, metodologías, software y datos personales. Por tanto, se obliga a mantener estricta confidencialidad sobre dicha información, a no divulgarla, reproducirla ni utilizarla en beneficio propio o de terceros, incluso con posterioridad a la terminación de la relación de trabajo.`,
        `Toda obra, invención, mejora, diseño, software, documento, informe o creación intelectual que “EL TRABAJADOR” produzca en el marco de la relación de trabajo y con ocasión de sus funciones pertenecerá en forma exclusiva a “EL EMPLEADOR”. “EL TRABAJADOR” cede a favor de “EL EMPLEADOR” los derechos patrimoniales de autor que pudieran corresponderle, conforme a la Ley N.° 64 de 2012 sobre Derecho de Autor y Derechos Conexos.`,
        `En el tratamiento de datos personales, las partes cumplirán la Ley N.° 81 de 26 de marzo de 2019 sobre Protección de Datos Personales y sus reglamentos. “EL TRABAJADOR” autoriza a “EL EMPLEADOR” a tratar sus datos personales exclusivamente para fines de la relación de trabajo y del cumplimiento de obligaciones legales.`,
        `Las obligaciones de confidencialidad contenidas en esta cláusula subsistirán durante la vigencia de la relación de trabajo y por un término de dos (2) años contados desde su terminación, o por el plazo mayor que exija la ley para la información calificada como secreto empresarial.`,
      ],
    });
  }

  secciones.push(...seccionesBiblioteca(d));
  const adicionales = seccionAdicionales(d);
  if (adicionales) secciones.push(adicionales);

  secciones.push({
    titulo: "Domicilio, legislación aplicable y jurisdicción",
    items: [
      `Las partes fijan como domicilio para todos los efectos del presente contrato los señalados en el comparendo y se someten a la jurisdicción de los Juzgados Seccionales de Trabajo competentes de la República de Panamá. En todo lo no previsto, se estará a lo dispuesto en el Código de Trabajo y demás leyes laborales vigentes.`,
    ],
  });

  return {
    titulo,
    blocks: [
      ...encabezado,
      { t: "p", text: comparecen[0] },
      { t: "p", text: comparecen[1] },
      ...bloqueSecciones(secciones),
      ...anexoEquipos(d, "EL TRABAJADOR"),
      ...bloqueCierre(true),
    ],
    firmas: {
      izquierda: bloqueFirma("EL EMPLEADOR", E.nombre, detalleFirma(E)),
      derecha: bloqueFirma("EL TRABAJADOR", T.nombre, detalleFirma(T)),
    },
    testigos: testigosDocumento(d),
    notarizacion: d.notarizacion,
    ciudad: d.ciudadSuscripcion,
    nota: "",
    huella: "",
    firmaVirtual: false,
  };
}

/* ------------------------------------------------------------------ */
/* Contrato de servicios profesionales                                 */
/* ------------------------------------------------------------------ */

function servicios(d: FormData): DocModel {
  const C = d.empleador;
  const CT = d.trabajador;
  const titulo = "CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES";

  const encabezado = encabezadoContrato(titulo, d.ciudadSuscripcion, fechaLegal(d.fechaSuscripcion));

  const comparecen = [
    `Por una parte, ${personaTexto(C)}, con domicilio en ${marcaDomicilio(C)}, quien en lo sucesivo se denominará “EL CONTRATANTE”; y, por la otra, ${personaTexto(CT, true)}, quien actúa de manera independiente, con domicilio en ${marcaDomicilio(CT)}, quien en lo sucesivo se denominará “EL CONTRATISTA”.`,
    `Las partes, capaces para contratar y obligarse, celebran el presente contrato de prestación de servicios profesionales, de naturaleza civil y mercantil, regido por la legislación de la República de Panamá. Las partes reconocen expresamente que entre ellas NO existe relación de trabajo, subordinación jurídica ni dependencia económica, por lo que el presente acuerdo no genera obligaciones laborales de ninguna naturaleza, y se regirá por las siguientes cláusulas:`,
  ];

  const secciones: Seccion[] = [];
  const objeto = quitarPuntoFinal(d.objeto) || BLANCO;

  secciones.push({
    titulo: "Objeto del contrato",
    items: [`“EL CONTRATANTE” contrata los servicios profesionales independientes de “EL CONTRATISTA” para: ${objeto}.`],
  });

  const entregables = parseLista(d.entregables);
  secciones.push({
    titulo: "Servicios y entregables",
    items: [
      `“EL CONTRATISTA” prestará sus servicios de manera autónoma e independiente, con sus propios medios, conocimientos y herramientas profesionales, sin sujeción a horario ni a dirección técnica de “EL CONTRATANTE”, más allá de la coordinación necesaria para la ejecución del objeto contractual.`,
      ...(entregables.length > 0 ? ["Los entregables y trabajos a realizar serán los siguientes:", entregables] : []),
    ],
  });

  const dias = diasEntre(d.fechaInicio, d.fechaFin);
  const vigencia = d.fechaFin
    ? `El plazo de ejecución del presente contrato comprende del ${fechaLarga(d.fechaInicio)} al ${fechaLarga(d.fechaFin)}${dias > 0 ? `, es decir, un término de ${numeroConLetras(dias)} días calendario` : ""}, salvo que las partes acuerden prórrogas por escrito.`
    : `El plazo de ejecución inicia el ${fechaLarga(d.fechaInicio)} y se extiende hasta la culminación y entrega total de los servicios y entregables pactados.`;
  secciones.push({ titulo: "Vigencia y plazo de ejecución", items: [vigencia] });

  const calendario = parseLista(d.formaPagoServicios);
  const plazo = entero(d.plazoPago, 0);
  const montoTxt = parseMonto(d.honorarios) === null ? "US$ __________" : montoCompleto(d.honorarios, d.montoEnLetras, "dolares");
  const honorarios: Array<string | string[]> = [
    `Como contraprestación por los servicios, “EL CONTRATANTE” pagará a “EL CONTRATISTA” honorarios por la suma total de ${montoTxt}${d.incluyeItbms ? ", más el Impuesto de Transferencia de Bienes Muebles y Prestación de Servicios (ITBMS) del siete por ciento (7%)" : ""}${calendario.length > 0 ? ", pagaderos de la siguiente manera:" : "."}`,
  ];
  if (calendario.length > 0) honorarios.push(calendario);
  honorarios.push(
    plazo > 0
      ? `Los pagos se efectuarán dentro de los ${numeroConLetras(plazo)} días calendario siguientes a la presentación de la factura correspondiente por parte de “EL CONTRATISTA”, mediante transferencia bancaria o cheque a la cuenta que este indique.`
      : "Los pagos se efectuarán mediante transferencia bancaria o cheque a la cuenta que indique “EL CONTRATISTA”, contra la presentación de la factura correspondiente.",
    `“EL CONTRATISTA” emitirá factura electrónica por sus honorarios conforme a las normas de la Dirección General de Ingresos (DGI). Cuando “EL CONTRATANTE” esté obligado por ley a actuar como agente de retención, retendrá y pagará los tributos correspondientes, entregando a “EL CONTRATISTA” la constancia respectiva.`
  );
  secciones.push({ titulo: "Honorarios y condiciones de pago", items: honorarios });

  const penDia = d.penalidadDia.trim();
  const penTecho = d.penalidadTecho.trim();
  if (penDia && parseMonto(penDia) !== 0) {
    secciones.push({
      titulo: "Penalidades por retraso",
      items: [
        `Si “EL CONTRATISTA” incurriere en mora injustificada en la entrega de los entregables pactados, pagará a “EL CONTRATANTE” una penalidad del ${penDia}% del valor del entregable correspondiente por cada día de atraso, hasta un máximo del ${penTecho || "10"}% del valor total del contrato. El pago de la penalidad no libera a “EL CONTRATISTA” del cumplimiento de sus obligaciones.`,
      ],
    });
  }

  if (d.confidencialidad) {
    secciones.push({
      titulo: "Propiedad intelectual",
      items: [
        `Todos los derechos de autor, de propiedad industrial e intelectual, diseños, software, documentos, informes y cualquier otro producto o entregable desarrollado por “EL CONTRATISTA” en virtud del presente contrato serán de propiedad exclusiva de “EL CONTRATANTE” una vez pagados los honorarios correspondientes. “EL CONTRATISTA” cede y transfiere a “EL CONTRATANTE” todos los derechos patrimoniales sobre dichos entregables, sin limitación territorial ni temporal, conforme a la Ley N.° 64 de 2012 sobre Derecho de Autor y Derechos Conexos.`,
      ],
    });
    secciones.push({
      titulo: "Confidencialidad y protección de datos personales",
      items: [
        `“EL CONTRATISTA” se obliga a mantener estricta confidencialidad sobre toda la información comercial, técnica, financiera, secretos empresariales y datos personales a los que tenga acceso con motivo del presente contrato, y a no divulgarla ni utilizarla para fines distintos a la ejecución del objeto contractual.`,
        `En el tratamiento de datos personales, “EL CONTRATISTA” actuará como encargado del tratamiento y cumplirá la Ley N.° 81 de 26 de marzo de 2019 sobre Protección de Datos Personales y sus reglamentos, así como las instrucciones de “EL CONTRATANTE”, adoptando medidas técnicas y organizativas apropiadas para proteger dichos datos.`,
        "Las obligaciones de esta cláusula subsistirán por un término de cinco (5) años contados desde la terminación del presente contrato.",
      ],
    });
  }

  secciones.push({
    titulo: "Naturaleza independiente y no subcontratación",
    items: [
      `“EL CONTRATISTA” actúa como profesional independiente: asume sus propios riesgos, costos e impuestos, incluida su cotización obligatoria a la Caja de Seguro Social como trabajador independiente conforme a la Ley N.° 462 de 2025, y no forma parte de la planilla de “EL CONTRATANTE”. No podrá subcontratar ni ceder el presente contrato, en todo o en parte, sin la autorización previa y escrita de “EL CONTRATANTE”.`,
    ],
  });

  const preaviso = entero(d.preavisoDias, 15);
  secciones.push({
    titulo: "Causales de terminación",
    items: [
      "El presente contrato podrá terminarse anticipadamente por cualquiera de las siguientes causales:",
      parseLista(d.causales),
      `Además, cualquiera de las partes podrá dar por terminado el contrato de forma anticipada, sin expresión de causa, mediante aviso escrito con al menos ${numeroConLetras(preaviso)} días calendario de anticipación, quedando “EL CONTRATANTE” obligado a pagar los servicios efectivamente prestados y los honorarios devengados y no pagados a la fecha de terminación.`,
    ],
  });

  secciones.push(...seccionesBiblioteca(d));
  const adicionales = seccionAdicionales(d);
  if (adicionales) secciones.push(adicionales);

  secciones.push({
    titulo: "Domicilio, legislación aplicable y jurisdicción",
    items: [
      d.clausulasExtra.includes("arbitraje")
        ? "Para todos los efectos del presente contrato, las partes fijan domicilio en los indicados en el comparendo. Las controversias se resolverán conforme a la cláusula de arbitraje pactada. El presente contrato se rige por las leyes de la República de Panamá."
        : `Para todos los efectos del presente contrato, las partes fijan domicilio en los indicados en el comparendo. Cualquier controversia será resuelta, en primer término, mediante negociación directa de buena fe; de no lograrse acuerdo, las partes se someten a los tribunales competentes de ${d.ciudadSuscripcion.trim() || "la Ciudad de Panamá"}, República de Panamá. El presente contrato se rige por las leyes de la República de Panamá.`,
    ],
  });

  return {
    titulo,
    blocks: [
      ...encabezado,
      { t: "p", text: comparecen[0] },
      { t: "p", text: comparecen[1] },
      ...bloqueSecciones(secciones),
      ...anexoEquipos(d, "EL CONTRATISTA"),
      ...bloqueCierre(false),
    ],
    firmas: {
      izquierda: bloqueFirma("EL CONTRATANTE", C.nombre, detalleFirma(C)),
      derecha: bloqueFirma("EL CONTRATISTA", CT.nombre, detalleFirma(CT)),
    },
    testigos: testigosDocumento(d),
    notarizacion: d.notarizacion,
    ciudad: d.ciudadSuscripcion,
    nota: "",
    huella: "",
    firmaVirtual: false,
  };
}

function aplicarFirma(f: FirmaBloque, v: FirmaVirtual | undefined, huella: string): FirmaBloque {
  if (!v?.img) return f;
  return { ...f, img: v.img, fechaFirma: v.fecha, desactualizada: v.huella !== huella };
}

export function buildDocument(d: FormData): DocModel {
  const doc = d.tipo === "servicios" ? servicios(d) : laboral(d);
  // La huella se calcula sobre el texto sin firmas: si el contrato cambia, cambia la huella.
  const huella = huellaTexto(renderTextoTxt({ ...doc, huella: "" }));
  const conHuella: DocModel = { ...doc, huella, firmaVirtual: d.firmaModo === "virtual" };
  if (d.firmaModo !== "virtual") return conHuella;
  const fv = d.firmasVirtuales;
  const orden: Firmante[] = ["testigo1", "testigo2"];
  return {
    ...conHuella,
    firmas: {
      izquierda: aplicarFirma(doc.firmas.izquierda, fv.izquierda, huella),
      derecha: aplicarFirma(doc.firmas.derecha, fv.derecha, huella),
    },
    testigos: doc.testigos.map((t, i) => aplicarFirma(t, fv[orden[i]], huella)),
  };
}

/** Nombre de archivo sugerido: Contrato-definido-Juan-Perez-2026-10-13 */
export function nombreArchivo(d: FormData): string {
  const quien = (d.trabajador.nombre || "borrador")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `Contrato-${d.tipo}-${quien || "borrador"}-${d.fechaSuscripcion || "sin-fecha"}`;
}
