import type { FormData, Persona } from "./types";
import {
  DocModel,
  Block,
  FirmaBloque,
  bloqueFirma,
  encabezadoContrato,
} from "./doc";
import {
  dinero,
  dineroUSD,
  diasEntre,
  fechaLarga,
  ordinalClausula,
} from "./format";

type Seccion = {
  titulo: string;
  items: Array<string | string[]>;
};

function noVacio(...partes: Array<string | undefined>): string {
  return partes.filter((p) => p && String(p).trim().length > 0).join(", ");
}

function parseLista(multiline: string): string[] {
  return multiline
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.replace(/^[-*•\d.)\s]+/, ""));
}

function funcionesItems(d: FormData): string[] {
  const items = parseLista(d.funciones);
  if (items.length === 0) {
    return [`Desempeñar el cargo de ${d.cargo || "[cargo]"} y las demás funciones afines que le sean asignadas por EL EMPLEADOR, dentro del giro normal de sus actividades.`];
  }
  return items;
}

function detalleFirma(p: Persona): string {
  const partes: string[] = [];
  if (p.tipo === "juridica" && p.representante) {
    partes.push(`Representante legal: ${p.representante}`);
  }
  if (p.cedula) partes.push(`Cédula N.° ${p.cedula}`);
  if (p.ruc) {
    partes.push(`RUC N.° ${p.ruc}${p.dv ? ` DV ${p.dv}` : ""}`);
  }
  return partes.join(" · ");
}

function testigosDocumento(d: FormData): FirmaBloque[] {
  if (!d.testigosActivo) return [];
  return [
    bloqueFirma(
      "TESTIGO 1",
      d.testigo1Nombre.trim() || "____________________",
      d.testigo1Cedula ? `Cédula N.° ${d.testigo1Cedula}` : undefined
    ),
    bloqueFirma(
      "TESTIGO 2",
      d.testigo2Nombre.trim() || "____________________",
      d.testigo2Cedula ? `Cédula N.° ${d.testigo2Cedula}` : undefined
    ),
  ];
}

function anexoEquipos(d: FormData, parte: string): Block[] {
  if (!d.anexoEquipos) return [];
  const lista = parseLista(d.equipos);
  const items =
    lista.length > 0 ? lista : ["[Descripción del equipo o herramienta entregado]"];
  const art = parte === "EL TRABAJADOR" ? "EL TRABAJADOR" : "EL CONTRATISTA";
  const genero = parte === "EL TRABAJADOR" ? "trabajador(a)" : "contratista";
  return [
    {
      t: "h",
      text: "ANEXO ÚNICO · ENTREGA, CUSTODIA Y DEVOLUCIÓN DE EQUIPOS Y HERRAMIENTAS DE TRABAJO",
    },
    {
      t: "p",
      text: `${art} declara haber recibido a su entera satisfacción, en buen estado de funcionamiento y conservación, los equipos, herramientas y accesorios de trabajo que se detallan a continuación, los cuales serán utilizados exclusivamente para el desempeño de sus labores:`,
    },
    {
      t: "num",
      items: items.map(
        (it) =>
          `${it} — Recibido por ${genero}: ____________ Fecha: ____/____/______ Firma: ______________`
      ),
    },
    {
      t: "p",
      text: `En consecuencia, ${art} asume la responsabilidad por la custodia, cuidado y conservación de los bienes recibidos y se obliga a: (a) utilizarlos únicamente para las labores contratadas y conforme a las instrucciones de la parte contratante; (b) no enajenarlos, darlos en garantía, cederlos, prestarlos ni retirarlos del lugar de trabajo sin autorización previa y escrita; (c) mantenerlos en buen estado y reportar de inmediato cualquier daño, pérdida o hurto; y (d) devolverlos en la fecha de terminación de la relación contractual, o dentro de los tres (3) días siguientes, en el mismo estado en que los recibió, salvo el deterioro normal por su uso.`,
    },
    {
      t: "p",
      text: `${art} responderá por los daños o pérdidas de los bienes que le sean imputables por negligencia, uso indebido, dolo o falta de custodia, de conformidad con la legislación vigente de la República de Panamá. Tratándose de relaciones laborales, cualquier deducción o responsabilidad se hará dentro de los límites y procedimientos establecidos en el Código de Trabajo y demás normas aplicables, sin que ello implique renuncia a los derechos del trabajador.`,
    },
  ];
}

function bloqueCierre(): Block[] {
  return [
    {
      t: "p",
      text: "Las partes declaran que conocen el contenido y alcance del presente contrato y de sus anexos, lo aceptan y firman en señal de conformidad en la ciudad y fecha indicadas en el encabezamiento, en dos (2) originales de igual tenor.",
    },
    { t: "sp" },
  ];
}

function seccionConfidencialidadLaboral(d: FormData): Seccion | null {
  if (!d.confidencialidad) return null;
  return {
    titulo: "Confidencialidad, protección de datos personales y propiedad intelectual",
    items: [
      `“EL TRABAJADOR” reconoce que, en el ejercicio de sus funciones, tendrá acceso a información confidencial de “EL EMPLEADOR” y de terceros, incluyendo secretos empresariales, listas de clientes, información comercial, técnica, financiera, contable, procesos, metodologías, software y datos personales. Por tanto, se obliga a mantener estricta confidencialidad sobre dicha información, a no divulgarla, reproducirla ni utilizarla en beneficio propio o de terceros, incluso con posterioridad a la terminación de la relación de trabajo.`,
      `Toda obra, invento, mejora, diseño, software, documento, informe o creación intelectual que “EL TRABAJADOR” produzca en el marco de la relación de trabajo y con ocasión de sus funciones, pertenecerá en forma exclusiva a “EL EMPLEADOR”, quien podrá explotarla libremente. “EL TRABAJADOR” cede a favor de “EL EMPLEADOR” todos los derechos patrimoniales de autor que pudieran corresponderle, conforme a la Ley N.° 64 de 2012 sobre Derecho de Autor y Derechos Conexos de la República de Panamá.`,
      `En el tratamiento de datos personales, “EL TRABAJADOR” cumplirá la Ley N.° 81 de 26 de marzo de 2019 de Protección de Datos Personales de la República de Panamá, sus reglamentos y las políticas internas de “EL EMPLEADOR”, aplicando los principios de licitud, lealtad, transparencia, finalidad, proporcionalidad, calidad y seguridad, y no tratará dichos datos para fines distintos a los autorizados.`,
      `Las obligaciones de confidencialidad y de protección de datos contenidas en esta cláusula subsistirán durante la vigencia de la relación de trabajo y por un término de dos (2) años adicionales contados desde su terminación, o por el plazo mayor que exija la ley para la información calificada como secreto empresarial.`,
    ],
  };
}

function datosPago(d: FormData): string {
  const per = d.periodicidadPago;
  const nombre: Record<string, string> = {
    semanal: "semanal",
    quincenal: "quincenal",
    mensual: "mensual",
  };
  return `EL EMPLEADOR pagará a EL TRABAJADOR, como salario, la suma de ${dinero(d.salario)} (${nombre[per]}), pagaderos en dólares de los Estados Unidos de América (US$), o su equivalente en Balboas (B/.), moneda de curso legal de la República de Panamá, mediante ${d.formaPago || "cheque o transferencia bancaria"}.`;
}

function jornadaTexto(d: FormData): string {
  const mapa: Record<string, string> = {
    diurna: "jornada diurna",
    mixta: "jornada mixta",
    nocturna: "jornada nocturna",
  };
  return `${mapa[d.jornada] || "jornada diurna"} de ${d.horasSemanales || "[número]"} horas semanales, dentro de los límites máximos legales (jornada diurna: 8 horas diarias y 48 semanales; mixta: 7,5 horas y 45 semanales; nocturna: 7 horas y 42 semanales), conforme a los Artículos 30, 31 y 32 del Código de Trabajo. Las horas extraordinarias se pagarán con los recargos legales correspondientes.`;
}

function marcaDomicilio(p: Persona): string {
  return noVacio(
    p.direccion,
    p.corregimiento && `corregimiento de ${p.corregimiento}`,
    p.distrito && `distrito de ${p.distrito}`,
    p.provincia && `provincia de ${p.provincia}`,
    "República de Panamá"
  );
}

function personaNaturalTexto(p: Persona): string[] {
  const out: string[] = [];
  const quien = p.tipo === "juridica" && p.representante ? p.representante : p.nombre;
  out.push(`el (la) señor(a) ${quien.toUpperCase()}, mayor de edad`);
  if (p.cedula) out.push(`portador(a) de la Cédula de Identidad Personal N.° ${p.cedula}`);
  if (p.ruc) out.push(`inscrito(a) en el Registro Único de Contribuyentes (RUC) con el N.° ${p.ruc}${p.dv ? `, Dígito Verificador (DV) ${p.dv}` : ""}`);
  return out;
}

function personaJuridicaTexto(p: Persona): string[] {
  const out: string[] = [];
  out.push(`la sociedad ${p.nombre.toUpperCase()}, sociedad inscrita y vigente en la República de Panamá`);
  if (p.ruc) out.push(`inscrita en el Registro Único de Contribuyentes (RUC) con el N.° ${p.ruc}${p.dv ? `, Dígito Verificador (DV) ${p.dv}` : ""}`);
  if (p.representante) {
    const repr = [`debidamente representada en este acto por ${p.representante.toUpperCase()}`];
    if (p.cedula) repr.push(`portador(a) de la Cédula de Identidad Personal N.° ${p.cedula}`);
    out.push(repr.join(", "));
  }
  return out;
}

function bloqueSecciones(secciones: Seccion[]): Block[] {
  const bloques: Block[] = [];
  let n = 0;
  secciones.forEach((s, i) => {
    const contenido = s.items.filter(
      (it) => typeof it === "string" || it.length > 0
    );
    if (contenido.length === 0) return;
    n += 1;
    bloques.push({ t: "clause", n: ordinalClausula(n), text: s.titulo });
    for (const item of contenido) {
      if (typeof item === "string") {
        bloques.push({ t: "p", text: item });
      } else {
        bloques.push({ t: "enum", items: item });
      }
    }
  });
  return bloques;
}

function fechaTermino(d: FormData): string {
  if (!d.fechaFin) return "y terminará en la fecha que las partes acuerden por escrito";
  const dias = diasEntre(d.fechaInicio, d.fechaFin);
  const dur =
    dias > 0
      ? `, lo que equivale a un término de ${dias} días calendario`
      : "";
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

  const encabezado = encabezadoContrato(
    titulo,
    d.ciudadSuscripcion,
    fechaLarga(d.fechaSuscripcion)
  );

  const partesEmpleador = E.tipo === "juridica" ? personaJuridicaTexto(E) : personaNaturalTexto(E);
  const partesTrabajador = personaNaturalTexto(T);

  const comparecen = [
    `COMPARECEN: Por una parte, ${partesEmpleador.join(", ")}, con domicilio en ${marcaDomicilio(E)}, quien en lo sucesivo y para todos los efectos legales se denominará “EL EMPLEADOR”; y, por la otra parte, ${partesTrabajador.join(", ")}, con domicilio en ${marcaDomicilio(T)}, quien en lo sucesivo se denominará “EL TRABAJADOR”.`,
    `Ambas partes, mayores de edad y capaces para contratar y obligarse, de manera libre y voluntaria, celebran el presente contrato de trabajo, el cual se regirá por las disposiciones del Código de Trabajo de la República de Panamá (adoptado mediante el Decreto de 30 de diciembre de 1971, con sus reformas), el cual se regula conforme a las siguientes cláusulas:`,
  ];

  const secciones: Seccion[] = [];

  const objPrincipal = esObra
    ? `“EL EMPLEADOR” contrata los servicios personales de “EL TRABAJADOR” para la realización de la obra determinada que se describe a continuación: ${d.obraDescripcion || "[descripción de la obra]"}. La relación terminará una vez concluida la obra determinada objeto de este contrato, sin que ello genere obligación de contratación adicional alguna.`
    : `“EL EMPLEADOR” contrata los servicios personales de “EL TRABAJADOR” para que desempeñe el cargo de ${d.cargo || "[cargo]"} en ${d.lugarTrabajo || "[lugar de trabajo]"}, o en cualquier otro lugar que determine “EL EMPLEADOR” dentro del territorio de la República de Panamá.`;

  const primerasFunciones = funcionesItems(d);
  secciones.push({
    titulo: esObra ? "Objeto del contrato y obra determinada" : "Objeto del contrato, cargo y funciones",
    items: [objPrincipal],
  });
  if (esObra) {
    const detalle = parseLista(d.obraDescripcion);
    if (detalle.length > 1) {
      secciones[0].items.push(
        "El detalle de las labores a ejecutar en la obra determinada es el siguiente:",
        detalle
      );
    }
  } else if (primerasFunciones.length > 0) {
    secciones[0].items.push(
      "Las funciones principales de “EL TRABAJADOR” son las siguientes:",
      primerasFunciones
    );
  }

  secciones.push({
    titulo: "Lugar de trabajo",
    items: [
      `“EL TRABAJADOR” prestará sus servicios en ${d.lugarTrabajo || "[lugar de trabajo]"}, República de Panamá. “EL EMPLEADOR” podrá trasladar temporalmente a “EL TRABAJADOR” dentro del territorio nacional cuando así lo exijan las necesidades del servicio, sin que ello implique desmejora de sus condiciones de trabajo.`,
    ],
  });

  secciones.push({
    titulo: "Jornada de trabajo",
    items: [jornadaTexto(d)],
  });

  secciones.push({
    titulo: "Salario y forma de pago",
    items: [
      datosPago(d),
      `“EL TRABAJADOR” autoriza expresamente a “EL EMPLEADOR” para efectuar las deducciones de ley: cuotas del Seguro Social (CSS), Impuesto sobre la Renta (ISR), cuotas sindicales cuando corresponda, y las demás autorizadas por el Código de Trabajo. En ningún caso el salario podrá ser inferior al salario mínimo legal vigente fijado por el Órgano Ejecutivo.`,
    ],
  });

  if (!esObra) {
    const items: Array<string | string[]> = [
      esIndefinido
        ? `El presente contrato se celebra por tiempo indefinido y su relación de trabajo se inicia el día ${fechaLarga(d.fechaInicio)}.`
        : `El presente contrato se celebra por tiempo definido: inicia el día ${fechaLarga(d.fechaInicio)} ${fechaTermino(d)}.`,
    ];
    if (d.beneficios && d.beneficios.trim()) {
      items.push([
        "Adicionalmente, “EL EMPLEADOR” otorga a “EL TRABAJADOR” los siguientes beneficios no constitutivos de salario:",
        ...parseLista(d.beneficios),
      ]);
    }
    secciones.push({
      titulo: "Duración del contrato",
      items,
    });
  } else {
    const items: Array<string | string[]> = [
      `El presente contrato se celebra por obra determinada. La relación de trabajo inicia el día ${fechaLarga(d.fechaInicio)} y culminará con la terminación total de la obra descrita en la CLÁUSULA PRIMERA${d.fechaFin ? `, estimándose su finalización para el día ${fechaLarga(d.fechaFin)}` : ""}.`,
    ];
    if (d.beneficios && d.beneficios.trim()) {
      items.push([
        "Adicionalmente, “EL EMPLEADOR” otorga a “EL TRABAJADOR” los siguientes beneficios no constitutivos de salario:",
        ...parseLista(d.beneficios),
      ]);
    }
    secciones.push({
      titulo: "Duración del contrato",
      items,
    });
  }

  if (esIndefinido) {
    secciones.push({
      titulo: "Período de prueba",
      items: [
        `De conformidad con el Artículo 78 del Código de Trabajo de la República de Panamá, las partes convienen un período de prueba de hasta ${d.mesesPrueba || "3"} meses, contados a partir del inicio de la relación de trabajo. Durante este período, cualquiera de las partes podrá dar por terminada la relación de trabajo sin necesidad de preaviso ni de justificación, sin responsabilidad de indemnización alguna.`,
      ],
    });
  }

  secciones.push({
    titulo: "Vacaciones, décimo tercer mes y prestaciones laborales",
    items: [
      `“EL TRABAJADOR” tendrá derecho a vacaciones anuales remuneradas de treinta (30) días por cada once (11) meses de trabajo continuo, conforme a los Artículos 52 y siguientes del Código de Trabajo, así como al décimo tercer mes (XIII mes), el cual será pagado en tres partes: el 15 de abril, el 15 de agosto y el 15 de diciembre, de conformidad con la Ley N.° 7 de 30 de junio de 1975 y sus reformas.`,
      `Igualmente, “EL TRABAJADOR” tendrá derecho a la prima de antigüedad y a la indemnización que corresponda, en los términos y condiciones establecidos en los Artículos 225 y siguientes del Código de Trabajo, cuando hubiere lugar a ello.`,
    ],
  });

  secciones.push({
    titulo: "Causales de terminación de la relación de trabajo",
    items: [
      esIndefinido
        ? `La relación de trabajo podrá terminar por las causales de ley, entre ellas las previstas en los Artículos 210 y 213 del Código de Trabajo, y específicamente por las siguientes justas causas imputables a “EL TRABAJADOR”:`
        : `Sin perjuicio de la expiración del término pactado o de la conclusión de la obra determinada, la relación de trabajo podrá terminar por las causales de ley, entre ellas las previstas en los Artículos 210 y 213 del Código de Trabajo, y específicamente por las siguientes justas causas imputables a “EL TRABAJADOR”:`,
      parseLista(d.causales),
    ],
  });

  secciones.push({
    titulo: "Obligaciones de las partes y reglamento interno",
    items: [
      `“EL TRABAJADOR” se obliga a desempeñar sus labores con eficiencia, honradez, dedicación y buena fe, a observar las normas de seguridad e higiene ocupacional, a no concurrir al trabajo en estado de embriaguez o bajo el influjo de drogas, y a cumplir el reglamento interno de trabajo de “EL EMPLEADOR” y las disposiciones de la ley.`,
      `“EL EMPLEADOR” se obliga a pagar oportunamente el salario, a garantizar condiciones dignas y seguras de trabajo y a inscribir a “EL TRABAJADOR” ante la Caja de Seguro Social desde el inicio de la relación laboral.`,
    ],
  });

  const seccionConfidencial = seccionConfidencialidadLaboral(d);
  if (seccionConfidencial) secciones.push(seccionConfidencial);

  secciones.push({
    titulo: "Domicilio y jurisdicción",
    items: [
      `Las partes fijan como domicilio para todos los efectos del presente contrato los señalados en el comparendo, y se someten a la jurisdicción de los Juzgados Seccionales de Trabajo de la ${d.ciudadSuscripcion || "Ciudad de Panamá"}, República de Panamá. En todo lo no previsto, se estará a lo dispuesto en el Código de Trabajo y leyes complementarias de la República de Panamá.`,
    ],
  });

  const doc: DocModel = {
    blocks: [
      ...encabezado,
      { t: "p", text: comparecen[0] },
      { t: "p", text: comparecen[1] },
      ...bloqueSecciones(secciones),
      ...anexoEquipos(d, "EL TRABAJADOR"),
      ...bloqueCierre(),
    ],
    firmas: {
      izquierda: bloqueFirma("EL EMPLEADOR", E.nombre, detalleFirma(E)),
      derecha: bloqueFirma("EL TRABAJADOR", T.nombre, detalleFirma(T)),
    },
    testigos: testigosDocumento(d),
    notarizacion: d.notarizacion,
    nota: "",
  };
  return doc;
}

function servicios(d: FormData): DocModel {
  const C = d.empleador;
  const CT = d.trabajador;

  const encabezado = encabezadoContrato(
    "CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES",
    d.ciudadSuscripcion,
    fechaLarga(d.fechaSuscripcion)
  );

  const partesContratante = C.tipo === "juridica" ? personaJuridicaTexto(C) : personaNaturalTexto(C);
  const partesContratista = personaNaturalTexto(CT);

  const comparecen = [
    `COMPARECEN: Por una parte, ${partesContratante.join(", ")}, con domicilio en ${marcaDomicilio(C)}, quien en lo sucesivo se denominará “EL CONTRATANTE”; y, por la otra, ${partesContratista.join(", ")}, quien actúa en su propio nombre y de manera independiente, con domicilio en ${marcaDomicilio(CT)}, quien en lo sucesivo se denominará “EL CONTRATISTA”.`,
    `Las partes, mayores de edad y capaces para contratar y obligarse, celebran el presente contrato de naturaleza civil y mercantil, regido por la legislación de la República de Panamá. Las partes reconocen expresamente que entre ellas NO existe relación laboral, no subordinada ni dependiente, en los términos del Artículo 62 del Código de Trabajo, por lo que el presente acuerdo no genera obligaciones patronales de ninguna naturaleza.`,
  ];

  const secciones: Seccion[] = [];

  secciones.push({
    titulo: "Objeto del contrato",
    items: [
      `“EL CONTRATANTE” contrata los servicios profesionales independientes de “EL CONTRATISTA” para: ${d.objeto || "[descripción del objeto del contrato]"}.`,
    ],
  });

  secciones.push({
    titulo: "Servicios y entregables",
    items: [
      `“EL CONTRATISTA” prestará sus servicios de manera autónoma e independiente, aportando los medios, conocimientos y herramientas profesionales necesarios para la ejecución del objeto contractual.`,
      "Los entregables y trabajos a realizar serán los siguientes:",
      parseLista(d.entregables || d.funciones),
    ],
  });

  const dias = diasEntre(d.fechaInicio, d.fechaFin);
  const vigencia = d.fechaFin
    ? `El plazo de ejecución del presente contrato comprende del ${fechaLarga(d.fechaInicio)} al ${fechaLarga(d.fechaFin)}, es decir, un término aproximado de ${dias} días calendario, salvo que las partes acuerden prórrogas por escrito.`
    : `El plazo de ejecución inicia el ${fechaLarga(d.fechaInicio)} y se extiende hasta la culminación y entrega total de los entregables pactados.`;

  secciones.push({
    titulo: "Vigencia y plazo de ejecución",
    items: [vigencia],
  });

  secciones.push({
    titulo: "Honorarios y condiciones de pago",
    items: [
      `Como contraprestación por los servicios, “EL CONTRATANTE” pagará a “EL CONTRATISTA” honorarios por la suma total de ${dineroUSD(d.honorarios)} (en dólares de los Estados Unidos de América - USD), pagaderos de la siguiente manera: ${d.formaPagoServicios || `a los ${d.plazoPago || "[número]"} días después de la entrega de cada entregable`}.`,
      d.plazoPago
        ? `Salvo pacto en contrario, los pagos se efectuarán a los ${d.plazoPago} días calendario siguientes a la presentación de la factura correspondiente por parte de “EL CONTRATISTA”.`
        : "Los pagos se efectuarán mediante transferencia bancaria o cheque a la cuenta que indique “EL CONTRATISTA”.",
      `“EL CONTRATISTA” emitirá factura por sus honorarios. Cuando “EL CONTRATANTE” esté obligado por ley, retendrá y pagará a la Dirección General de Ingresos (DGI) del Ministerio de Economía y Finanzas los tributos correspondientes (ISR e ITBMS, cuando aplique), entregando a “EL CONTRATISTA” la constancia respectiva.`,
    ],
  });

  secciones.push({
    titulo: "Penalidades por retraso",
    items: [
      `Si “EL CONTRATISTA” incurriere en mora injustificada en la entrega de los entregables pactados, pagará a “EL CONTRATANTE” una penalidad de ${d.penalidadDia || "[0,5]"}% del valor del entregable correspondiente por cada día de atraso, hasta un máximo de ${d.penalidadTecho || "[10]"}% del valor total del contrato. El pago de la penalidad no libera a “EL CONTRATISTA” del cumplimiento de sus obligaciones.`,
    ],
  });

  if (d.confidencialidad) {
    secciones.push({
      titulo: "Propiedad intelectual",
      items: [
        `Todos los derechos de autor, derechos de propiedad industrial e intelectual, patentes, diseños, software, documentos, informes y cualquier otro producto o entregable desarrollado por “EL CONTRATISTA” en virtud del presente contrato, serán de propiedad exclusiva de “EL CONTRATANTE”, quien podrá utilizarlos, modificarlos y explotarlos libremente. “EL CONTRATISTA” cede y transfiere a “EL CONTRATANTE” todos los derechos patrimoniales sobre dichos entregables, desde su creación y sin limitación territorial ni temporal, conforme a la Ley N.° 64 de 2012 sobre Derecho de Autor y Derechos Conexos de la República de Panamá.`,
      ],
    });

    secciones.push({
      titulo: "Confidencialidad y protección de datos personales",
      items: [
        `“EL CONTRATISTA” se obliga a mantener estricta confidencialidad sobre toda la información comercial, técnica, financiera, secretos empresariales y datos personales a los que tenga acceso con motivo del presente contrato, y a no divulgarla ni utilizarla para fines distintos a la ejecución del objeto contractual, incluso con posterioridad a la terminación del contrato.`,
        `En el tratamiento de datos personales, “EL CONTRATISTA” actuará como encargado de tratamiento y cumplirá la Ley N.° 81 de 26 de marzo de 2019 de Protección de Datos Personales de la República de Panamá, sus reglamentos y las instrucciones de “EL CONTRATANTE”, adoptando medidas técnicas, organizativas y de seguridad apropiadas para proteger dichos datos, y aplicando los principios de licitud, lealtad, transparencia, finalidad, proporcionalidad y calidad.`,
        "Las obligaciones de esta cláusula subsistirán por un término de cinco (5) años contados desde la terminación del presente contrato.",
      ],
    });
  }

  secciones.push({
    titulo: "Naturaleza independiente y no subcontratación",
    items: [
      `“EL CONTRATISTA” actúa como profesional independiente y contratista autónomo: asume sus propios riesgos, costos, impuestos y afiliaciones (CSS, Seguro Educativo y demás), y no forma parte de la nómina de “EL CONTRATANTE”. No podrá subcontratar ni ceder el presente contrato, en todo o en parte, sin la autorización previa y escrita de “EL CONTRATANTE”.`,
    ],
  });

  secciones.push({
    titulo: "Causales de terminación",
    items: [
      "El presente contrato podrá terminarse por las siguientes causales:",
      parseLista(d.causales),
      `Además, cualquiera de las partes podrá dar por terminado el contrato de forma anticipada, sin justa causa, mediante aviso escrito con al menos ${d.plazoPago ? "el plazo pactado" : "[número]"} días de anticipación, quedando obligada a pagar los servicios u honorarios devengados y no pagados a la fecha de terminación.`,
    ],
  });

  secciones.push({
    titulo: "Domicilio, legislación aplicable y jurisdicción",
    items: [
      `Para todos los efectos del presente contrato, las partes fijan domicilio en los indicados en el comparendo y se someten a la jurisdicción de los Tribunales de la ${d.ciudadSuscripcion || "Ciudad de Panamá"}, República de Panamá. El presente contrato se rige por las leyes de la República de Panamá.`,
    ],
  });

  const doc: DocModel = {
    blocks: [
      ...encabezado,
      { t: "p", text: comparecen[0] },
      { t: "p", text: comparecen[1] },
      ...bloqueSecciones(secciones),
      ...anexoEquipos(d, "EL CONTRATISTA"),
      ...bloqueCierre(),
    ],
    firmas: {
      izquierda: bloqueFirma("EL CONTRATANTE", C.nombre, detalleFirma(C)),
      derecha: bloqueFirma("EL CONTRATISTA", CT.nombre, detalleFirma(CT)),
    },
    testigos: testigosDocumento(d),
    notarizacion: d.notarizacion,
    nota: "",
  };
  return doc;
}

export function buildDocument(d: FormData): DocModel {
  if (d.tipo === "servicios") return servicios(d);
  return laboral(d);
}
