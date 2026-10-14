"use client";

import { useEffect, useRef, useState } from "react";
import type { DocModel } from "@/lib/doc";
import { renderTextoTxt } from "@/lib/doc";
import { NOMBRE_TIPO, nombreArchivo } from "@/lib/legal";
import { descargarArchivo } from "@/lib/storage";
import type { FormData, Marca } from "@/lib/types";
import type { Hallazgo, Revision } from "@/lib/validacion";
import PreviewDoc from "./PreviewDoc";
import RevisionPanel from "./RevisionPanel";
import CostosPanel from "./CostosPanel";
import EnviarModal from "./EnviarModal";
import { useToast } from "./Toast";
import { CalcIcon, CopyIcon, FileIcon, PenIcon, PrintIcon, ShieldIcon, WordIcon, ZoomInIcon, ZoomOutIcon } from "./icons";

type Pestana = "doc" | "revision" | "costos";

const ANCHO_PAPEL = { carta: 816, a4: 794 };

async function copiarTexto(texto: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(texto);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = texto;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  if (!ok) throw new Error("copy");
}

export default function PreviewPanel({
  data,
  doc,
  marca,
  revision,
  onIrFormulario,
  onIrFirmas,
}: {
  data: FormData;
  doc: DocModel;
  marca: Marca;
  revision: Revision;
  onIrFormulario: (h: Hallazgo) => void;
  onIrFirmas: () => void;
}) {
  const [pestana, setPestana] = useState<Pestana>("doc");
  const [zoomManual, setZoomManual] = useState<number | null>(null);
  const [ajuste, setAjuste] = useState(1);
  const [exportando, setExportando] = useState(false);
  const [enviar, setEnviar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const notificar = useToast();
  const papel = data.papel === "carta" ? "letter" : "A4";
  const errores = revision.hallazgos.filter((h) => h.nivel === "error").length;

  // Ajuste automático del ancho del papel al panel disponible.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const ancho = entry.contentRect.width - 8;
      setAjuste(Math.max(0.35, Math.min(1, ancho / ANCHO_PAPEL[data.papel])));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [data.papel]);

  const zoom = zoomManual ?? ajuste;

  const avisarPendientes = () => {
    if (errores > 0) {
      notificar(`El contrato tiene ${errores} ${errores === 1 ? "dato pendiente" : "datos pendientes"}; se exporta con espacios en blanco.`, "info", {
        label: "Ver",
        fn: () => setPestana("revision"),
      });
    }
  };

  const imprimir = () => {
    avisarPendientes();
    const tituloAnterior = document.title;
    document.title = nombreArchivo(data);
    setTimeout(() => {
      window.print();
      document.title = tituloAnterior;
    }, 150);
  };

  const copiar = async () => {
    try {
      await copiarTexto(renderTextoTxt(doc));
      notificar("Texto copiado. Péguelo en Word o Google Docs.");
    } catch {
      notificar("No se pudo copiar. Use la descarga en Word.", "error");
    }
  };

  const word = async () => {
    setExportando(true);
    try {
      const { generarWord } = await import("@/lib/exportWord");
      const blob = await generarWord(doc, marca, data.papel);
      descargarArchivo(`${nombreArchivo(data)}.docx`, blob);
      avisarPendientes();
      if (errores === 0) notificar("Documento Word descargado.");
    } catch (e) {
      console.error(e);
      notificar("No se pudo generar el archivo Word.", "error");
    } finally {
      setExportando(false);
    }
  };

  const txt = () => {
    descargarArchivo(`${nombreArchivo(data)}.txt`, new Blob([renderTextoTxt(doc)], { type: "text/plain;charset=utf-8" }));
  };

  return (
    <div className="preview-wrap">
      <style>{`@page { size: ${papel}; margin: 18mm 18mm 20mm; @bottom-center { content: "Página " counter(page) " de " counter(pages); font-family: Georgia, serif; font-size: 9pt; color: #64748b; } }`}</style>
      <div className="preview-bar no-print">
        <div className="preview-bar__t">
          <span className="live-dot" aria-hidden="true" />
          <div className="preview-bar__titles">
            <strong>Vista previa en vivo</strong>
            <span>{NOMBRE_TIPO[data.tipo]}</span>
          </div>
        </div>
        <div className="preview-actions">
          <button className="btn btn--sm" onClick={copiar} title="Copiar el texto sin formato">
            <CopyIcon size={16} />
            <span className="hide-sm">Copiar</span>
          </button>
          <button className="btn btn--sm" onClick={word} disabled={exportando} title="Descargar documento editable de Word (.docx)">
            <WordIcon size={16} />
            {exportando ? "Generando…" : "Word"}
          </button>
          <button className="btn btn--sm" onClick={imprimir} title="Guardar como PDF o imprimir para firmar a mano">
            <PrintIcon size={16} />
            <span className="hide-sm">PDF / </span>Imprimir
          </button>
          <button className="btn btn--sm btn--primary" onClick={() => setEnviar(true)} title="Firmar virtualmente, descargar PDF o enviar por correo">
            <PenIcon size={16} />
            Firmar y enviar
          </button>
        </div>
      </div>

      <div className="tabs no-print" role="tablist" aria-label="Paneles de la vista previa">
        <button role="tab" aria-selected={pestana === "doc"} className={`tab ${pestana === "doc" ? "tab--on" : ""}`} onClick={() => setPestana("doc")}>
          <FileIcon size={15} /> Documento
        </button>
        <button
          role="tab"
          aria-selected={pestana === "revision"}
          className={`tab ${pestana === "revision" ? "tab--on" : ""}`}
          onClick={() => setPestana("revision")}
        >
          <ShieldIcon size={15} /> Revisión
          {revision.hallazgos.length > 0 && <span className={`tab__badge ${errores ? "tab__badge--err" : ""}`}>{revision.hallazgos.length}</span>}
        </button>
        <button role="tab" aria-selected={pestana === "costos"} className={`tab ${pestana === "costos" ? "tab--on" : ""}`} onClick={() => setPestana("costos")}>
          <CalcIcon size={15} /> {data.tipo === "servicios" ? "Honorarios" : "Costos"}
        </button>
        {pestana === "doc" && (
          <div className="zoom">
            <button className="icon-btn icon-btn--sm" onClick={() => setZoomManual(Math.max(0.4, +(zoom - 0.1).toFixed(2)))} aria-label="Alejar">
              <ZoomOutIcon size={15} />
            </button>
            <button className="zoom__v" onClick={() => setZoomManual(null)} title="Ajustar al ancho">
              {zoomManual === null ? "Ajustar" : `${Math.round(zoom * 100)}%`}
            </button>
            <button className="icon-btn icon-btn--sm" onClick={() => setZoomManual(Math.min(1.6, +(zoom + 0.1).toFixed(2)))} aria-label="Acercar">
              <ZoomInIcon size={15} />
            </button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className={`preview-scroll ${pestana !== "doc" ? "preview-scroll--hidden" : ""}`}>
        <div className="print-root" style={{ zoom }}>
          <PreviewDoc doc={doc} marca={marca} borrador={data.marcaAgua} papel={data.papel} />
        </div>
      </div>
      {pestana === "revision" && (
        <div className="preview-side-scroll no-print">
          <RevisionPanel revision={revision} onIr={onIrFormulario} />
        </div>
      )}
      {pestana === "costos" && (
        <div className="preview-side-scroll no-print">
          <CostosPanel data={data} />
        </div>
      )}
      <div className="preview-foot no-print">
        <button type="button" className="link-btn" onClick={txt}>
          Descargar .txt
        </button>
        <span>·</span>
        <span>Para PDF con texto seleccionable: «Imprimir» → «Guardar como PDF».</span>
      </div>
      <EnviarModal open={enviar} onClose={() => setEnviar(false)} data={data} doc={doc} onIrFirmas={onIrFirmas} />
    </div>
  );
}
