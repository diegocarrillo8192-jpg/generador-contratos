"use client";

import { useMemo, useState } from "react";
import { IntroSplash } from "@/components/IntroSplash";
import { Logo } from "@/components/Logo";
import ContractForms from "@/components/ContractForms";
import PreviewPanel from "@/components/PreviewPanel";
import { buildDocument } from "@/lib/legal";
import {
  personaVacia,
  causalesDefaultLaboral,
  causalesDefaultServicios,
  fechaDefault,
} from "@/lib/types";
import type { FormData, Persona, TipoContrato } from "@/lib/types";

const datosIniciales = (): FormData => ({
  tipo: "definido",
  empleador: personaVacia(),
  trabajador: { ...personaVacia(), tipo: "natural" },
  cargo: "",
  funciones: "",
  lugarTrabajo: "Ciudad de Panamá",
  jornada: "diurna",
  horasSemanales: "48",
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
  honorarios: "",
  plazoPago: "",
  entregables: "",
  formaPagoServicios: "",
  penalidadDia: "0.5",
  penalidadTecho: "10",
  objeto: "",
  licencia: "",
  papel: "carta",
});

export default function Home() {
  const [data, setData] = useState<FormData>(datosIniciales);

  const doc = useMemo(() => buildDocument(data), [data]);

  const set = (patch: Partial<FormData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const setPersona = (which: "empleador" | "trabajador", k: keyof Persona, v: string) =>
    setData((prev) => {
      const p: Persona = { ...prev[which], [k]: v } as Persona;
      if (k === "tipo") {
        if (v === "natural") p.representante = "";
        p.profesion = "";
      }
      if (k === "provincia") {
        p.distrito = "";
        p.corregimiento = "";
      }
      if (k === "distrito") p.corregimiento = "";
      return { ...prev, [which]: p };
    });

  const cambiarTipo = (t: TipoContrato) =>
    setData((prev) => ({
      ...prev,
      tipo: t,
      causales:
        t === "servicios" ? causalesDefaultServicios : causalesDefaultLaboral,
      confidencialidad: t === "servicios",
    }));

  const reiniciar = () => setData(datosIniciales());

  return (
    <>
      <IntroSplash />
      <header className="topbar no-print">
        <Logo size={38} animated />
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.8px",
              color: "var(--sky)",
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.3)",
              padding: "6px 12px",
              borderRadius: 999,
            }}
          >
            🇵🇦 Ciudad de Panamá · República de Panamá
          </span>
          <button className="btn btn--sm" onClick={reiniciar} title="Restablecer todos los campos">
            ↺ Restablecer
          </button>
        </div>
      </header>

      <main className="app">
        <div className="workspace">
          <section className="form-side no-print">
            <ContractForms
              data={data}
              set={set}
              setPersona={setPersona}
              onChangeTipo={cambiarTipo}
            />
          </section>
          <aside className="preview-side panel-sticky">
            <PreviewPanel data={data} />
          </aside>
        </div>
        <p className="footer-note no-print">
          Herramienta independiente de apoyo para la redacción de documentos.
          No constituye asesoría legal. Para asuntos de alta complejidad o
          valor, consulte a un(a) abogado(a) colegiado(a) en la República de
          Panamá. Textos basados en el Código de Trabajo, la Ley N.° 81 de
          2019 (Protección de Datos Personales), la Ley N.° 7 de 1975 (XIII
          mes) y normativa tributaria vigente (RUC/DV · ITBMS).
        </p>
      </main>
    </>
  );
}
