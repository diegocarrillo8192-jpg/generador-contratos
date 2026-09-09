"use client";

import { useState } from "react";
import type { DocModel } from "@/lib/doc";
import { buildDocument } from "@/lib/legal";
import { renderTextoTxt } from "@/lib/doc";
import type { FormData } from "@/lib/types";
import PreviewDoc from "./PreviewDoc";
import { CopyIcon, PrintIcon } from "./icons";

const NOMBRE: Record<FormData["tipo"], string> = {
  definido: "Contrato individual de trabajo · tiempo definido",
  obra: "Contrato individual de trabajo · obra determinada",
  indefinido: "Contrato individual de trabajo · tiempo indefinido",
  servicios: "Contrato de prestación de servicios profesionales (B2B)",
};

export default function PreviewPanel({ data }: { data: FormData }) {
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const doc = buildDocument(data);
  const papel = data.papel === "carta" ? "letter" : "a4";

  const imprimir = () => {
    setAviso(null);
    setTimeout(() => window.print(), 120);
  };

  const copiar = async () => {
    const texto = renderTextoTxt(doc);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
      } else {
        const ta = document.createElement("textarea");
        ta.value = texto;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiado(true);
      setAviso("Texto legal copiado al portapapeles. Pégalo en Word o Google Docs.");
      setTimeout(() => {
        setCopiado(false);
        setAviso(null);
      }, 2600);
    } catch {
      setAviso("No se pudo copiar. Seleccione el texto manualmente.");
      setTimeout(() => setAviso(null), 3000);
    }
  };

  return (
    <div className="preview-wrap" id="zona-impresion">
      <style>{`@page { size: ${papel}; margin: 16mm; }`}</style>
      <div className="preview-bar">
        <div className="preview-bar__t">
          <span className="live-dot" />
          Vista previa en tiempo real
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--sky)",
              background: "rgba(34,211,238,0.12)",
              border: "1px solid rgba(34,211,238,0.25)",
              padding: "3px 10px",
              borderRadius: 999,
            }}
          >
            {NOMBRE[data.tipo]}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={copiar} title="Copia el texto legal sin formato para pegarlo en Microsoft Word o Google Docs">
            <CopyIcon />
            Copiar Texto Legal
          </button>
          <button className="btn btn--primary" onClick={imprimir}>
            <PrintIcon />
            Descargar PDF / Imprimir
          </button>
        </div>
      </div>
      <div className="preview-scroll">
        <div className="print-root">
          <PreviewDoc doc={doc} />
        </div>
      </div>
      {aviso && (
        <div className={`toast ${copiado ? "toast--ok" : ""}`} role="status">
          {copiado && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
          {aviso}
        </div>
      )}
    </div>
  );
}
