"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { IntroSplash } from "@/components/IntroSplash";
import { Topbar } from "@/components/Topbar";
import ContractForms, { ResumenContrato, StepNav, enfocarCampo, pasoDeSeccion } from "@/components/ContractForms";
import { Menu } from "@/components/ui";
import PreviewPanel from "@/components/PreviewPanel";
import GuardadosModal from "@/components/GuardadosModal";
import { ToastProvider, useToast } from "@/components/Toast";
import Link from "next/link";
import { BookIcon, CheckIcon, EditIcon, EyeIcon, FolderIcon, MoreIcon, RefreshIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { buildDocument } from "@/lib/legal";
import { revisar, type Hallazgo } from "@/lib/validacion";
import { datosEjemplo } from "@/lib/ejemplos";
import { almacen } from "@/lib/storage";
import {
  causalesDefaultLaboral,
  causalesDefaultServicios,
  datosIniciales,
  marcaVacia,
  type FormData,
  type Marca,
  type Persona,
  type TipoContrato,
} from "@/lib/types";


function tieneContenido(d: FormData): boolean {
  return !!(d.empleador.nombre.trim() || d.trabajador.nombre.trim() || d.cargo.trim() || d.objeto.trim() || d.salario.trim() || d.honorarios.trim());
}

function Generador() {
  const [data, setData] = useState<FormData>(datosIniciales);
  const [marca, setMarcaState] = useState<Marca>(marcaVacia);
  const [listo, setListo] = useState(false);
  const [guardado, setGuardado] = useState<"guardado" | "pendiente" | "error">("guardado");
  const [activoId, setActivoId] = useState<string | null>(null);
  const [verGuardados, setVerGuardados] = useState(false);
  const [vista, setVista] = useState<"form" | "preview">("form");
  const [paso, setPaso] = useState(0);
  const notificar = useToast();
  const primerGuardado = useRef(true);

  // Cargar borrador y membrete guardados (solo en el navegador, tras la hidratación).
  useEffect(() => {
    const borrador = almacen.cargarBorrador();
    const m = almacen.cargarMarca();
    if (borrador) setData(borrador);
    else setData(datosIniciales());
    if (m) setMarcaState(m);
    setListo(true);
  }, []);

  // Autoguardado con retardo.
  useEffect(() => {
    if (!listo) return;
    if (primerGuardado.current) {
      primerGuardado.current = false;
      return;
    }
    setGuardado("pendiente");
    const t = setTimeout(() => setGuardado(almacen.guardarBorrador(data) ? "guardado" : "error"), 600);
    return () => clearTimeout(t);
  }, [data, listo]);

  useEffect(() => {
    if (!listo) return;
    if (!almacen.guardarMarca(marca) && marca.logo) {
      notificar("El logo es muy pesado para guardarse en el navegador; se usará solo en esta sesión.", "info");
    }
  }, [marca, listo, notificar]);

  const diferido = useDeferredValue(data);
  const doc = useMemo(() => buildDocument(diferido), [diferido]);
  const revision = useMemo(() => revisar(diferido, doc), [diferido, doc]);

  const set = useCallback((patch: Partial<FormData>) => setData((prev) => ({ ...prev, ...patch })), []);
  const setMarca = useCallback((patch: Partial<Marca>) => setMarcaState((prev) => ({ ...prev, ...patch })), []);

  const setPersona = useCallback(
    (which: "empleador" | "trabajador", k: keyof Persona, v: string) =>
      setData((prev) => {
        const p: Persona = { ...prev[which], [k]: v } as Persona;
        if (k === "tipo" && v === "natural") p.representante = "";
        if (k === "provincia") {
          p.distrito = "";
          p.corregimiento = "";
        }
        if (k === "distrito") p.corregimiento = "";
        return { ...prev, [which]: p };
      }),
    []
  );

  const cambiarTipo = useCallback(
    (t: TipoContrato) =>
      setData((prev) => {
        if (prev.tipo === t) return prev;
        const aServicios = t === "servicios";
        const deServicios = prev.tipo === "servicios";
        const next: FormData = { ...prev, tipo: t };
        if (aServicios !== deServicios) {
          // Solo se reemplazan las causales si el usuario no las personalizó.
          const defectoAnterior = deServicios ? causalesDefaultServicios : causalesDefaultLaboral;
          if (prev.causales.trim() === defectoAnterior.trim() || !prev.causales.trim()) {
            next.causales = aServicios ? causalesDefaultServicios : causalesDefaultLaboral;
          }
          if (aServicios) next.confidencialidad = true;
        }
        // En un contrato laboral el trabajador siempre es persona natural.
        if (!aServicios && prev.trabajador.tipo === "juridica") {
          next.trabajador = { ...prev.trabajador, tipo: "natural", representante: "" };
        }
        return next;
      }),
    []
  );

  const irAHallazgo = (h: Hallazgo) => {
    setVista("form");
    setPaso(pasoDeSeccion(h.seccion));
    setTimeout(() => {
      if (h.campo && document.getElementById(h.campo)) enfocarCampo(h.campo);
      else document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
    }, 90);
  };

  const reiniciar = () => {
    const anterior = data;
    setData(datosIniciales());
    setActivoId(null);
    setPaso(0);
    notificar("Formulario restablecido.", "info", { label: "Deshacer", fn: () => setData(anterior) });
  };

  const cargarEjemplo = () => {
    const anterior = data;
    setData(datosEjemplo(data.tipo));
    setActivoId(null);
    notificar("Se cargó un ejemplo con datos ficticios.", "ok", tieneContenido(anterior) ? { label: "Deshacer", fn: () => setData(anterior) } : undefined);
  };

  const indicador =
    guardado === "pendiente" ? "Guardando…" : guardado === "error" ? "Sin guardar (almacenamiento no disponible)" : "Guardado automáticamente";

  return (
    <>
      <IntroSplash />
      <Topbar activo="generador">
        <span className={`autosave autosave--${guardado}`} title={`${indicador} · el borrador se guarda en este navegador`}>
          <i />
          <span className="hide-md">{guardado === "pendiente" ? "Guardando…" : guardado === "error" ? "Sin guardar" : "Guardado"}</span>
        </span>
        <button className="btn btn--sm btn--ghost" onClick={() => setVerGuardados(true)} title="Guardar y abrir contratos">
          <FolderIcon size={16} />
          <span className="hide-sm">Mis contratos</span>
        </button>
        <Menu
          label="Más acciones"
          icon={<MoreIcon />}
          items={[
            { label: "Cargar un ejemplo", icon: <SparkIcon size={16} />, onSelect: cargarEjemplo },
            { label: "Restablecer formulario", icon: <RefreshIcon size={16} />, onSelect: reiniciar, danger: true },
          ]}
        />
      </Topbar>

      <main className="app">
        <section className="hero no-print">
          <div className="hero__text">
            <span className="eyebrow">
              <ShieldIcon size={13} /> Legislación de la República de Panamá
            </span>
            <h1>
              Contratos con <em>precisión corporativa</em>,<br /> de la redacción a la firma.
            </h1>
            <p>Laborales y de servicios profesionales, conforme al Código de Trabajo, con revisión legal automática y firma electrónica.</p>
            <div className="hero__cta">
              <button type="button" className="btn btn--primary btn--lg" onClick={cargarEjemplo}>
                <SparkIcon size={17} /> Probar con un ejemplo
              </button>
              <Link href="/manual" className="btn btn--lg btn--outline">
                <BookIcon size={17} /> Ver el manual
              </Link>
            </div>
            <dl className="hero__stats">
              <div>
                <dt>4</dt>
                <dd>modelos de contrato</dd>
              </div>
              <div>
                <dt>17</dt>
                <dd>cláusulas opcionales</dd>
              </div>
              <div>
                <dt>PDF · Word</dt>
                <dd>con firma virtual</dd>
              </div>
            </dl>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="sheet sheet--back" />
            <div className="sheet">
              <span className="sheet__logo" />
              <span className="sheet__title" />
              <span className="sheet__sub" />
              <span className="sheet__line" />
              <span className="sheet__line" />
              <span className="sheet__line sheet__line--short" />
              <span className="sheet__clause" />
              <span className="sheet__line" />
              <span className="sheet__line sheet__line--mid" />
              <div className="sheet__firmas">
                <div>
                  <svg viewBox="0 0 120 40" className="sheet__sig">
                    <path d="M4 28c10-18 18-22 22-10s-6 16 2 8 14-20 20-12-4 16 6 10 12-14 22-10 10 10 18 4 14-8 22-6" />
                  </svg>
                  <span />
                </div>
                <div>
                  <svg viewBox="0 0 120 40" className="sheet__sig">
                    <path d="M6 24c8-10 14-14 20-6s-2 14 8 6 10-16 18-10-2 14 8 10 14-12 22-6 6 8 14 2 10-6 18-4" />
                  </svg>
                  <span />
                </div>
              </div>
            </div>
            <span className="hero__badge hero__badge--ok">
              <CheckIcon size={14} /> Firmado electrónicamente
            </span>
            <span className="hero__badge hero__badge--hash">
              <ShieldIcon size={14} /> Huella 0830-0857-F587
            </span>
          </div>
        </section>

        <div className={`workspace workspace--${vista}`}>
          <div className="editor no-print">
            <aside className="editor__nav">
              <StepNav data={data} revision={revision} paso={paso} setPaso={setPaso} />
              <ResumenContrato data={data} doc={doc} />
            </aside>
            <section className="editor__main" aria-label="Formulario">
              <ContractForms
                data={data}
                set={set}
                setPersona={setPersona}
                onChangeTipo={cambiarTipo}
                revision={revision}
                marca={marca}
                setMarca={setMarca}
                paso={paso}
                setPaso={setPaso}
                huella={doc.huella}
              />
            </section>
          </div>
          <aside className="preview-side panel-sticky" aria-label="Vista previa">
            <PreviewPanel
              data={diferido}
              doc={doc}
              marca={marca}
              revision={revision}
              onIrFormulario={irAHallazgo}
              onIrFirmas={() => {
                setVista("form");
                setPaso(6);
                setData((prev) => (prev.firmaModo === "virtual" ? prev : { ...prev, firmaModo: "virtual" }));
              }}
            />
          </aside>
        </div>

        <p className="footer-note no-print">
          Herramienta de apoyo para la redacción de documentos. No constituye asesoría legal. Para asuntos de alta complejidad o valor, consulte a un(a)
          abogado(a) idóneo(a) en la República de Panamá. Textos basados en el Código de Trabajo, la Ley 81 de 2019 (Protección de Datos Personales), la Ley
          64 de 2012 (Derecho de Autor) y la Ley 126 de 2020 (Teletrabajo).
        </p>
      </main>

      <nav className="mobile-switch no-print" aria-label="Cambiar vista">
        <button className={vista === "form" ? "on" : ""} onClick={() => setVista("form")}>
          <EditIcon size={17} /> Formulario
        </button>
        <button className={vista === "preview" ? "on" : ""} onClick={() => setVista("preview")}>
          <EyeIcon size={17} /> Vista previa
          {revision.completitud < 100 && <span className="mobile-switch__pct">{revision.completitud}%</span>}
        </button>
      </nav>

      <GuardadosModal
        open={verGuardados}
        onClose={() => setVerGuardados(false)}
        data={data}
        activoId={activoId}
        setActivoId={setActivoId}
        onCargar={(d, id) => {
          setData(d);
          setActivoId(id);
          notificar("Contrato abierto.");
        }}
      />
    </>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <Generador />
    </ToastProvider>
  );
}
