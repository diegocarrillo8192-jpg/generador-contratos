"use client";

import { useEffect, useRef, useState } from "react";
import type { FormData } from "@/lib/types";
import { normalizarDatos } from "@/lib/types";
import { NOMBRE_TIPO } from "@/lib/legal";
import { almacen, descargarArchivo, nuevoId, type ContratoGuardado } from "@/lib/storage";
import { Modal } from "./ui";
import { DownloadIcon, DuplicateIcon, FolderIcon, SaveIcon, TrashIcon, UploadIcon } from "./icons";
import { useToast } from "./Toast";

function nombreSugerido(d: FormData): string {
  const quien = d.trabajador.nombre.trim() || "Sin nombre";
  const tipo = d.tipo === "servicios" ? "Servicios" : d.tipo === "indefinido" ? "Indefinido" : d.tipo === "obra" ? "Obra" : "Definido";
  return `${tipo} · ${quien}`;
}

function fechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-PA", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function GuardadosModal({
  open,
  onClose,
  data,
  onCargar,
  activoId,
  setActivoId,
}: {
  open: boolean;
  onClose: () => void;
  data: FormData;
  onCargar: (d: FormData, id: string | null) => void;
  activoId: string | null;
  setActivoId: (id: string | null) => void;
}) {
  const [lista, setLista] = useState<ContratoGuardado[]>([]);
  const [nombre, setNombre] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const notificar = useToast();

  useEffect(() => {
    if (!open) return;
    const l = almacen.listar();
    setLista(l);
    const actual = l.find((c) => c.id === activoId);
    setNombre(actual?.nombre ?? nombreSugerido(data));
  }, [open, activoId, data]);

  const persistir = (l: ContratoGuardado[]) => {
    if (!almacen.guardarLista(l)) {
      notificar("El navegador no permitió guardar (espacio lleno o modo privado).", "error");
      return false;
    }
    setLista([...l].sort((a, b) => b.actualizado.localeCompare(a.actualizado)));
    return true;
  };

  const guardar = (comoNuevo: boolean) => {
    const ahora = new Date().toISOString();
    const n = nombre.trim() || nombreSugerido(data);
    if (!comoNuevo && activoId && lista.some((c) => c.id === activoId)) {
      if (persistir(lista.map((c) => (c.id === activoId ? { ...c, nombre: n, tipo: data.tipo, actualizado: ahora, datos: data } : c)))) {
        notificar("Cambios guardados.");
      }
      return;
    }
    const id = nuevoId();
    if (persistir([{ id, nombre: n, tipo: data.tipo, actualizado: ahora, datos: data }, ...lista])) {
      setActivoId(id);
      notificar("Contrato guardado en «Mis contratos».");
    }
  };

  const duplicar = (c: ContratoGuardado) => {
    persistir([{ ...c, id: nuevoId(), nombre: `${c.nombre} (copia)`, actualizado: new Date().toISOString() }, ...lista]);
  };

  const eliminar = (c: ContratoGuardado) => {
    if (!window.confirm(`¿Eliminar «${c.nombre}»? Esta acción no se puede deshacer.`)) return;
    persistir(lista.filter((x) => x.id !== c.id));
    if (c.id === activoId) setActivoId(null);
  };

  const exportar = () => {
    const contenido = JSON.stringify({ app: "generador-contratos", version: 2, contratos: lista }, null, 2);
    descargarArchivo(`respaldo-contratos-${new Date().toISOString().slice(0, 10)}.json`, new Blob([contenido], { type: "application/json" }));
  };

  const importar = async (file: File | undefined) => {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      const entrada: unknown[] = Array.isArray(json?.contratos) ? json.contratos : json?.tipo ? [{ nombre: file.name.replace(/\.json$/i, ""), datos: json }] : [];
      if (entrada.length === 0) throw new Error("vacío");
      const nuevos: ContratoGuardado[] = entrada.map((raw) => {
        const c = raw as Partial<ContratoGuardado>;
        const datos = normalizarDatos(c.datos);
        return {
          id: nuevoId(),
          nombre: String(c.nombre || nombreSugerido(datos)),
          tipo: datos.tipo,
          actualizado: new Date().toISOString(),
          datos,
        };
      });
      if (persistir([...nuevos, ...lista])) notificar(`${nuevos.length} ${nuevos.length === 1 ? "contrato importado" : "contratos importados"}.`);
    } catch {
      notificar("El archivo no es un respaldo válido.", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const enLista = !!activoId && lista.some((c) => c.id === activoId);

  return (
    <Modal open={open} onClose={onClose} title="Mis contratos" wide>
      <div className="save-box">
        <label className="field__label" htmlFor="guardar-nombre">
          Nombre del contrato actual
        </label>
        <div className="row gap-8 wrap">
          <input id="guardar-nombre" className="ui-input grow" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Contrato de Juan Pérez" />
          <button type="button" className="btn btn--primary" onClick={() => guardar(false)}>
            <SaveIcon size={16} /> {enLista ? "Guardar cambios" : "Guardar"}
          </button>
          {enLista && (
            <button type="button" className="btn" onClick={() => guardar(true)}>
              Guardar como nuevo
            </button>
          )}
        </div>
        <p className="hint">Los contratos se guardan solo en este navegador. Exporte un respaldo para llevarlos a otro equipo.</p>
      </div>

      {lista.length === 0 ? (
        <div className="empty">
          <span className="empty__ico">
            <FolderIcon size={28} />
          </span>
          <strong>Aún no tiene contratos guardados</strong>
          <p>Guarde el contrato actual para reutilizarlo como plantilla o retomarlo más tarde.</p>
        </div>
      ) : (
        <ul className="saved-list">
          {lista.map((c) => (
            <li key={c.id} className={`saved ${c.id === activoId ? "saved--on" : ""}`}>
              <button
                type="button"
                className="saved__main"
                onClick={() => {
                  onCargar(c.datos, c.id);
                  onClose();
                }}
              >
                <strong>{c.nombre}</strong>
                <span>
                  {NOMBRE_TIPO[c.tipo]} · {fechaHora(c.actualizado)}
                </span>
              </button>
              <button type="button" className="icon-btn icon-btn--sm" onClick={() => duplicar(c)} aria-label={`Duplicar ${c.nombre}`} title="Duplicar">
                <DuplicateIcon size={15} />
              </button>
              <button type="button" className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => eliminar(c)} aria-label={`Eliminar ${c.nombre}`} title="Eliminar">
                <TrashIcon size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="row gap-8 wrap modal__tools">
        <button type="button" className="btn btn--sm" onClick={exportar} disabled={lista.length === 0}>
          <DownloadIcon size={15} /> Exportar respaldo (.json)
        </button>
        <button type="button" className="btn btn--sm" onClick={() => fileRef.current?.click()}>
          <UploadIcon size={15} /> Importar respaldo
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => importar(e.target.files?.[0])} />
      </div>
    </Modal>
  );
}
