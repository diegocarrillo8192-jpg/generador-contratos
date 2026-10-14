"use client";

import type { Hallazgo, Revision } from "@/lib/validacion";
import { AlertIcon, ArrowRightIcon, CheckIcon, InfoIcon, ShieldIcon } from "./icons";

const ETIQUETA: Record<Hallazgo["nivel"], string> = {
  error: "Pendiente",
  aviso: "Revisar",
  sugerencia: "Sugerencia",
};

export default function RevisionPanel({ revision, onIr }: { revision: Revision; onIr: (h: Hallazgo) => void }) {
  const { hallazgos } = revision;
  const errores = hallazgos.filter((h) => h.nivel === "error").length;
  const avisos = hallazgos.filter((h) => h.nivel === "aviso").length;
  const sugerencias = hallazgos.length - errores - avisos;

  return (
    <div className="side-panel">
      <div className="kpis">
        <div className={`kpi ${errores ? "kpi--err" : "kpi--ok"}`}>
          <span className="kpi__n">{errores}</span>
          <span className="kpi__l">Pendientes</span>
        </div>
        <div className={`kpi ${avisos ? "kpi--warn" : ""}`}>
          <span className="kpi__n">{avisos}</span>
          <span className="kpi__l">Por revisar</span>
        </div>
        <div className="kpi">
          <span className="kpi__n">{sugerencias}</span>
          <span className="kpi__l">Sugerencias</span>
        </div>
      </div>

      {hallazgos.length === 0 ? (
        <div className="empty">
          <span className="empty__ico">
            <ShieldIcon size={28} />
          </span>
          <strong>Todo en orden</strong>
          <p>El contrato tiene todos los datos obligatorios y no se detectaron inconsistencias legales.</p>
        </div>
      ) : (
        <ul className="issues">
          {hallazgos.map((h) => (
            <li key={h.id}>
              <button type="button" className={`issue issue--${h.nivel}`} onClick={() => onIr(h)}>
                <span className="issue__ico">
                  {h.nivel === "error" ? <AlertIcon size={16} /> : h.nivel === "aviso" ? <InfoIcon size={16} /> : <CheckIcon size={16} />}
                </span>
                <span className="issue__body">
                  <span className="issue__tag">{ETIQUETA[h.nivel]}</span>
                  <span className="issue__msg">{h.mensaje}</span>
                </span>
                <ArrowRightIcon size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="side-note">
        La revisión automática detecta datos faltantes y reglas comunes del Código de Trabajo. No sustituye la revisión de un(a) abogado(a).
      </p>
    </div>
  );
}
