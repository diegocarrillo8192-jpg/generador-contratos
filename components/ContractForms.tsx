"use client";

import type { FormData, Marca, Persona, TipoContrato } from "@/lib/types";
import type { Revision, SeccionId } from "@/lib/validacion";
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
import Link from "next/link";
import { ArrowRightIcon, BookIcon, CheckIcon } from "./icons";

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
  const errores = revision.hallazgos.filter((h) => h.nivel === "error").length;

  const etiquetas = [
    "Tipo",
    rotulo.A,
    rotulo.B,
    esServicios ? "Honorarios" : "Condiciones",
    esServicios ? "Entregables" : "Funciones",
    "Cláusulas",
    "Firmas",
    "Logo y fecha",
  ];

  const estadoPaso = (i: number): "ok" | "pend" | "neutro" => {
    const secs = PASOS[i].secciones.map((s) => e[s]);
    const total = secs.reduce((a, s) => a + s.total, 0);
    const listos = secs.reduce((a, s) => a + s.listos, 0);
    if (total === 0) return i === 0 || i === 5 || i === 6 ? "ok" : "neutro";
    return listos === total ? "ok" : "pend";
  };

  const ir = (n: number) => {
    setPaso(n);
    document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ultimo = PASOS.length - 1;

  return (
    <div className="form-col" id="asistente">
      <div className="progress-head">
        <ProgressRing value={revision.completitud} />
        <div className="progress-head__txt">
          <strong>{revision.completitud === 100 && errores === 0 ? "¡Contrato completo!" : `Paso ${paso + 1} de ${PASOS.length} · ${etiquetas[paso]}`}</strong>
          <span>
            {errores === 0
              ? "Todos los campos obligatorios están listos. Descargue su contrato."
              : `${errores} ${errores === 1 ? "dato pendiente" : "datos pendientes"} · la vista previa se actualiza al instante`}
          </span>
        </div>
        <Link href="/manual" className="progress-head__help" title="Abrir el manual de uso">
          <BookIcon size={15} />
          <span>¿Primera vez? Ver la guía</span>
        </Link>
      </div>

      <nav className="stepper" role="tablist" aria-label="Pasos del contrato">
        <span className="stepper__bar" aria-hidden="true">
          <span style={{ width: `${(paso / (PASOS.length - 1)) * 100}%` }} />
        </span>
        {etiquetas.map((label, i) => {
          const est = estadoPaso(i);
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={paso === i}
              className={`stepper__item stepper__item--${est} ${paso === i ? "stepper__item--on" : ""}`}
              onClick={() => ir(i)}
            >
              <span className="stepper__n">{est === "ok" && paso !== i ? <CheckIcon size={12} /> : i + 1}</span>
              <span className="stepper__l">{label}</span>
            </button>
          );
        })}
      </nav>

      <NacionalidadesDatalist />
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

      <div className="step-nav">
        <button type="button" className="btn" onClick={() => ir(paso - 1)} disabled={paso === 0}>
          ← Anterior
        </button>
        <span className="step-nav__dots" aria-hidden="true">
          {PASOS.map((_, i) => (
            <i key={etiquetas[i]} className={i === paso ? "on" : ""} />
          ))}
        </span>
        {paso < ultimo ? (
          <button type="button" className="btn btn--primary" onClick={() => ir(paso + 1)}>
            Siguiente: {etiquetas[paso + 1]} <ArrowRightIcon size={16} />
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => ir(0)}>
            Volver al inicio
          </button>
        )}
      </div>
    </div>
  );
}
