import type { Metadata } from "next";
import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import {
  AlertIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalcIcon,
  CheckIcon,
  ClockIcon,
  FileIcon,
  FolderIcon,
  HandshakeIcon,
  ImageIcon,
  InfoIcon,
  PenIcon,
  ShieldIcon,
  SparkIcon,
  UsersIcon,
  WordIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Manual de uso",
  description:
    "Guía paso a paso para crear, revisar, firmar (a mano o virtualmente) y enviar contratos laborales y de servicios profesionales bajo la legislación de Panamá.",
};

type Paso = {
  id: string;
  titulo: string;
  texto: string;
  puntos: string[];
  tip?: { tipo: "info" | "warn"; texto: string };
};

const PASOS: Paso[] = [
  {
    id: "tipo",
    titulo: "Elija el tipo de contrato",
    texto: "En el paso 1 seleccione el modelo legal que corresponde a la relación con la otra persona.",
    puntos: [
      "Laboral temporal: por tiempo definido (máximo 1 año, o 3 si requiere preparación técnica especial · Art. 74 C.T.) o por obra determinada.",
      "Laboral indefinido: la regla general del Código de Trabajo; permite un período de prueba de hasta 3 meses (Art. 78 C.T.).",
      "Servicios profesionales: para independientes o empresas, sin subordinación ni horario impuesto.",
    ],
    tip: {
      tipo: "warn",
      texto:
        "Si la persona cumple horario, recibe órdenes y depende económicamente de usted, la relación es laboral aunque el documento diga «servicios». Elija bien el tipo.",
    },
  },
  {
    id: "partes",
    titulo: "Complete los datos de las partes",
    texto: "En los pasos 2 y 3 ingrese quién contrata y quién es contratado.",
    puntos: [
      "Persona natural: nombre completo, cédula (formato 8-123-4567, PE-1-234 o E-8-12345) y nacionalidad.",
      "Persona jurídica: razón social, RUC con su dígito verificador (DV) y el representante legal con su cédula.",
      "Domicilio: provincia, distrito, corregimiento (puede elegirlo de la lista) y la dirección exacta.",
      "En un contrato laboral el trabajador siempre es persona natural.",
    ],
  },
  {
    id: "condiciones",
    titulo: "Defina las condiciones",
    texto: "El paso 4 cambia según el tipo de contrato.",
    puntos: [
      "Laboral: cargo, lugar, modalidad (presencial, híbrida o teletrabajo · Ley 126 de 2020), fechas, jornada y horas semanales, salario, forma de pago y beneficios.",
      "Al cambiar la jornada se ajustan las horas al máximo legal: diurna 48 h, mixta 45 h y nocturna 42 h semanales.",
      "Servicios: objeto, fechas, honorarios en US$, ITBMS (7 %) si aplica, calendario de pagos por hitos, penalidad por retraso y preaviso de terminación.",
      "Debajo del salario u honorarios verá el monto escrito en letras, tal como aparecerá en el contrato.",
    ],
  },
  {
    id: "funciones",
    titulo: "Describa funciones o entregables",
    texto: "En el paso 5 escriba una función o entregable por línea; el documento los enumera solo con a), b), c)…",
    puntos: [
      "Las causales de terminación vienen redactadas según el Art. 213 del Código de Trabajo (laboral) o para resolución del contrato (servicios).",
      "Puede editarlas libremente y volver al texto recomendado con un clic.",
    ],
  },
  {
    id: "clausulas",
    titulo: "Agregue cláusulas y anexos",
    texto: "El paso 6 incluye cláusulas opcionales y una biblioteca de cláusulas listas para usar.",
    puntos: [
      "Confidencialidad, protección de datos personales (Ley 81 de 2019) y propiedad intelectual (Ley 64 de 2012).",
      "Anexo de entrega de equipos y herramientas, con líneas de recibo y firma.",
      "Biblioteca: exclusividad, prevención del acoso, viáticos, comisiones, uso de vehículo, garantía, limitación de responsabilidad, arbitraje, fuerza mayor, firma electrónica y más. Toque una cláusula para activarla.",
      "«Estipulaciones adicionales»: escriba sus propias condiciones, una por línea.",
    ],
  },
  {
    id: "firmas",
    titulo: "Elija cómo se firmará",
    texto: "En el paso 7 seleccione la modalidad de firma.",
    puntos: [
      "Imprimir y firmar: firma manuscrita en papel. Puede incluir testigos y un espacio para autenticación notarial.",
      "Firma virtual: cada parte firma en la pantalla con el dedo, un lápiz o el mouse (o sube una imagen de su firma).",
      "Cada firma guarda la «huella» del documento. Si el texto cambia después de firmar, la firma se marca como desactualizada y la revisión le pedirá firmar de nuevo.",
    ],
    tip: {
      tipo: "info",
      texto:
        "La firma en pantalla es una firma electrónica simple (Ley 51 de 2008, modificada por la Ley 82 de 2012). Para mayor fuerza probatoria existe la firma electrónica calificada del Registro Público. En contratos laborales, confirme con el MITRADEL los requisitos de registro.",
    },
  },
  {
    id: "logo",
    titulo: "Suba el logo de su empresa",
    texto: "En el paso 8 personalice el membrete del contrato.",
    puntos: [
      "Arrastre su logo (PNG, JPG, WEBP o SVG de hasta 5 MB) o haga clic para buscarlo.",
      "Agregue el nombre de la empresa y una línea de detalle (RUC, dirección, teléfono) o use «Usar datos de la parte contratante».",
      "Elija alineación y tamaño. El logo se guarda en su navegador y no se borra al restablecer el formulario.",
      "En ese mismo paso defina la fecha y ciudad de firma, el papel (Carta o A4), los montos en letras y la marca de agua «BORRADOR».",
    ],
  },
  {
    id: "revision",
    titulo: "Revise el contrato",
    texto: "En el panel derecho use la pestaña «Revisión».",
    puntos: [
      "Pendientes (rojo): datos obligatorios que faltan.",
      "Por revisar (amarillo): posibles inconsistencias legales, como una jornada que excede el máximo, un período de prueba mayor de 3 meses o un contrato definido mayor de 1 año.",
      "Sugerencias (azul): mejoras recomendadas.",
      "Toque cualquier observación y la aplicación lo lleva al paso y al campo exacto.",
    ],
  },
  {
    id: "costos",
    titulo: "Consulte los costos",
    texto: "La pestaña «Costos» (u «Honorarios» en servicios) estima el impacto económico.",
    puntos: [
      "Laboral: salario neto aproximado (CSS 9.75 %, Seguro Educativo 1.25 % e ISR) y costo total para la empresa (CSS patronal escalonada, Seguro Educativo, riesgos profesionales y provisiones de XIII mes y vacaciones).",
      "Servicios: total a facturar con ITBMS, montos de cada hito y la penalidad máxima.",
      "Las tasas son editables. Son estimaciones referenciales: verifique con la CSS, la DGI o su contador.",
    ],
  },
  {
    id: "exportar",
    titulo: "Descargue, firme y envíe",
    texto: "Use los botones de la parte superior de la vista previa.",
    puntos: [
      "Imprimir: abre el diálogo del navegador; elija «Guardar como PDF» para obtener un PDF con texto seleccionable.",
      "Word: descarga un .docx editable con su logo, firmas y numeración de páginas.",
      "Firmar y enviar: genera el PDF y lo comparte desde el celular o abre su correo con el mensaje listo (en computadora, adjunte el PDF descargado).",
      "Exportar para firma remota: envíe el archivo a la otra parte para que lo abra en «Mis contratos → Importar», firme y devuelva el PDF.",
    ],
  },
  {
    id: "guardar",
    titulo: "Guarde y reutilice",
    texto: "Su trabajo nunca se pierde.",
    puntos: [
      "El borrador se guarda automáticamente en este navegador.",
      "«Mis contratos» guarda varios contratos con nombre para reutilizarlos como plantilla, duplicarlos o abrirlos después.",
      "Exporte un respaldo (.json) para llevar sus contratos a otro equipo e impórtelo allí.",
      "«Ejemplo» llena el formulario con datos ficticios para conocer la herramienta. «Restablecer» limpia todo y se puede deshacer.",
    ],
  },
];

const FUNCIONES = [
  { icon: <PenIcon />, t: "Firma virtual", d: "Firmen en pantalla y envíen el PDF por correo, o impriman y firmen a mano." },
  { icon: <ShieldIcon />, t: "Revisión legal automática", d: "Detecta datos faltantes y reglas del Código de Trabajo." },
  { icon: <CalcIcon />, t: "Calculadora de costos", d: "Salario neto, cargas patronales e ITBMS al instante." },
  { icon: <ImageIcon />, t: "Logo y membrete", d: "Su identidad corporativa en la vista previa, el PDF y el Word." },
  { icon: <WordIcon />, t: "PDF y Word", d: "Exportación lista para imprimir, firmar o seguir editando." },
  { icon: <FolderIcon />, t: "Mis contratos", d: "Guarde, duplique y respalde contratos como plantillas." },
];

const TIPOS = [
  {
    icon: <ClockIcon />,
    t: "Tiempo definido",
    d: "Para necesidades temporales reales. Máximo 1 año (3 con preparación técnica especial). No puede cubrir puestos permanentes (Art. 75 C.T.).",
  },
  { icon: <BuildingIcon />, t: "Obra determinada", d: "Termina al concluir la obra descrita. Común en construcción y proyectos específicos." },
  { icon: <BriefcaseIcon />, t: "Tiempo indefinido", d: "Regla general. Admite período de prueba de hasta 3 meses (Art. 78 C.T.)." },
  { icon: <HandshakeIcon />, t: "Servicios profesionales", d: "Relación civil o mercantil con independientes o empresas; el contratista factura y asume sus cotizaciones." },
];

const FAQ = [
  {
    q: "¿El contrato generado tiene validez legal?",
    a: "Los textos están redactados conforme a la legislación panameña vigente y sirven como base sólida. Aun así, la herramienta no sustituye la asesoría de un(a) abogado(a), sobre todo en asuntos complejos o de alto valor.",
  },
  {
    q: "¿Es válida la firma virtual?",
    a: "Sí, como firma electrónica simple conforme a la Ley 51 de 2008 (modificada por la Ley 82 de 2012). Su valor probatorio es menor que el de la firma electrónica calificada, que emite el Registro Público. Conserve el PDF firmado y el correo de envío. En contratos laborales confirme con el MITRADEL los requisitos de registro.",
  },
  {
    q: "¿Debo registrar el contrato laboral?",
    a: "Sí. El Art. 67 del Código de Trabajo exige que el contrato conste por escrito, se firme al inicio de la relación y se haga en tres ejemplares: uno para cada parte y otro que se remite al Ministerio de Trabajo y Desarrollo Laboral (MITRADEL).",
  },
  {
    q: "¿Dónde se guardan mis datos y mi logo?",
    a: "Solo en su navegador (almacenamiento local). No se envían a ningún servidor. Si borra los datos del navegador o cambia de equipo, use «Exportar respaldo» para conservarlos.",
  },
  {
    q: "¿Cómo obtengo un PDF con texto seleccionable?",
    a: "Use «Imprimir» y elija «Guardar como PDF» como destino. El botón «Firmar y enviar» genera un PDF tipo imagen pensado para adjuntarlo o compartirlo.",
  },
  {
    q: "¿Qué significa la huella del documento?",
    a: "Es un código calculado a partir del texto del contrato. Si alguien cambia una sola palabra, la huella cambia. Compare la huella del pie del PDF con la que recibió para comprobar que el documento no se alteró.",
  },
  {
    q: "¿Los cálculos de CSS e ISR son exactos?",
    a: "Son estimaciones referenciales con las tasas vigentes conocidas (CSS patronal escalonada: 13.25 % hasta febrero de 2027, 14.25 % hasta febrero de 2029 y 15.25 % después). El riesgo profesional depende de la actividad. Verifique con la CSS, la DGI o su contador.",
  },
];

export default function ManualPage() {
  return (
    <>
      <Topbar activo="manual" />
      <main className="manual">
        <section className="manual-hero">
          <div>
            <span className="eyebrow">
              <SparkIcon size={13} /> Manual de uso
            </span>
            <h1>
              Su contrato listo en <em>pocos minutos</em>, paso a paso.
            </h1>
            <p>
              Esta guía le muestra cómo crear un contrato laboral o de servicios profesionales con la legislación de Panamá: completar los datos, agregar su
              logo, revisarlo, firmarlo a mano o de forma virtual y enviarlo.
            </p>
            <div className="manual-hero__cta">
              <Link href="/" className="btn btn--primary">
                Crear un contrato <ArrowRightIcon size={16} />
              </Link>
              <a href="#paso-1" className="btn">
                Empezar la guía
              </a>
            </div>
          </div>
          <div className="manual-hero__card">
            <h2>Contenido</h2>
            <ol className="toc">
              {PASOS.map((p, i) => (
                <li key={p.id}>
                  <a href={`#paso-${i + 1}`}>
                    <span className="toc__n">{i + 1}</span>
                    {p.titulo}
                  </a>
                </li>
              ))}
              <li>
                <a href="#tipos">
                  <span className="toc__n">
                    <FileIcon size={13} />
                  </span>
                  ¿Qué contrato necesito?
                </a>
              </li>
              <li>
                <a href="#faq">
                  <span className="toc__n">?</span>
                  Preguntas frecuentes
                </a>
              </li>
            </ol>
          </div>
        </section>

        <div className="cards-3">
          {FUNCIONES.map((f) => (
            <div key={f.t} className="mini-card">
              <span className="ui-card__icon">{f.icon}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>

        <h2 className="manual-h">Guía paso a paso</h2>
        <p className="manual-lead">Siga estos pasos en orden. Puede saltar entre pasos en cualquier momento con la cuadrícula superior del formulario.</p>
        <ol className="guia">
          {PASOS.map((p, i) => (
            <li key={p.id} className="step" id={`paso-${i + 1}`}>
              <span className="step__n">{i + 1}</span>
              <div className="step__card">
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
                <ul>
                  {p.puntos.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                {p.tip && (
                  <div className={`tip ${p.tip.tipo === "warn" ? "tip--warn" : ""}`}>
                    {p.tip.tipo === "warn" ? <AlertIcon size={16} /> : <InfoIcon size={16} />}
                    <span>{p.tip.texto}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <h2 className="manual-h" id="tipos">
          ¿Qué contrato necesito?
        </h2>
        <p className="manual-lead">Resumen de los modelos disponibles según el Código de Trabajo de Panamá.</p>
        <div className="cards-3 cards-4">
          {TIPOS.map((t) => (
            <div key={t.t} className="mini-card">
              <span className="ui-card__icon">{t.icon}</span>
              <h3>{t.t}</h3>
              <p>{t.d}</p>
            </div>
          ))}
        </div>

        <div className="mini-card legal-box">
          <span className="ui-card__icon">
            <UsersIcon />
          </span>
          <div>
            <h3>Marco legal que aplica la herramienta</h3>
            <ul>
              <li>Código de Trabajo: contrato escrito y en tres ejemplares (Art. 67), contenido mínimo (Art. 68), duración (Arts. 74 y 75), período de prueba (Art. 78), jornadas (Arts. 30 a 32), terminación (Arts. 210 y 213), prima de antigüedad e indemnización (Arts. 224 y 225).</li>
              <li>Decreto Ejecutivo 13 de 31 de diciembre de 2025: salario mínimo 2026–2027, vigente desde el 16 de enero de 2026.</li>
              <li>Ley 462 de 2025 (reforma de la CSS): cuotas obrero-patronales y cotización obligatoria de los independientes.</li>
              <li>Código de Trabajo: horas extraordinarias (Art. 33), fiestas nacionales (Art. 46), fuero y licencia de maternidad (Arts. 106 y 107) y trabajadores extranjeros (Arts. 17 a 19, Decreto Ejecutivo 4 de 2023).</li>
              <li>Ley 27 de 2017: licencia de paternidad de 3 días hábiles.</li>
              <li>Ley 7 de 2018 y Convenio 190 de la OIT (Ley 321 de 2022): prevención del acoso y la discriminación.</li>
              <li>Ley 81 de 2019 sobre protección de datos personales.</li>
              <li>Ley 64 de 2012 sobre derecho de autor (cesión de derechos patrimoniales).</li>
              <li>Ley 126 de 2020 sobre teletrabajo.</li>
              <li>Ley 51 de 2008, modificada por la Ley 82 de 2012, sobre documentos y firmas electrónicas.</li>
              <li>Ley 131 de 2013 sobre arbitraje comercial (cláusula opcional).</li>
              <li>Normativa de la DGI: ISR, ITBMS y factura electrónica (desde 2026, facturador gratuito hasta B/. 36,000 anuales).</li>
            </ul>
          </div>
        </div>

        <h2 className="manual-h" id="faq">
          Preguntas frecuentes
        </h2>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div className="manual-cta">
          <div>
            <strong>¿Listo para empezar?</strong>
            <span>Cargue un ejemplo con datos ficticios y explore todas las funciones en segundos.</span>
          </div>
          <Link href="/" className="btn btn--primary">
            <CheckIcon size={16} /> Ir al generador
          </Link>
        </div>

        <p className="footer-note">
          Herramienta de apoyo para la redacción de documentos. No constituye asesoría legal. Consulte a un(a) abogado(a) idóneo(a) en la República de Panamá
          para asuntos de alta complejidad o valor.
        </p>
      </main>
    </>
  );
}
