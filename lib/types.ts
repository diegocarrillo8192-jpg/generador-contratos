export type TipoDocumento = "cedula" | "ruc" | "pasaporte";

export interface Persona {
  tipo: "natural" | "juridica";
  nombre: string;
  representante: string;
  documento: TipoDocumento;
  cedula: string;
  ruc: string;
  dv: string;
  actividad: string;
  profesion: string;
  nacionalidad: string;
  /** Permiso de trabajo del MITRADEL (trabajadores extranjeros). */
  permisoTrabajo: string;
  telefono: string;
  correo: string;
  provincia: string;
  distrito: string;
  corregimiento: string;
  direccion: string;
}

export type TipoContrato = "definido" | "obra" | "indefinido" | "servicios";

export type PeriodicidadPago = "semanal" | "quincenal" | "mensual";
export type ModalidadJornada = "diurna" | "mixta" | "nocturna";
export type ModalidadTrabajo = "presencial" | "teletrabajo" | "hibrido";

export type Firmante = "izquierda" | "derecha" | "testigo1" | "testigo2";

/** Firma trazada en pantalla. `huella` es la huella del texto del contrato al momento de firmar. */
export interface FirmaVirtual {
  img: string;
  fecha: string;
  huella: string;
}

export interface FormData {
  tipo: TipoContrato;
  empleador: Persona;
  trabajador: Persona;
  cargo: string;
  funciones: string;
  lugarTrabajo: string;
  modalidad: ModalidadTrabajo;
  jornada: ModalidadJornada;
  horasSemanales: string;
  horario: string;
  fechaInicio: string;
  fechaFin: string;
  obraDescripcion: string;
  periodoPrueba: boolean;
  mesesPrueba: string;
  salario: string;
  periodicidadPago: PeriodicidadPago;
  formaPago: string;
  beneficios: string;
  causales: string;
  fechaSuscripcion: string;
  ciudadSuscripcion: string;

  confidencialidad: boolean;
  anexoEquipos: boolean;
  equipos: string;

  testigosActivo: boolean;
  testigo1Nombre: string;
  testigo1Cedula: string;
  testigo2Nombre: string;
  testigo2Cedula: string;
  notarizacion: boolean;
  firmaModo: "manuscrita" | "virtual";
  firmasVirtuales: Partial<Record<Firmante, FirmaVirtual>>;

  honorarios: string;
  plazoPago: string;
  preavisoDias: string;
  entregables: string;
  formaPagoServicios: string;
  incluyeItbms: boolean;
  penalidadDia: string;
  penalidadTecho: string;
  objeto: string;
  licencia: string;

  clausulasAdicionales: string;
  clausulasExtra: string[];
  montoEnLetras: boolean;
  marcaAgua: boolean;
  papel: "carta" | "a4";
}

/** Membrete de la empresa (se guarda aparte del contrato y no se borra al restablecer). */
export interface Marca {
  logo: string;
  nombre: string;
  detalle: string;
  mostrar: boolean;
  alineacion: "izquierda" | "centro";
  tamano: "s" | "m" | "l";
}

export function marcaVacia(): Marca {
  return {
    logo: "",
    nombre: "",
    detalle: "",
    mostrar: true,
    alineacion: "izquierda",
    tamano: "m",
  };
}

export function personaVacia(): Persona {
  return {
    tipo: "natural",
    nombre: "",
    representante: "",
    documento: "cedula",
    cedula: "",
    ruc: "",
    dv: "",
    actividad: "",
    profesion: "",
    nacionalidad: "panameña",
    permisoTrabajo: "",
    telefono: "",
    correo: "",
    provincia: "Panamá",
    distrito: "Panamá",
    corregimiento: "",
    direccion: "",
  };
}

export const causalesDefaultLaboral = `a) La falsedad y la deshonestidad del trabajador al ser contratado o durante la relación de trabajo;
b) Los actos de violencia, injurias o malos tratos del trabajador contra el empleador o sus familiares o contra el personal directivo o administrativo;
c) Los daños o perjuicios causados intencionalmente por el trabajador en los edificios, obras, maquinarias, herramientas, materias primas o demás objetos de trabajo;
d) El incumplimiento sistemático del trabajador de las normas de seguridad e higiene en el trabajo;
e) Las faltas injustificadas al trabajo, así como las ausencias injustificadas, conforme a lo dispuesto en el Código de Trabajo;
f) El abandono del trabajo, entendido como la salida intempestiva del lugar de trabajo sin causa justificada;
g) El incumplimiento grave y reiterado de las obligaciones y deberes que le impone el presente contrato y la ley;
h) Cualquier otra causal de justa causa establecida en el Artículo 213 del Código de Trabajo de la República de Panamá.`;

export const causalesDefaultServicios = `a) El incumplimiento grave de las obligaciones contractuales del CONTRATISTA;
b) El retraso injustificado en la entrega de los entregables o trabajos pactados, superado el plazo de gracia pactado;
c) La subcontratación no autorizada por escrito por el CONTRATANTE;
d) La cesión del presente contrato sin el consentimiento previo y escrito del CONTRATANTE;
e) La violación de las cláusulas de confidencialidad, de protección de datos personales (Ley 81 de 2019) o de propiedad intelectual;
f) El incumplimiento del CONTRATANTE en el pago oportuno de los honorarios pactados, sin causa justificada.`;

export function fechaDefault(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const HORAS_MAXIMAS: Record<ModalidadJornada, number> = {
  diurna: 48,
  mixta: 45,
  nocturna: 42,
};

export function datosIniciales(): FormData {
  return {
    tipo: "definido",
    empleador: { ...personaVacia(), tipo: "juridica" },
    trabajador: personaVacia(),
    cargo: "",
    funciones: "",
    lugarTrabajo: "Ciudad de Panamá",
    modalidad: "presencial",
    jornada: "diurna",
    horasSemanales: "48",
    horario: "",
    fechaInicio: fechaDefault(),
    fechaFin: "",
    obraDescripcion: "",
    periodoPrueba: true,
    mesesPrueba: "3",
    salario: "",
    periodicidadPago: "quincenal",
    formaPago: "transferencia bancaria",
    beneficios: "",
    causales: causalesDefaultLaboral,
    fechaSuscripcion: fechaDefault(),
    ciudadSuscripcion: "Ciudad de Panamá",
    confidencialidad: false,
    anexoEquipos: false,
    equipos: "",
    testigosActivo: false,
    testigo1Nombre: "",
    testigo1Cedula: "",
    testigo2Nombre: "",
    testigo2Cedula: "",
    notarizacion: false,
    firmaModo: "manuscrita",
    firmasVirtuales: {},
    honorarios: "",
    plazoPago: "30",
    preavisoDias: "15",
    entregables: "",
    formaPagoServicios: "",
    incluyeItbms: false,
    penalidadDia: "0.5",
    penalidadTecho: "10",
    objeto: "",
    licencia: "",
    clausulasAdicionales: "",
    clausulasExtra: ["integridad", "notificaciones"],
    montoEnLetras: true,
    marcaAgua: false,
    papel: "carta",
  };
}

/** Completa un objeto parcial (p. ej. un borrador guardado de una versión anterior) con los valores por defecto. */
export function normalizarDatos(parcial: Partial<FormData> | null | undefined): FormData {
  const base = datosIniciales();
  if (!parcial || typeof parcial !== "object") return base;
  return {
    ...base,
    ...parcial,
    empleador: { ...base.empleador, ...(parcial.empleador ?? {}) },
    trabajador: { ...base.trabajador, ...(parcial.trabajador ?? {}) },
    firmasVirtuales: parcial.firmasVirtuales && typeof parcial.firmasVirtuales === "object" ? parcial.firmasVirtuales : {},
    clausulasExtra: Array.isArray(parcial.clausulasExtra) ? parcial.clausulasExtra.filter((x) => typeof x === "string") : base.clausulasExtra,
  };
}

export function normalizarMarca(parcial: Partial<Marca> | null | undefined): Marca {
  return { ...marcaVacia(), ...(parcial ?? {}) };
}
