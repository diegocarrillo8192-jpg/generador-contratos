"use client";

import { useEffect, useRef, useState } from "react";
import type { FirmaVirtual } from "@/lib/types";
import { fechaHoraFirma } from "@/lib/doc";
import { procesarLogo } from "@/lib/storage";
import { CheckIcon, PenIcon, TrashIcon, UndoIcon, UploadIcon } from "./icons";

const ALTO = 170;

/** Recorta los márgenes vacíos del lienzo y devuelve un PNG transparente. */
function recortar(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const datos = ctx.getImageData(0, 0, width, height).data;
  let x0 = width,
    y0 = height,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (datos[(y * width + x) * 4 + 3] > 10) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  const m = 8;
  x0 = Math.max(0, x0 - m);
  y0 = Math.max(0, y0 - m);
  x1 = Math.min(width - 1, x1 + m);
  y1 = Math.min(height - 1, y1 + m);
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")?.drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

export default function SignaturePad({
  id,
  titulo,
  nombre,
  firma,
  huellaActual,
  onFirmar,
  onBorrar,
}: {
  id: string;
  titulo: string;
  nombre: string;
  firma?: FirmaVirtual;
  huellaActual: string;
  onFirmar: (img: string) => void;
  onBorrar: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const trazos = useRef<Array<Array<[number, number]>>>([]);
  const [vacio, setVacio] = useState(true);
  const [editando, setEditando] = useState(!firma);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const redibujar = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = "#0b1f4d";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const t of trazos.current) {
      if (t.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(t[0][0], t[0][1]);
      if (t.length === 1) ctx.lineTo(t[0][0] + 0.1, t[0][1] + 0.1);
      for (let i = 1; i < t.length - 1; i++) {
        const mx = (t[i][0] + t[i + 1][0]) / 2;
        const my = (t[i][1] + t[i + 1][1]) / 2;
        ctx.quadraticCurveTo(t[i][0], t[i][1], mx, my);
      }
      if (t.length > 1) ctx.lineTo(t[t.length - 1][0], t[t.length - 1][1]);
      ctx.stroke();
    }
    setVacio(trazos.current.length === 0);
  };

  // Ajusta el lienzo al ancho disponible y a la densidad de píxeles.
  useEffect(() => {
    if (!editando) return;
    const c = canvasRef.current;
    if (!c) return;
    const ajustar = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.parentElement?.clientWidth ?? 400;
      c.width = Math.round(w * dpr);
      c.height = Math.round(ALTO * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${ALTO}px`;
      redibujar();
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    if (c.parentElement) ro.observe(c.parentElement);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando]);

  const punto = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const guardar = () => {
    const c = canvasRef.current;
    if (!c) return;
    const img = recortar(c);
    if (!img) return;
    onFirmar(img);
    trazos.current = [];
    setEditando(false);
  };

  const subir = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    try {
      onFirmar(await procesarLogo(file));
      setEditando(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la imagen.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const desactualizada = !!firma && firma.huella !== huellaActual;

  return (
    <div className={`sig ${firma && !editando ? "sig--done" : ""} ${desactualizada ? "sig--old" : ""}`} id={id} tabIndex={-1}>
      <div className="sig__head">
        <div>
          <strong>{titulo}</strong>
          <span>{nombre.trim() || "Nombre pendiente"}</span>
        </div>
        {firma && !editando && (
          <span className={`chip ${desactualizada ? "" : "chip--ok"}`}>
            {desactualizada ? "Volver a firmar" : (
              <>
                <CheckIcon size={12} /> Firmado
              </>
            )}
          </span>
        )}
      </div>

      {firma && !editando ? (
        <div className="sig__done">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={firma.img} alt={`Firma de ${nombre || titulo}`} />
          <span className="sig__meta">
            Firmado el {fechaHoraFirma(firma.fecha)} · huella {firma.huella}
            {desactualizada && " · el contrato cambió después de esta firma"}
          </span>
          <div className="row gap-8 wrap">
            <button type="button" className="btn btn--sm" onClick={() => setEditando(true)}>
              <PenIcon size={14} /> Firmar de nuevo
            </button>
            <button type="button" className="btn btn--sm btn--danger" onClick={onBorrar}>
              <TrashIcon size={14} /> Quitar firma
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="sig__canvas">
            <canvas
              ref={canvasRef}
              aria-label={`Área para firmar: ${titulo}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                dibujando.current = true;
                trazos.current.push([punto(e)]);
                redibujar();
              }}
              onPointerMove={(e) => {
                if (!dibujando.current) return;
                trazos.current[trazos.current.length - 1].push(punto(e));
                redibujar();
              }}
              onPointerUp={() => {
                dibujando.current = false;
              }}
              onPointerCancel={() => {
                dibujando.current = false;
              }}
            />
            {vacio && <span className="sig__ph">Firme aquí con el dedo, lápiz o mouse</span>}
            <span className="sig__line" aria-hidden="true" />
          </div>
          {error && <span className="hint" style={{ color: "var(--err)" }}>{error}</span>}
          <div className="row gap-8 wrap">
            <button type="button" className="btn btn--sm btn--primary" onClick={guardar} disabled={vacio}>
              <CheckIcon size={14} /> Aplicar firma
            </button>
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => {
                trazos.current.pop();
                redibujar();
              }}
              disabled={vacio}
            >
              <UndoIcon size={14} /> Deshacer trazo
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => {
                trazos.current = [];
                redibujar();
              }}
              disabled={vacio}
            >
              Limpiar
            </button>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => fileRef.current?.click()}>
              <UploadIcon size={14} /> Subir imagen
            </button>
            {firma && (
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setEditando(false)}>
                Cancelar
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => subir(e.target.files?.[0])} />
          </div>
        </>
      )}
    </div>
  );
}
