"use client";

import { useEffect, useState } from "react";
import type { DocModel } from "@/lib/doc";
import type { FormData } from "@/lib/types";
import { nombreArchivo } from "@/lib/legal";
import { descargarArchivo } from "@/lib/storage";
import { Modal } from "./ui";
import { CheckIcon, DownloadIcon, FileIcon, PenIcon, ShieldIcon, UploadIcon } from "./icons";
import { useToast } from "./Toast";

function puedeCompartirArchivos(f: File): boolean {
  try {
    return typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [f] });
  } catch {
    return false;
  }
}

export default function EnviarModal({
  open,
  onClose,
  data,
  doc,
  onIrFirmas,
}: {
  open: boolean;
  onClose: () => void;
  data: FormData;
  doc: DocModel;
  onIrFirmas: () => void;
}) {
  const [para, setPara] = useState("");
  const [generando, setGenerando] = useState(false);
  const notificar = useToast();
  const virtual = data.firmaModo === "virtual";
  const firmas = [doc.firmas.izquierda, doc.firmas.derecha, ...doc.testigos];
  const firmadas = firmas.filter((f) => f.img && !f.desactualizada).length;
  const completo = virtual && firmadas === firmas.length;
  const base = nombreArchivo(data);

  useEffect(() => {
    if (!open) return;
    setPara([data.empleador.correo, data.trabajador.correo].map((c) => c.trim()).filter(Boolean).join(", "));
  }, [open, data.empleador.correo, data.trabajador.correo]);

  const asunto = `${doc.titulo} · ${data.trabajador.nombre.trim() || "borrador"}`;
  const cuerpo = [
    "Saludos:",
    "",
    `Adjunto encontrará el ${doc.titulo.toLowerCase()}${completo ? ", firmado electrónicamente por las partes" : virtual ? " para su revisión y firma" : " para su revisión"}.`,
    "",
    `Huella del documento: ${doc.huella}`,
    "Puede verificar que el documento no ha sido modificado comparando esta huella con la que aparece al pie del PDF.",
    "",
    "Atentamente,",
  ].join("\n");

  const pdf = async (): Promise<File | null> => {
    setGenerando(true);
    try {
      const { generarPdf } = await import("@/lib/exportPdf");
      const blob = await generarPdf(data.papel, doc.huella);
      return new File([blob], `${base}.pdf`, { type: "application/pdf" });
    } catch (e) {
      console.error(e);
      notificar("No se pudo generar el PDF. Use «PDF / Imprimir».", "error");
      return null;
    } finally {
      setGenerando(false);
    }
  };

  const descargar = async () => {
    const f = await pdf();
    if (!f) return;
    descargarArchivo(f.name, f);
    notificar("PDF descargado.");
  };

  const compartir = async () => {
    const f = await pdf();
    if (!f) return;
    if (puedeCompartirArchivos(f)) {
      try {
        await navigator.share({ files: [f], title: asunto, text: cuerpo });
        return;
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    // Escritorio: se descarga el PDF y se abre el correo con el mensaje listo; el usuario adjunta el archivo.
    descargarArchivo(f.name, f);
    const url = `mailto:${encodeURIComponent(para).replace(/%2C/g, ",").replace(/%20/g, "")}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
      `${cuerpo}\n\n(Adjunte el archivo ${f.name} que se acaba de descargar.)`
    )}`;
    window.location.href = url;
    notificar("Se descargó el PDF y se abrió su correo. Adjunte el archivo al mensaje.", "info");
  };

  const exportarRemoto = () => {
    const contenido = JSON.stringify(
      { app: "generador-contratos", version: 2, contratos: [{ nombre: `${asunto} (para firmar)`, datos: data }] },
      null,
      2
    );
    descargarArchivo(`${base}-para-firmar.json`, new Blob([contenido], { type: "application/json" }));
    notificar("Archivo para firma remota descargado. Envíelo a la otra parte.");
  };

  return (
    <Modal open={open} onClose={onClose} title="Firmar y enviar" wide>
      <div className="send-status">
        <span className={`send-status__ico ${completo ? "ok" : ""}`}>{completo ? <CheckIcon size={20} /> : <PenIcon size={20} />}</span>
        <div>
          <strong>
            {virtual
              ? completo
                ? "Contrato firmado por todas las partes"
                : `Firmas virtuales: ${firmadas} de ${firmas.length}`
              : "Modalidad: imprimir y firmar a mano"}
          </strong>
          <span>
            Huella del documento <span className="mono">{doc.huella}</span>
          </span>
        </div>
        {virtual && !completo && (
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              onClose();
              onIrFirmas();
            }}
          >
            Ir a firmar
          </button>
        )}
      </div>
      {virtual && (
        <ul className="send-firmas">
          {firmas.map((f, i) => (
            <li key={`${f.titulo}-${i}`} className={f.img && !f.desactualizada ? "ok" : ""}>
              {f.img && !f.desactualizada ? <CheckIcon size={14} /> : <span className="send-firmas__dot" />}
              <span>
                {f.titulo} · {f.nombre}
              </span>
              <em>{f.img ? (f.desactualizada ? "firma desactualizada" : "firmado") : "pendiente"}</em>
            </li>
          ))}
        </ul>
      )}

      <div className="field">
        <label className="field__label" htmlFor="enviar-para">
          Destinatarios
        </label>
        <input
          id="enviar-para"
          className="ui-input"
          value={para}
          onChange={(e) => setPara(e.target.value)}
          placeholder="correo@empresa.com, persona@correo.com"
        />
        <span className="hint">Se toman los correos de las partes. Puede editarlos.</span>
      </div>

      <div className="send-grid">
        <button type="button" className="send-opt send-opt--primary" onClick={compartir} disabled={generando}>
          <UploadIcon size={20} />
          <strong>{generando ? "Generando PDF…" : "Enviar por correo"}</strong>
          <span>En el celular abre el menú para compartir; en la computadora descarga el PDF y abre su correo con el mensaje listo.</span>
        </button>
        <button type="button" className="send-opt" onClick={descargar} disabled={generando}>
          <DownloadIcon size={20} />
          <strong>Descargar PDF</strong>
          <span>Archivo PDF con firmas, membrete, número de página y huella.</span>
        </button>
        <button type="button" className="send-opt" onClick={exportarRemoto}>
          <FileIcon size={20} />
          <strong>Exportar para firma remota</strong>
          <span>La otra parte lo abre en «Mis contratos → Importar», firma y les devuelve el PDF.</span>
        </button>
      </div>

      <div className="tip">
        <ShieldIcon size={16} />
        <span>
          {virtual
            ? "Firma electrónica simple (Ley 51 de 2008, modificada por la Ley 82 de 2012). Conserve el PDF firmado y el correo de envío como respaldo. Para contratos laborales, confirme con el MITRADEL los requisitos de registro."
            : "Para firmar a mano use «PDF / Imprimir». En contratos laborales se firman tres ejemplares: uno por parte y otro para el MITRADEL (Art. 67 C.T.)."}
        </span>
      </div>
    </Modal>
  );
}
