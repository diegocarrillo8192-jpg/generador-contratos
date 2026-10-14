"use client";

import type { FormData, Marca, Persona, TipoContrato } from "@/lib/types";
import type { Revision, SeccionId } from "@/lib/validacion";
import type { DocModel } from "@/lib/doc";
import { parseMonto } from "@/lib/format";
import {
  ClausulasCard,
  CondicionesLaboralesCard,
  DatosParteCard,
  FechaFormatoCard,
  FirmasCard,
  LaboresCard,
  MarcaCard,
  ServiciosCard,
  TipoContratoCard,
  type Rotulo,
} from "./contract/sections";
import { NacionalidadesDatalist, type Which } from "./contract/persona";
import { ProgressRing } from "./ui";
import { ArrowRightIcon, CheckIcon } from "./icons";

const ROTULOS: Record<"laboral" | "servicios", Rotulo> = {
  laboral: { A: "Empleador", B: "Trabajador" },
  servicios: { A: "Contratante", B: "Contratista" },
};

/** Pasos del asistente y las secciones de validación que agrupa cada uno. */
export const PASOS: Array<{ secciones: SeccionId[] }> = [
  { secciones: ["tipo"] },
  { secciones: ["parteA"] },
  { secciones: ["parteB"] },
  { secciones: ["condiciones"] },
  { secciones: ["labores"] },
  { secciones: ["clausulas"] },
  { secciones: ["firmas"] },
  { secciones: ["formato"] },
];

export function pasoDeSeccion(s: SeccionId): number {
  const i = PASOS.findIndex((p) => p.secciones.includes(s));
  return i < 0 ? 0 : i;
}

export function enfocarCampo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => {
    (el as HTMLElement).focus({ preventScroll: true });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1400);
  }, 350);
}

const CORTAS = ["Tipo", "", "", "", "", "Cláusulas", "Firmas", "Formato"];

export function etiquetasPasos(data: FormData): string[] {
  const esServicios = data.tipo === "servicios";
  const r = esServicios ? ROTULOS.servicios : ROTULOS.laboral;
  return [
    "Tipo de contrato",
    r.A,
    r.B,
    esServicios ? "Honorarios y plazo" : "Condiciones",
    esServicios ? "Entregables" : "Funciones",
    "Cláusulas",
    "Firmas",
    "Logo y formato",
  ];
}

function estadoPaso(revision: Revision, i: number): "ok" | "pend" | "neutro" {
  const secs = PASOS[i].secciones.map((s) => revision.porSeccion[s]);
  const total = secs.reduce((a, s) => a + s.total, 0);
  const listos = secs.reduce((a, s) => a + s.listos, 0);
  if (total === 0) return i === 0 || i === 5 || i === 6 ? "ok" : "neutro";
  return listos === total ? "ok" : "pend";
}

/** Vuelve al inicio del formulario del paso y, si hace falta, al área de trabajo. */
function irArriba() {
  document.querySelector(".editor__body")?.scrollTo({ top: 0, behavior: "smooth" });
  const el = document.querySelector(".workspace");
  if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Navegación de pasos: barra lateral en escritorio, cuadrícula compacta en pantallas menores. */
export function StepNav({
  data,
  revision,
  paso,
  setPaso,
}: {
  data: FormData;
  revision: Revision;
  paso: number;
  setPaso: (n: number) => void;
}) {
  const etiquetas = etiquetasPasos(data);
  const errores = revision.hallazgos.filter((h) => h.nivel === "error").length;
  const listo = revision.completitud === 100 && errores === 0;
  return (
    <nav className="steps" aria-label="Pasos del contrato">
      <div className="steps__head">
        <ProgressRing value={revision.completitud} size={40} />
        <div>
          <strong>{listo ? "Contrato listo" : "Su progreso"}</strong>
          <span>{errores === 0 ? "Sin datos pendientes" : `${errores} ${errores === 1 ? "dato pendiente" : "datos pendientes"}`}</span>
        </div>
      </div>
      <ol className="steps__list" role="tablist">
        {etiquetas.map((label, i) => {
          const est = estadoPaso(revision, i);
          const on = paso === i;
          return (
            <li key={label}>
              <button
                type="button"
                role="tab"
                aria-selected={on}
                className={`steps__item steps__item--${est} ${on ? "steps__item--on" : ""}`}
                onClick={() => {
                  setPaso(i);
                  irArriba();
                }}
              >
                <span className="steps__n">{est === "ok" && !on ? <CheckIcon size={12} /> : i + 1}</span>
                <span className="steps__l steps__l--full">{label}</span>
                <span className="steps__l steps__l--short">{CORTAS[i] || label.split(" ")[0]}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function fechaCorta(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Resumen de los datos clave del contrato, siempre visible junto a los pasos. */
export function ResumenContrato({ data, doc }: { data: FormData; doc: DocModel }) {
  const servicios = data.tipo === "servicios";
  const monto = servicios ? parseMonto(data.honorarios) : parseMonto(data.salario);
  const firmas = [doc.firmas.izquierda, doc.firmas.derecha, ...doc.testigos];
  const firmadas = firmas.filter((f) => f.img && !f.desactualizada).length;
  const vigencia =
    data.tipo === "indefinido"
      ? data.fechaInicio
        ? `Desde ${fechaCorta(data.fechaInicio)}`
        : ""
      : [fechaCorta(data.fechaInicio), fechaCorta(data.fechaFin)].filter(Boolean).join(" – ");
  const filas: Array<[string, string]> = [
    [servicios ? "Contratante" : "Empleador", data.empleador.nombre.trim()],
    [servicios ? "Contratista" : "Trabajador", data.trabajador.nombre.trim()],
    [servicios ? "Honorarios" : "Salario mensual", monto !== null ? `${servicios ? "US$" : "B/."} ${monto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""],
    ["Vigencia", vigencia],
    ["Firma", data.firmaModo === "virtual" ? `Virtual · ${firmadas}/${firmas.length}` : "Manuscrita"],
  ];
  return (
    <div className="resumen">
      <span className="resumen__t">Resumen</span>
      <dl>
        {filas.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className={v ? "" : "resumen__vacio"}>{v || "Pendiente"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ContractForms({
  data,
  set,
  setPersona,
  onChangeTipo,
  revision,
  marca,
  setMarca,
  paso,
  setPaso,
  huella,
}: {
  data: FormData;
  set: (patch: Partial<FormData>) => void;
  setPersona: (which: Which, k: keyof Persona, v: string) => void;
  onChangeTipo: (t: TipoContrato) => void;
  revision: Revision;
  marca: Marca;
  setMarca: (patch: Partial<Marca>) => void;
  paso: number;
  setPaso: (n: number) => void;
  huella: string;
}) {
  const esServicios = data.tipo === "servicios";
  const rotulo = esServicios ? ROTULOS.servicios : ROTULOS.laboral;
  const e = revision.porSeccion;
  const etiquetas = etiquetasPasos(data);
  const ultimo = PASOS.length - 1;

  const ir = (n: number) => {
    setPaso(n);
    irArriba();
  };

  return (
    <div className="form-col" id="asistente">
      <NacionalidadesDatalist />
      <div className="editor__body">
      <div className="step-pane" key={paso} role="tabpanel">
        {paso === 0 && <TipoContratoCard data={data} set={set} onChangeTipo={onChangeTipo} estado={e.tipo} />}
        {paso === 1 && (
          <DatosParteCard which="empleador" data={data} setPersona={setPersona} rotulo={rotulo} esServicios={esServicios} estado={e.parteA} />
        )}
        {paso === 2 && (
          <DatosParteCard which="trabajador" data={data} setPersona={setPersona} rotulo={rotulo} esServicios={esServicios} estado={e.parteB} />
        )}
        {paso === 3 &&
          (esServicios ? <ServiciosCard data={data} set={set} estado={e.condiciones} /> : <CondicionesLaboralesCard data={data} set={set} estado={e.condiciones} />)}
        {paso === 4 && <LaboresCard data={data} set={set} esServicios={esServicios} estado={e.labores} />}
        {paso === 5 && <ClausulasCard data={data} set={set} esServicios={esServicios} estado={e.clausulas} />}
        {paso === 6 && <FirmasCard data={data} set={set} estado={e.firmas} huella={huella} rotulo={rotulo} />}
        {paso === 7 && (
          <>
            <MarcaCard marca={marca} setMarca={setMarca} empleador={data.empleador} />
            <FechaFormatoCard data={data} set={set} estado={e.formato} />
          </>
        )}
      </div>
      </div>

      <div className="step-nav">
        <button type="button" className="btn btn--ghost" onClick={() => ir(paso - 1)} disabled={paso === 0}>
          ← Anterior
        </button>
        <span className="step-nav__count">
          {paso + 1} / {PASOS.length}
        </span>
        {paso < ultimo ? (
          <button type="button" className="btn btn--primary" onClick={() => ir(paso + 1)}>
            {etiquetas[paso + 1]} <ArrowRightIcon size={16} />
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => ir(0)}>
            Volver al inicio
          </button>
        )}
      </div>
    </div>
  );
}
