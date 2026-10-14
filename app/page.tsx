"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { IntroSplash } from "@/components/IntroSplash";
import { Topbar } from "@/components/Topbar";
import ContractForms, { enfocarCampo, pasoDeSeccion } from "@/components/ContractForms";
import PreviewPanel from "@/components/PreviewPanel";
import GuardadosModal from "@/components/GuardadosModal";
import { ToastProvider, useToast } from "@/components/Toast";
import Link from "next/link";
import {
  BookIcon,
  CheckIcon,
  EditIcon,
  EyeIcon,
  FolderIcon,
  PenIcon,
  RefreshIcon,
  ShieldIcon,
  SparkIcon,
  UploadIcon,
} from "@/components/icons";
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

const FLUJO = [
  { icon: <EditIcon size={18} />, t: "Configure", d: "Tipo, partes y condiciones" },
  { icon: <ShieldIcon size={18} />, t: "Revise", d: "Validación legal en vivo" },
  { icon: <PenIcon size={18} />, t: "Firme", d: "A mano o virtualmente" },
  { icon: <UploadIcon size={18} />, t: "Envíe", d: "PDF, Word o correo" },
];

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
        <span className={`autosave autosave--${guardado}`} title="El borrador se guarda en este navegador">
          <i />
          <span className="hide-md">{indicador}</span>
        </span>
        <button className="btn btn--sm btn--ghost topbar__ejemplo" onClick={cargarEjemplo} title="Llenar el formulario con datos ficticios del tipo seleccionado">
          <SparkIcon size={16} />
          <span className="hide-sm">Ejemplo</span>
        </button>
        <button className="btn btn--sm btn--ghost" onClick={() => setVerGuardados(true)} title="Guardar y abrir contratos">
          <FolderIcon size={16} />
          <span className="hide-sm">Mis contratos</span>
        </button>
        <button className="btn btn--sm btn--ghost" onClick={reiniciar} title="Restablecer todos los campos">
          <RefreshIcon size={16} />
          <span className="hide-sm">Restablecer</span>
        </button>
      </Topbar>

      <main className="app">
        <section className="hero no-print">
          <div className="hero__main">
            <span className="eyebrow">
              <ShieldIcon size={13} /> Plataforma legal · República de Panamá
            </span>
            <h1>
              Contratos con <em>precisión corporativa</em>,<br className="hide-sm" /> de la redacción a la firma.
            </h1>
            <p>
              Genere contratos laborales y de servicios profesionales conforme al Código de Trabajo y la legislación panameña vigente, con revisión legal
              automática, firma electrónica y la identidad de su empresa.
            </p>
            <div className="hero__cta">
              <Link href="/manual" className="btn btn--primary">
                <BookIcon size={16} /> Ver manual de uso
              </Link>
              <button type="button" className="btn" onClick={cargarEjemplo}>
                <SparkIcon size={16} /> Probar con un ejemplo
              </button>
            </div>
          </div>
          <ol className="flow" aria-label="Flujo de trabajo">
            {FLUJO.map((f, i) => (
              <li key={f.t} className="flow__item">
                <span className="flow__ico">{f.icon}</span>
                <span className="flow__txt">
                  <span className="flow__n">0{i + 1}</span>
                  <strong>{f.t}</strong>
                  <span>{f.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <ul className="trust" aria-label="Respaldo legal">
            {["Código de Trabajo", "Ley 81 de 2019 · Datos personales", "Ley 51 de 2008 · Firma electrónica", "Ley 126 de 2020 · Teletrabajo", "PDF · Word"].map((t) => (
              <li key={t}>
                <CheckIcon size={13} /> {t}
              </li>
            ))}
          </ul>
        </section>

        <div className={`workspace workspace--${vista}`}>
          <section className="form-side no-print" aria-label="Formulario">
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
          <aside className="preview-side panel-sticky" aria-label="Vista previa">
            <PreviewPanel data={diferido} doc={doc} marca={marca} revision={revision} onIrFormulario={irAHallazgo}
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
