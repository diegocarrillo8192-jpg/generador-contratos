/**
 * Biblioteca de cláusulas opcionales. {A} y {B} se reemplazan por la denominación
 * de cada parte (“EL EMPLEADOR”/“EL TRABAJADOR” o “EL CONTRATANTE”/“EL CONTRATISTA”).
 */

export type Ambito = "laboral" | "servicios" | "ambos";

export interface ClausulaBiblioteca {
  id: string;
  titulo: string;
  resumen: string;
  ambito: Ambito;
  categoria: "Operación" | "Cumplimiento" | "Protección" | "Formalidades";
  textos: string[];
}

export const BIBLIOTECA: ClausulaBiblioteca[] = [
  // ---------- Laborales ----------
  {
    id: "exclusividad",
    titulo: "Exclusividad",
    resumen: "El trabajador no prestará servicios a competidores durante la relación.",
    ambito: "laboral",
    categoria: "Protección",
    textos: [
      "Durante la vigencia de la relación de trabajo, {B} se obliga a no prestar servicios, directa o indirectamente, a personas naturales o jurídicas que desarrollen actividades en competencia con {A}, salvo autorización previa y escrita de este.",
    ],
  },
  {
    id: "viaticos",
    titulo: "Gastos y viáticos",
    resumen: "Reembolso de gastos de viaje y representación con comprobantes.",
    ambito: "laboral",
    categoria: "Operación",
    textos: [
      "Los gastos de transporte, alimentación, hospedaje y representación en que incurra {B} por instrucciones de {A} en el desempeño de sus funciones serán reembolsados o cubiertos por {A}, previa presentación de los comprobantes respectivos y conforme a sus políticas internas. Dichas sumas no constituyen salario por tratarse de medios para el desempeño del trabajo.",
    ],
  },
  {
    id: "comisiones",
    titulo: "Comisiones e incentivos",
    resumen: "Remuneración variable según la política escrita de comisiones.",
    ambito: "laboral",
    categoria: "Operación",
    textos: [
      "Además del salario pactado, {B} podrá devengar comisiones o incentivos por cumplimiento de metas, conforme a la política escrita de comisiones que {A} le entregue y que forma parte integral de este contrato. Las comisiones devengadas forman parte del salario para todos los efectos legales.",
    ],
  },
  {
    id: "vehiculo",
    titulo: "Uso de vehículo de la empresa",
    resumen: "Responsabilidades por el vehículo asignado, licencia y multas.",
    ambito: "laboral",
    categoria: "Operación",
    textos: [
      "Cuando {A} asigne un vehículo a {B} para el desempeño de sus labores, este se obliga a mantener vigente su licencia de conducir, a usar el vehículo exclusivamente para fines laborales salvo autorización escrita, a cumplir las normas de tránsito y a reportar de inmediato cualquier accidente o daño. Las multas de tránsito imputables a {B} por su conducta serán de su cargo, dentro de los límites permitidos por la ley.",
    ],
  },
  {
    id: "capacitacion",
    titulo: "Capacitación",
    resumen: "Compromiso de formación y aprovechamiento de cursos.",
    ambito: "laboral",
    categoria: "Operación",
    textos: [
      "{A} podrá proporcionar a {B} programas de capacitación y actualización relacionados con su cargo, dentro o fuera de la jornada de trabajo. {B} se compromete a asistir y aprovechar dichos programas. El tiempo dedicado a capacitaciones obligatorias se considerará tiempo de trabajo.",
    ],
  },
  {
    id: "uniforme",
    titulo: "Uniforme y presentación",
    resumen: "Uso del uniforme y equipo de protección proporcionado.",
    ambito: "laboral",
    categoria: "Operación",
    textos: [
      "{B} se obliga a utilizar durante la jornada el uniforme y el equipo de protección personal que {A} le proporcione sin costo, a mantenerlos en buen estado y a devolverlos al terminar la relación de trabajo.",
    ],
  },
  {
    id: "tic",
    titulo: "Uso de equipos y sistemas informáticos",
    resumen: "Uso aceptable de correo, internet y cuentas corporativas.",
    ambito: "laboral",
    categoria: "Protección",
    textos: [
      "Las cuentas de correo, sistemas, equipos y herramientas tecnológicas que {A} ponga a disposición de {B} son de propiedad de {A} y deberán utilizarse exclusivamente para fines laborales. {B} se obliga a proteger sus credenciales de acceso, a no instalar programas no autorizados y a cumplir las políticas de seguridad de la información de {A}, quien podrá supervisar el uso de dichas herramientas corporativas respetando la dignidad y la intimidad de {B} conforme a la ley.",
    ],
  },
  {
    id: "etica",
    titulo: "Código de ética y conducta",
    resumen: "Cumplimiento del código de ética y políticas internas.",
    ambito: "laboral",
    categoria: "Cumplimiento",
    textos: [
      "{B} declara haber recibido el Código de Ética y Conducta y el Reglamento Interno de Trabajo de {A}, y se obliga a cumplirlos. Los cambios a dichos documentos le serán comunicados por escrito y, en lo que corresponda, aprobados conforme al Código de Trabajo.",
    ],
  },
  // ---------- Servicios ----------
  {
    id: "garantia",
    titulo: "Garantía y soporte",
    resumen: "Corrección sin costo de defectos durante 30 días.",
    ambito: "servicios",
    categoria: "Operación",
    textos: [
      "{B} garantiza que los servicios y entregables se ejecutarán con la diligencia y calidad propias de su profesión. Durante los treinta (30) días calendario siguientes a la aceptación de cada entregable, {B} corregirá sin costo adicional los errores o defectos que le sean imputables y que {A} le notifique por escrito.",
    ],
  },
  {
    id: "limitacion",
    titulo: "Limitación de responsabilidad",
    resumen: "La responsabilidad se limita al monto de los honorarios.",
    ambito: "servicios",
    categoria: "Protección",
    textos: [
      "Salvo en casos de dolo, culpa grave o incumplimiento de las obligaciones de confidencialidad, la responsabilidad total de {B} frente a {A} por cualquier reclamación derivada del presente contrato no excederá el monto total de los honorarios efectivamente pagados. Ninguna de las partes responderá por lucro cesante ni por daños indirectos.",
    ],
  },
  {
    id: "seguro",
    titulo: "Seguro de responsabilidad civil",
    resumen: "El contratista mantendrá una póliza de responsabilidad profesional.",
    ambito: "servicios",
    categoria: "Protección",
    textos: [
      "{B} mantendrá vigente, durante la ejecución del contrato, una póliza de seguro de responsabilidad civil profesional emitida por una compañía de seguros autorizada en la República de Panamá, y entregará copia de esta a {A} cuando así lo solicite.",
    ],
  },
  {
    id: "no-captacion",
    titulo: "No captación de personal",
    resumen: "Ninguna parte contratará al personal de la otra por 12 meses.",
    ambito: "servicios",
    categoria: "Protección",
    textos: [
      "Durante la vigencia del contrato y por doce (12) meses posteriores a su terminación, ninguna de las partes podrá ofrecer empleo ni contratar directamente al personal de la otra parte que haya participado en la ejecución de los servicios, salvo acuerdo previo y escrito.",
    ],
  },
  {
    id: "arbitraje",
    titulo: "Arbitraje",
    resumen: "Controversias resueltas por arbitraje en derecho en Panamá.",
    ambito: "servicios",
    categoria: "Formalidades",
    textos: [
      "Toda controversia derivada de la interpretación, ejecución o terminación del presente contrato que no pueda resolverse mediante negociación directa en un plazo de treinta (30) días será resuelta mediante arbitraje en derecho, conforme a la Ley N.° 131 de 2013 sobre arbitraje comercial, ante un centro de arbitraje con sede en la Ciudad de Panamá, por un (1) árbitro, en idioma español. El laudo será definitivo y obligatorio para las partes.",
    ],
  },
  {
    id: "acoso-servicios",
    titulo: "Prevención del acoso",
    resumen: "El contratista respeta la política contra el acoso y la discriminación.",
    ambito: "servicios",
    categoria: "Cumplimiento",
    textos: [
      "{B} y el personal que designe para la ejecución de los servicios se obligan a respetar la política de {A} para prevenir el hostigamiento, el acoso sexual o moral, el racismo y el sexismo, conforme a la Ley N.° 7 de 14 de febrero de 2018 y al Convenio 190 de la Organización Internacional del Trabajo aprobado por la Ley N.° 321 de 2022. Su incumplimiento será causal de terminación del presente contrato.",
    ],
  },
  // ---------- Ambos ----------
  {
    id: "fuerza-mayor",
    titulo: "Caso fortuito y fuerza mayor",
    resumen: "Suspende obligaciones ante hechos imprevisibles e irresistibles.",
    ambito: "ambos",
    categoria: "Formalidades",
    textos: [
      "Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando este se deba a caso fortuito o fuerza mayor debidamente comprobados. La parte afectada lo notificará por escrito a la otra dentro de los cinco (5) días hábiles siguientes, y las obligaciones afectadas quedarán suspendidas mientras dure el impedimento, conforme a la ley aplicable.",
    ],
  },
  {
    id: "notificaciones",
    titulo: "Notificaciones",
    resumen: "Avisos válidos por escrito o por correo electrónico.",
    ambito: "ambos",
    categoria: "Formalidades",
    textos: [
      "Todas las comunicaciones y avisos relacionados con este contrato se harán por escrito y se entenderán válidamente realizados cuando se entreguen en los domicilios señalados en el comparendo o se envíen a los correos electrónicos que cada parte haya indicado. Cualquier cambio de domicilio o de correo deberá comunicarse a la otra parte por escrito.",
    ],
  },
  {
    id: "firma-electronica",
    titulo: "Firma electrónica",
    resumen: "Validez de la firma electrónica y de los ejemplares digitales.",
    ambito: "ambos",
    categoria: "Formalidades",
    textos: [
      "Las partes reconocen la validez del presente contrato suscrito mediante firma electrónica o firma electrónica calificada, conforme a la Ley N.° 51 de 2008, modificada por la Ley N.° 82 de 2012, que regula los documentos y firmas electrónicas en la República de Panamá, y aceptan que los ejemplares digitales tendrán el mismo valor probatorio que los originales en papel.",
    ],
  },
  {
    id: "integridad",
    titulo: "Acuerdo íntegro y divisibilidad",
    resumen: "El contrato reemplaza acuerdos previos; cambios solo por escrito.",
    ambito: "ambos",
    categoria: "Formalidades",
    textos: [
      "El presente contrato constituye el acuerdo íntegro entre las partes respecto de su objeto y reemplaza cualquier negociación o acuerdo previo, verbal o escrito. Toda modificación deberá constar por escrito y estar firmada por ambas partes. Si alguna cláusula fuere declarada nula, las demás conservarán su plena validez.",
    ],
  },
  {
    id: "anticorrupcion",
    titulo: "Anticorrupción y cumplimiento",
    resumen: "Prohibición de sobornos y cumplimiento de normas de prevención.",
    ambito: "ambos",
    categoria: "Cumplimiento",
    textos: [
      "Las partes declaran que los recursos con que cumplen sus obligaciones provienen de actividades lícitas y se obligan a no ofrecer, pagar ni recibir sobornos, dádivas o ventajas indebidas en relación con este contrato, así como a cumplir la normativa panameña de prevención del blanqueo de capitales, el financiamiento del terrorismo y la proliferación de armas de destrucción masiva.",
    ],
  },
];

export function clausulasDisponibles(servicios: boolean): ClausulaBiblioteca[] {
  return BIBLIOTECA.filter((c) => c.ambito === "ambos" || c.ambito === (servicios ? "servicios" : "laboral"));
}

export function textoClausula(c: ClausulaBiblioteca, servicios: boolean): string[] {
  const A = servicios ? "“EL CONTRATANTE”" : "“EL EMPLEADOR”";
  const B = servicios ? "“EL CONTRATISTA”" : "“EL TRABAJADOR”";
  return c.textos.map((t) => t.replace(/\{A\}/g, A).replace(/\{B\}/g, B));
}
