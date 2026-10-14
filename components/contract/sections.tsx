"use client";

import { useRef, useState } from "react";
import type { Firmante, FormData, Marca, Persona, TipoContrato } from "@/lib/types";
import { clausulasDisponibles, textoClausula } from "@/lib/clausulas";
import SignaturePad from "../SignaturePad";
import { HORAS_MAXIMAS, causalesDefaultLaboral, causalesDefaultServicios } from "@/lib/types";
import { diasEntre, montoEnLetras, parseMonto } from "@/lib/format";
import { procesarLogo } from "@/lib/storage";
import type { SeccionId } from "@/lib/validacion";
import { Field, Card, Seg, Switch } from "../ui";
import {
  BuildingIcon,
  BriefcaseIcon,
  CheckIcon,
  HandshakeIcon,
  ScaleIcon,
  UsersIcon,
  ClockIcon,
  ImageIcon,
  UploadIcon,
  TrashIcon,
  PenIcon,
  FileIcon,
  RefreshIcon,
  PrintIcon,
  ShieldIcon,
} from "../icons";
import { PersonaFields, type Which } from "./persona";
import { useToast } from "../Toast";

export interface Rotulo {
  A: string;
  B: string;
}

export type Estados = Record<SeccionId, { total: number; listos: number }>;

type SetFn = (patch: Partial<FormData>) => void;
type SetPersonaFn = (which: Which, k: keyof Persona, v: string) => void;

function DuracionPill({ inicio, fin }: { inicio: string; fin: string }) {
  const dias = diasEntre(inicio, fin);
  if (!inicio || !fin || dias <= 0) return null;
  const meses = Math.floor(dias / 30.4);
  return (
    <span className="pill">
      <ClockIcon size={13} /> {dias} días{meses > 0 ? ` · ≈ ${meses} ${meses === 1 ? "mes" : "meses"}` : ""}
    </span>
  );
}

function LetrasHint({ monto, moneda }: { monto: string; moneda: "balboas" | "dolares" }) {
  const n = parseMonto(monto);
  if (n === null || n <= 0) return null;
  return <span className="hint hint--mono">{montoEnLetras(monto, moneda)}</span>;
}

const BASE_LABORAL = [
  "Objeto, cargo y funciones",
  "Modalidad presencial, híbrida o teletrabajo",
  "Jornada legal · Arts. 30 a 32",
  "Salario en letras y deducciones de ley",
  "Vacaciones y décimo tercer mes",
  "Prima de antigüedad e indemnización",
  "Causales de justa causa · Art. 213",
  "Tres ejemplares para el MITRADEL · Art. 67",
];

const INCLUYE: Record<TipoContrato, string[]> = {
  definido: ["Duración definida · Art. 74", ...BASE_LABORAL],
  obra: ["Obra determinada y su conclusión", ...BASE_LABORAL],
  indefinido: ["Período de prueba · Art. 78", ...BASE_LABORAL],
  servicios: [
    "Objeto y entregables",
    "Honorarios en letras e ITBMS",
    "Calendario de pagos por hitos",
    "Penalidad por retraso con tope",
    "Propiedad intelectual · Ley 64 de 2012",
    "Confidencialidad y datos · Ley 81 de 2019",
    "Relación independiente, sin subordinación",
    "Terminación anticipada con preaviso",
  ],
};

export function TipoContratoCard({
  data,
  set,
  onChangeTipo,
  estado,
}: {
  data: FormData;
  set: SetFn;
  onChangeTipo: (t: TipoContrato) => void;
  estado: Estados["tipo"];
}) {
  const esObra = data.tipo === "obra";
  const esTemporal = data.tipo === "definido" || data.tipo === "obra";
  const categoria: "temporal" | "indefinido" | "servicios" =
    data.tipo === "servicios" ? "servicios" : data.tipo === "indefinido" ? "indefinido" : "temporal";

  return (
    <Card id="sec-tipo" step={1} icon={<ScaleIcon />} title="Tipo de contrato" sub="Elija el modelo legal que desea generar" estado={estado}>
      <Seg
        label="Tipo de contrato"
        value={categoria}
        cols={3}
        onChange={(v) => {
          if (v === "temporal") onChangeTipo("definido");
          else if (v === "indefinido") onChangeTipo("indefinido");
          else onChangeTipo("servicios");
        }}
        options={[
          { value: "temporal", label: "Laboral temporal", badge: "Definido u obra · Art. 74 C.T.", icon: <ClockIcon /> },
          { value: "indefinido", label: "Laboral indefinido", badge: "Con período de prueba", icon: <BriefcaseIcon /> },
          { value: "servicios", label: "Servicios profesionales", badge: "Independiente · B2B", icon: <HandshakeIcon /> },
        ]}
      />
      {esTemporal && (
        <div className="stack" style={{ marginTop: 14 }}>
          <Field label="Modalidad del contrato temporal" full>
            <Seg
              label="Modalidad temporal"
              value={esObra ? "obra" : "definido"}
              onChange={(v) => onChangeTipo(v)}
              options={[
                { value: "definido", label: "Por tiempo definido" },
                { value: "obra", label: "Por obra determinada" },
              ]}
            />
          </Field>
          {esObra && (
            <Field
              label="Descripción de la obra determinada"
              full
              required
              htmlFor="obra-descripcion"
              hint="Escriba una labor por línea; se enumerarán dentro de la cláusula primera."
            >
              <textarea
                id="obra-descripcion"
                className="ui-input"
                rows={3}
                value={data.obraDescripcion}
                placeholder={"Construcción de muro perimetral\nInstalación eléctrica\nPintura general"}
                onChange={(e) => set({ obraDescripcion: e.target.value })}
              />
            </Field>
          )}
        </div>
      )}
      <p className="callout">
        {data.tipo === "servicios"
          ? "Para profesionales o empresas independientes, sin subordinación. Si existe horario, dirección y dependencia, corresponde un contrato laboral."
          : data.tipo === "indefinido"
            ? "Es la regla general del Código de Trabajo. Permite pactar un período de prueba de hasta 3 meses (Art. 78)."
            : esObra
              ? "Termina al concluir la obra descrita. Ideal para proyectos de construcción o trabajos puntuales."
              : "Máximo 1 año (hasta 3 si requiere preparación técnica especial). No debe cubrir puestos permanentes (Art. 75)."}
      </p>
      <div className="incluye">
        <span className="incluye__t">Este modelo incluye</span>
        <ul>
          {INCLUYE[data.tipo].map((x) => (
            <li key={x}>
              <CheckIcon size={14} />
              {x}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function DatosParteCard({
  which,
  data,
  setPersona,
  rotulo,
  esServicios,
  estado,
}: {
  which: Which;
  data: FormData;
  setPersona: SetPersonaFn;
  rotulo: Rotulo;
  esServicios: boolean;
  estado: Estados["parteA"];
}) {
  const esA = which === "empleador";
  const persona = data[which];
  return (
    <Card
      id={esA ? "sec-parteA" : "sec-parteB"}
      step={esA ? 2 : 3}
      icon={esA ? <BuildingIcon /> : <UsersIcon />}
      title={`Datos ${esA ? `del ${rotulo.A.toLowerCase()}` : `del ${rotulo.B.toLowerCase()}`}`}
      sub={
        esA
          ? esServicios
            ? "Persona natural o jurídica que contrata el servicio"
            : "Empresa o persona que contrata al trabajador"
          : esServicios
            ? "Profesional independiente o empresa contratista"
            : "Persona trabajadora (siempre persona natural)"
      }
      estado={estado}
    >
      <PersonaFields
        persona={persona}
        prefix={which}
        onPatch={(k, v) => setPersona(which, k, v)}
        lockNatural={!esA && !esServicios}
        showProfesion={esServicios || !esA}
      />
    </Card>
  );
}

export function CondicionesLaboralesCard({ data, set, estado }: { data: FormData; set: SetFn; estado: Estados["condiciones"] }) {
  const esIndefinido = data.tipo === "indefinido";
  const esObra = data.tipo === "obra";
  const max = HORAS_MAXIMAS[data.jornada];

  return (
    <Card id="sec-condiciones" step={4} icon={<BriefcaseIcon />} title="Condiciones de trabajo" sub="Cargo, fechas, jornada, salario y beneficios" estado={estado}>
      <div className="field-grid">
        <Field label="Cargo o puesto" required htmlFor="cargo">
          <input id="cargo" className="ui-input" value={data.cargo} placeholder="Ej.: Asistente administrativo" onChange={(e) => set({ cargo: e.target.value })} />
        </Field>
        <Field label="Lugar de trabajo" required htmlFor="lugar-trabajo">
          <input
            id="lugar-trabajo"
            className="ui-input"
            value={data.lugarTrabajo}
            placeholder="Ej.: Ciudad de Panamá"
            onChange={(e) => set({ lugarTrabajo: e.target.value })}
          />
        </Field>
        <Field label="Modalidad" full>
          <Seg
            label="Modalidad de trabajo"
            value={data.modalidad}
            onChange={(v) => set({ modalidad: v })}
            options={[
              { value: "presencial", label: "Presencial" },
              { value: "hibrido", label: "Híbrida" },
              { value: "teletrabajo", label: "Teletrabajo" },
            ]}
          />
        </Field>
        <Field label="Fecha de inicio" required htmlFor="fecha-inicio">
          <input id="fecha-inicio" type="date" className="ui-input" value={data.fechaInicio} onChange={(e) => set({ fechaInicio: e.target.value })} />
        </Field>
        {esIndefinido ? (
          <Field label="Duración" htmlFor="duracion">
            <input id="duracion" className="ui-input" value="Por tiempo indefinido" disabled />
          </Field>
        ) : (
          <Field
            label={esObra ? "Fin estimado (opcional)" : "Fecha de finalización"}
            required={!esObra}
            htmlFor="fecha-fin"
            hint={<DuracionPill inicio={data.fechaInicio} fin={data.fechaFin} />}
          >
            <input
              id="fecha-fin"
              type="date"
              className="ui-input"
              min={data.fechaInicio || undefined}
              value={data.fechaFin}
              onChange={(e) => set({ fechaFin: e.target.value })}
            />
          </Field>
        )}
        <Field label="Jornada" required htmlFor="jornada">
          <select
            id="jornada"
            className="ui-input"
            value={data.jornada}
            onChange={(e) => {
              const j = e.target.value as FormData["jornada"];
              const horas = parseMonto(data.horasSemanales);
              const ajustar = horas === null || horas > HORAS_MAXIMAS[j] || horas === HORAS_MAXIMAS[data.jornada];
              set({ jornada: j, ...(ajustar ? { horasSemanales: String(HORAS_MAXIMAS[j]) } : {}) });
            }}
          >
            <option value="diurna">Diurna · 6 a.m. a 6 p.m. (máx. 48 h)</option>
            <option value="mixta">Mixta (máx. 45 h)</option>
            <option value="nocturna">Nocturna · 6 p.m. a 6 a.m. (máx. 42 h)</option>
          </select>
        </Field>
        <Field label="Horas semanales" htmlFor="horas-semanales" hint={`Máximo legal: ${max} horas.`}>
          <div className="input-wrap">
            <input
              id="horas-semanales"
              className="ui-input"
              inputMode="numeric"
              value={data.horasSemanales}
              onChange={(e) => set({ horasSemanales: e.target.value.replace(/[^0-9.]/g, "") })}
            />
            <span className="suffix">h</span>
          </div>
        </Field>
        <Field label="Horario (opcional)" full htmlFor="horario">
          <input
            id="horario"
            className="ui-input"
            value={data.horario}
            placeholder="Ej.: lunes a viernes de 8:00 a.m. a 5:00 p.m., con una hora de almuerzo"
            onChange={(e) => set({ horario: e.target.value })}
          />
        </Field>
      </div>

      <div className="divider-label">Remuneración</div>
      <div className="field-grid">
        <Field label="Salario mensual" required htmlFor="salario" hint={<LetrasHint monto={data.salario} moneda="balboas" />}>
          <div className="input-wrap input-wrap--pre">
            <span className="prefix">B/.</span>
            <input
              id="salario"
              className="ui-input"
              inputMode="decimal"
              value={data.salario}
              placeholder="1,250.00"
              onChange={(e) => set({ salario: e.target.value })}
            />
          </div>
        </Field>
        <Field label="Periodicidad de pago" htmlFor="periodicidad-pago">
          <select
            id="periodicidad-pago"
            className="ui-input"
            value={data.periodicidadPago}
            onChange={(e) => set({ periodicidadPago: e.target.value as FormData["periodicidadPago"] })}
          >
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
            <option value="semanal">Semanal</option>
          </select>
        </Field>
        <Field label="Forma de pago" htmlFor="forma-pago">
          <select id="forma-pago" className="ui-input" value={data.formaPago} onChange={(e) => set({ formaPago: e.target.value })}>
            <option value="transferencia bancaria">Transferencia bancaria</option>
            <option value="cheque">Cheque</option>
            <option value="efectivo, contra recibo firmado">Efectivo</option>
            <option value="cheque o transferencia bancaria">Mixta (cheque / transferencia)</option>
          </select>
        </Field>
        <Field label="Beneficios adicionales" htmlFor="beneficios" hint="Uno por línea.">
          <textarea
            id="beneficios"
            className="ui-input"
            rows={2}
            value={data.beneficios}
            placeholder={"Seguro médico privado\nBono de productividad"}
            onChange={(e) => set({ beneficios: e.target.value })}
          />
        </Field>
      </div>

      {esIndefinido && (
        <div className="stack" style={{ marginTop: 14 }}>
          <Switch
            id="periodo-prueba"
            checked={data.periodoPrueba}
            onChange={(v) => set({ periodoPrueba: v })}
            label="Incluir período de prueba"
            desc="Art. 78 del Código de Trabajo · máximo 3 meses."
          />
          {data.periodoPrueba && (
            <Field label="Duración del período de prueba" htmlFor="meses-prueba">
              <Seg
                label="Meses de prueba"
                value={["1", "2", "3"].includes(data.mesesPrueba) ? data.mesesPrueba : "3"}
                onChange={(v) => set({ mesesPrueba: v })}
                options={[
                  { value: "1", label: "1 mes" },
                  { value: "2", label: "2 meses" },
                  { value: "3", label: "3 meses" },
                ]}
              />
            </Field>
          )}
        </div>
      )}
    </Card>
  );
}

export function ServiciosCard({ data, set, estado }: { data: FormData; set: SetFn; estado: Estados["condiciones"] }) {
  return (
    <Card id="sec-condiciones" step={4} icon={<HandshakeIcon />} title="Objeto, honorarios y plazo" sub="Servicios profesionales independientes (USD)" estado={estado}>
      <div className="field-grid">
        <Field label="Objeto del contrato" full required htmlFor="objeto" hint="Complete la frase: «…contrata los servicios de EL CONTRATISTA para: …»">
          <textarea
            id="objeto"
            className="ui-input"
            rows={2}
            value={data.objeto}
            placeholder="el diseño y desarrollo de una plataforma web de gestión de clientes"
            onChange={(e) => set({ objeto: e.target.value })}
          />
        </Field>
        <Field label="Fecha de inicio" required htmlFor="fecha-inicio">
          <input id="fecha-inicio" type="date" className="ui-input" value={data.fechaInicio} onChange={(e) => set({ fechaInicio: e.target.value })} />
        </Field>
        <Field label="Fecha de fin (opcional)" htmlFor="fecha-fin" hint={<DuracionPill inicio={data.fechaInicio} fin={data.fechaFin} />}>
          <input
            id="fecha-fin"
            type="date"
            className="ui-input"
            min={data.fechaInicio || undefined}
            value={data.fechaFin}
            onChange={(e) => set({ fechaFin: e.target.value })}
          />
        </Field>
        <Field label="Honorarios totales" required htmlFor="honorarios" hint={<LetrasHint monto={data.honorarios} moneda="dolares" />}>
          <div className="input-wrap input-wrap--pre">
            <span className="prefix">US$</span>
            <input
              id="honorarios"
              className="ui-input"
              inputMode="decimal"
              value={data.honorarios}
              placeholder="5,000.00"
              onChange={(e) => set({ honorarios: e.target.value })}
            />
          </div>
        </Field>
        <Field label="Plazo de pago" htmlFor="plazo-pago" hint="Días tras presentar la factura.">
          <div className="input-wrap">
            <input
              id="plazo-pago"
              className="ui-input"
              inputMode="numeric"
              value={data.plazoPago}
              placeholder="30"
              onChange={(e) => set({ plazoPago: e.target.value.replace(/[^0-9]/g, "") })}
            />
            <span className="suffix">días</span>
          </div>
        </Field>
        <div className="field field--full">
          <Switch
            id="itbms"
            checked={data.incluyeItbms}
            onChange={(v) => set({ incluyeItbms: v })}
            label="Los honorarios causan ITBMS (7%)"
            desc="Agrega «más el ITBMS del 7%» a la cláusula de honorarios."
          />
        </div>
        <Field
          label="Calendario de pagos"
          full
          htmlFor="forma-pago-servicios"
          hint="Uno por línea: porcentaje o monto + hito. Si lo deja vacío, se paga contra factura."
        >
          <textarea
            id="forma-pago-servicios"
            className="ui-input"
            rows={3}
            value={data.formaPagoServicios}
            placeholder={"50% a la firma del contrato\n50% contra entrega final"}
            onChange={(e) => set({ formaPagoServicios: e.target.value })}
          />
        </Field>
        <Field label="Penalidad por día de retraso" htmlFor="penalidad-dia" hint="Use 0 para omitir la cláusula.">
          <div className="input-wrap">
            <input
              id="penalidad-dia"
              className="ui-input"
              inputMode="decimal"
              value={data.penalidadDia}
              onChange={(e) => set({ penalidadDia: e.target.value })}
            />
            <span className="suffix">%</span>
          </div>
        </Field>
        <Field label="Tope máximo de penalidad" htmlFor="penalidad-techo">
          <div className="input-wrap">
            <input
              id="penalidad-techo"
              className="ui-input"
              inputMode="decimal"
              value={data.penalidadTecho}
              onChange={(e) => set({ penalidadTecho: e.target.value })}
            />
            <span className="suffix">%</span>
          </div>
        </Field>
        <Field label="Preaviso de terminación anticipada" htmlFor="preaviso">
          <div className="input-wrap">
            <input
              id="preaviso"
              className="ui-input"
              inputMode="numeric"
              value={data.preavisoDias}
              onChange={(e) => set({ preavisoDias: e.target.value.replace(/[^0-9]/g, "") })}
            />
            <span className="suffix">días</span>
          </div>
        </Field>
      </div>
    </Card>
  );
}

export function LaboresCard({ data, set, esServicios, estado }: { data: FormData; set: SetFn; esServicios: boolean; estado: Estados["labores"] }) {
  const defecto = esServicios ? causalesDefaultServicios : causalesDefaultLaboral;
  const modificadas = data.causales.trim() !== defecto.trim();
  return (
    <Card
      id="sec-labores"
      step={5}
      icon={<FileIcon />}
      title={esServicios ? "Entregables y terminación" : "Funciones y terminación"}
      sub={esServicios ? "Trabajos a entregar y causales de resolución" : "Desglose de funciones y causales de justa causa"}
      estado={estado}
    >
      <div className="stack">
        <Field
          label={esServicios ? "Entregables / trabajos" : "Funciones del cargo"}
          full
          required
          htmlFor="funciones"
          hint="Una por línea. Se enumeran automáticamente con a), b), c)…"
        >
          <textarea
            id="funciones"
            className="ui-input"
            rows={5}
            value={esServicios ? data.entregables : data.funciones}
            placeholder={
              esServicios
                ? "Documento de requerimientos aprobado\nPrototipo navegable\nCódigo fuente y documentación"
                : "Atender a clientes y proveedores\nRegistrar la facturación diaria\nArchivar y controlar documentos"
            }
            onChange={(e) => set(esServicios ? { entregables: e.target.value } : { funciones: e.target.value })}
          />
        </Field>
        <Field
          label={esServicios ? "Causales de terminación" : "Causales de justa causa"}
          full
          htmlFor="causales"
          hint={esServicios ? "Texto editable. Se incluye además la terminación anticipada con preaviso." : "Texto editable basado en el Art. 213 del Código de Trabajo."}
        >
          <textarea id="causales" className="ui-input" rows={7} value={data.causales} onChange={(e) => set({ causales: e.target.value })} />
        </Field>
        {modificadas && (
          <button type="button" className="btn btn--ghost btn--sm self-start" onClick={() => set({ causales: defecto })}>
            <RefreshIcon size={14} /> Restaurar texto recomendado
          </button>
        )}
      </div>
    </Card>
  );
}

export function ClausulasCard({ data, set, esServicios, estado }: { data: FormData; set: SetFn; esServicios: boolean; estado: Estados["clausulas"] }) {
  return (
    <Card id="sec-clausulas" step={6} icon={<CheckIcon />} title="Cláusulas y anexos" sub="Confidencialidad, equipos y estipulaciones propias" estado={estado}>
      <div className="stack">
        <Switch
          id="confidencialidad"
          checked={data.confidencialidad}
          onChange={(v) => set({ confidencialidad: v })}
          label="Confidencialidad, datos personales y propiedad intelectual"
          desc={
            esServicios
              ? "Cesión de derechos patrimoniales (Ley 64 de 2012) y encargo de tratamiento de datos (Ley 81 de 2019)."
              : "Deber de secreto, titularidad de las obras creadas y tratamiento de datos (Ley 81 de 2019)."
          }
        />
        <Switch
          id="anexo-equipos"
          checked={data.anexoEquipos}
          onChange={(v) => set({ anexoEquipos: v })}
          label="Anexo de entrega de equipos y herramientas"
          desc="Inventario con líneas de recibo, custodia y devolución."
        />
        {data.anexoEquipos && (
          <Field label="Equipos entregados" full required htmlFor="equipos" hint="Uno por línea: equipo, marca/modelo y serie o placa.">
            <textarea
              id="equipos"
              className="ui-input"
              rows={4}
              value={data.equipos}
              placeholder={"Laptop Lenovo ThinkPad, serie PF-12345\nTeléfono celular corporativo\nVehículo sedán, placa 123456"}
              onChange={(e) => set({ equipos: e.target.value })}
            />
          </Field>
        )}
        <BibliotecaClausulas data={data} set={set} esServicios={esServicios} />
        <Field
          label="Estipulaciones adicionales (opcional)"
          full
          htmlFor="clausulas-adicionales"
          hint="Una por línea. Se agregan como una cláusula numerada antes de la de jurisdicción."
        >
          <textarea
            id="clausulas-adicionales"
            className="ui-input"
            rows={3}
            value={data.clausulasAdicionales}
            placeholder={"EL TRABAJADOR usará uniforme proporcionado por la empresa.\nLas partes acuerdan revisar el salario anualmente."}
            onChange={(e) => set({ clausulasAdicionales: e.target.value })}
          />
        </Field>
      </div>
    </Card>
  );
}

function BibliotecaClausulas({ data, set, esServicios }: { data: FormData; set: SetFn; esServicios: boolean }) {
  const disponibles = clausulasDisponibles(esServicios);
  const elegidas = new Set(data.clausulasExtra);
  const n = disponibles.filter((c) => elegidas.has(c.id)).length;
  const alternar = (id: string) => {
    const nuevo = new Set(elegidas);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    set({ clausulasExtra: [...nuevo] });
  };
  const categorias = [...new Set(disponibles.map((c) => c.categoria))];
  return (
    <div className="biblioteca">
      <div className="biblioteca__head">
        <strong>Biblioteca de cláusulas</strong>
        <span>
          {n} de {disponibles.length} seleccionadas · cada una se agrega como cláusula numerada
        </span>
      </div>
      {categorias.map((cat) => (
        <div key={cat} className="biblioteca__grupo">
          <span className="biblioteca__cat">{cat}</span>
          <div className="biblioteca__grid">
            {disponibles
              .filter((c) => c.categoria === cat)
              .map((c) => {
                const on = elegidas.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`clause-chip ${on ? "clause-chip--on" : ""}`}
                    aria-pressed={on}
                    onClick={() => alternar(c.id)}
                    title={textoClausula(c, esServicios).join(" ")}
                  >
                    <span className="clause-chip__check">{on ? <CheckIcon size={12} /> : "+"}</span>
                    <span className="clause-chip__txt">
                      <strong>{c.titulo}</strong>
                      <span>{c.resumen}</span>
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FirmasCard({
  data,
  set,
  estado,
  huella,
  rotulo,
}: {
  data: FormData;
  set: SetFn;
  estado: Estados["firmas"];
  huella: string;
  rotulo: Rotulo;
}) {
  const firmar = (k: Firmante, img: string) =>
    set({ firmasVirtuales: { ...data.firmasVirtuales, [k]: { img, fecha: new Date().toISOString(), huella } } });
  const borrar = (k: Firmante) => {
    const copia = { ...data.firmasVirtuales };
    delete copia[k];
    set({ firmasVirtuales: copia });
  };
  const virtual = data.firmaModo === "virtual";
  const nombreA =
    data.empleador.tipo === "juridica" && data.empleador.representante.trim()
      ? `${data.empleador.nombre} · ${data.empleador.representante}`
      : data.empleador.nombre;
  const firmantes: Array<{ k: Firmante; titulo: string; nombre: string }> = [
    { k: "izquierda", titulo: rotulo.A, nombre: nombreA },
    { k: "derecha", titulo: rotulo.B, nombre: data.trabajador.nombre },
  ];
  if (data.testigosActivo) {
    firmantes.push({ k: "testigo1", titulo: "Testigo 1", nombre: data.testigo1Nombre }, { k: "testigo2", titulo: "Testigo 2", nombre: data.testigo2Nombre });
  }

  return (
    <Card id="sec-firmas" step={7} icon={<PenIcon />} title="Firmas" sub="Elija cómo se firmará el contrato" estado={estado}>
      <div className="stack">
        <Seg
          label="Modalidad de firma"
          value={data.firmaModo}
          onChange={(v) => set({ firmaModo: v })}
          options={[
            { value: "manuscrita", label: "Imprimir y firmar", badge: "Firma manuscrita en papel", icon: <PrintIcon /> },
            { value: "virtual", label: "Firma virtual", badge: "En pantalla · enviar por correo", icon: <PenIcon /> },
          ]}
        />
        {virtual ? (
          <div className="tip">
            <ShieldIcon size={16} />
            <span>
              La firma trazada en pantalla es una <strong>firma electrónica simple</strong> (Ley 51 de 2008, modificada por la Ley 82 de 2012). Es válida
              entre las partes, pero en un proceso judicial podría requerir peritaje. Para mayor fuerza probatoria use la{" "}
              <strong>firma electrónica calificada</strong> del Registro Público. En contratos laborales, confirme con el MITRADEL los requisitos para su
              registro (Art. 67 C.T.).
            </span>
          </div>
        ) : (
          <p className="hint">
            Imprima el contrato, fírmenlo a mano y rubriquen cada página. En contratos laborales se firman tres ejemplares: uno para cada parte y otro para el
            MITRADEL (Art. 67 C.T.).
          </p>
        )}

        <Switch
          id="testigos"
          checked={data.testigosActivo}
          onChange={(v) => set({ testigosActivo: v })}
          label="Incluir dos testigos"
          desc="Necesarios si alguna parte no sabe o no puede firmar y estampa su huella digital (Art. 68 C.T.)."
        />
        {data.testigosActivo && (
          <div className="field-grid">
            <Field label="Testigo 1 · nombre" required htmlFor="testigo1-nombre">
              <input id="testigo1-nombre" className="ui-input" value={data.testigo1Nombre} placeholder="Nombre completo" onChange={(e) => set({ testigo1Nombre: e.target.value })} />
            </Field>
            <Field label="Testigo 1 · cédula" required htmlFor="testigo1-cedula">
              <input
                id="testigo1-cedula"
                className="ui-input"
                value={data.testigo1Cedula}
                placeholder="8-123-4567"
                onChange={(e) => set({ testigo1Cedula: e.target.value.toUpperCase() })}
              />
            </Field>
            <Field label="Testigo 2 · nombre" required htmlFor="testigo2-nombre">
              <input id="testigo2-nombre" className="ui-input" value={data.testigo2Nombre} placeholder="Nombre completo" onChange={(e) => set({ testigo2Nombre: e.target.value })} />
            </Field>
            <Field label="Testigo 2 · cédula" required htmlFor="testigo2-cedula">
              <input
                id="testigo2-cedula"
                className="ui-input"
                value={data.testigo2Cedula}
                placeholder="8-123-4567"
                onChange={(e) => set({ testigo2Cedula: e.target.value.toUpperCase() })}
              />
            </Field>
          </div>
        )}

        {!virtual && (
          <Switch
            id="notarizacion"
            checked={data.notarizacion}
            onChange={(v) => set({ notarizacion: v })}
            label="Espacio para autenticación notarial"
            desc="Fórmula de autenticación de firmas con espacio para sello y firma del Notario."
          />
        )}

        {virtual && (
          <>
            <div className="divider-label">Firmas en pantalla</div>
            <p className="hint">
              Revise el contrato completo antes de firmar: si el texto cambia después, la firma quedará marcada como desactualizada. Huella actual:{" "}
              <strong className="mono">{huella}</strong>
            </p>
            {firmantes.map((f) => (
              <SignaturePad
                key={f.k}
                id={`firma-${f.k}`}
                titulo={f.titulo}
                nombre={f.nombre}
                firma={data.firmasVirtuales[f.k]}
                huellaActual={huella}
                onFirmar={(img) => firmar(f.k, img)}
                onBorrar={() => borrar(f.k)}
              />
            ))}
            <p className="hint">
              ¿La otra parte está en otro lugar? Firme su parte y use <strong>Enviar → Exportar para firma remota</strong>: la otra persona abre el
              archivo en «Mis contratos → Importar», firma y les devuelve el PDF.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

export function MarcaCard({
  marca,
  setMarca,
  empleador,
}: {
  marca: Marca;
  setMarca: (patch: Partial<Marca>) => void;
  empleador: Persona;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const notificar = useToast();

  const cargar = async (file: File | undefined) => {
    if (!file) return;
    setCargando(true);
    try {
      const logo = await procesarLogo(file);
      setMarca({ logo, mostrar: true });
      notificar("Logo cargado. Ya aparece en la vista previa, el PDF y el Word.");
    } catch (e) {
      notificar(e instanceof Error ? e.message : "No se pudo cargar el logo.", "error");
    } finally {
      setCargando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const usarEmpleador = () => {
    const partes = [
      empleador.ruc.trim() && `RUC ${empleador.ruc.trim()}${empleador.dv.trim() ? ` DV ${empleador.dv.trim()}` : ""}`,
      empleador.direccion.trim(),
      empleador.telefono.trim() && `Tel. ${empleador.telefono.trim()}`,
      empleador.correo.trim(),
    ].filter(Boolean);
    setMarca({ nombre: empleador.nombre.trim(), detalle: partes.join(" · ") });
  };

  return (
    <Card id="sec-marca" step={8} icon={<ImageIcon />} title="Membrete y logo de la empresa" sub="Personalice el encabezado del documento con su identidad">
      <div className="stack">
        <div className="logo-uploader">
          <button
            type="button"
            className={`dropzone ${arrastrando ? "dropzone--over" : ""} ${marca.logo ? "dropzone--has" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              cargar(e.dataTransfer.files?.[0]);
            }}
            aria-label={marca.logo ? "Cambiar logo" : "Subir logo"}
          >
            {marca.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={marca.logo} alt="Logo de la empresa" className="dropzone__img" />
            ) : (
              <>
                <span className="dropzone__ico">
                  <UploadIcon size={22} />
                </span>
                <strong>{cargando ? "Procesando…" : "Arrastre su logo aquí"}</strong>
                <span>o haga clic para buscarlo · PNG, JPG, WEBP o SVG (máx. 5 MB)</span>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            hidden
            onChange={(e) => cargar(e.target.files?.[0])}
          />
          {marca.logo && (
            <div className="row gap-8">
              <button type="button" className="btn btn--sm" onClick={() => inputRef.current?.click()}>
                <UploadIcon size={14} /> Cambiar
              </button>
              <button type="button" className="btn btn--sm btn--danger" onClick={() => setMarca({ logo: "" })}>
                <TrashIcon size={14} /> Quitar logo
              </button>
            </div>
          )}
        </div>

        <div className="field-grid">
          <Field label="Nombre en el membrete" full htmlFor="marca-nombre">
            <input
              id="marca-nombre"
              className="ui-input"
              value={marca.nombre}
              placeholder="Ej.: Comercial del Istmo, S.A."
              onChange={(e) => setMarca({ nombre: e.target.value })}
            />
          </Field>
          <Field label="Línea de detalle" full htmlFor="marca-detalle" hint="RUC, dirección, teléfono, sitio web…">
            <input
              id="marca-detalle"
              className="ui-input"
              value={marca.detalle}
              placeholder="RUC 155555555-2-2020 DV 45 · Calle 50, Ciudad de Panamá · +507 300-0000"
              onChange={(e) => setMarca({ detalle: e.target.value })}
            />
          </Field>
          <Field label="Alineación">
            <Seg
              label="Alineación del membrete"
              value={marca.alineacion}
              onChange={(v) => setMarca({ alineacion: v })}
              options={[
                { value: "izquierda", label: "Izquierda" },
                { value: "centro", label: "Centrado" },
              ]}
            />
          </Field>
          <Field label="Tamaño del logo">
            <Seg
              label="Tamaño del logo"
              value={marca.tamano}
              onChange={(v) => setMarca({ tamano: v })}
              options={[
                { value: "s", label: "S" },
                { value: "m", label: "M" },
                { value: "l", label: "L" },
              ]}
            />
          </Field>
        </div>
        <div className="row gap-8 wrap">
          <button type="button" className="btn btn--sm" onClick={usarEmpleador} disabled={!empleador.nombre.trim()}>
            <BuildingIcon size={14} /> Usar datos de la parte contratante
          </button>
        </div>
        <Switch id="marca-mostrar" checked={marca.mostrar} onChange={(v) => setMarca({ mostrar: v })} label="Mostrar membrete en el documento" desc="El logo se guarda en este navegador y no se borra al restablecer el formulario." />
      </div>
    </Card>
  );
}

export function FechaFormatoCard({ data, set, estado }: { data: FormData; set: SetFn; estado: Estados["formato"] }) {
  return (
    <Card id="sec-formato" icon={<ClockIcon />} title="Lugar, fecha y formato" sub="Lugar y fecha de suscripción, papel y acabado" estado={estado}>
      <div className="field-grid">
        <Field label="Fecha de suscripción" required htmlFor="fecha-suscripcion">
          <input
            id="fecha-suscripcion"
            type="date"
            className="ui-input"
            value={data.fechaSuscripcion}
            onChange={(e) => set({ fechaSuscripcion: e.target.value })}
          />
        </Field>
        <Field label="Ciudad de suscripción" required htmlFor="ciudad-suscripcion">
          <input
            id="ciudad-suscripcion"
            className="ui-input"
            value={data.ciudadSuscripcion}
            placeholder="Ciudad de Panamá"
            list="ciudades"
            onChange={(e) => set({ ciudadSuscripcion: e.target.value })}
          />
          <datalist id="ciudades">
            {["Ciudad de Panamá", "San Miguelito", "La Chorrera", "Arraiján", "Colón", "David", "Santiago de Veraguas", "Chitré", "Las Tablas", "Penonomé", "Aguadulce", "Changuinola", "Bocas del Toro"].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Tamaño de papel" full>
          <Seg
            label="Tamaño de papel"
            value={data.papel}
            onChange={(v) => set({ papel: v })}
            options={[
              { value: "carta", label: "Carta (8½ × 11)" },
              { value: "a4", label: "A4 (210 × 297 mm)" },
            ]}
          />
        </Field>
      </div>
      <div className="stack" style={{ marginTop: 14 }}>
        <Switch
          id="monto-letras"
          checked={data.montoEnLetras}
          onChange={(v) => set({ montoEnLetras: v })}
          label="Escribir montos en letras"
          desc="Ej.: MIL DOSCIENTOS CINCUENTA BALBOAS CON 00/100 (B/. 1,250.00)."
        />
        <Switch
          id="marca-agua"
          checked={data.marcaAgua}
          onChange={(v) => set({ marcaAgua: v })}
          label="Marca de agua «BORRADOR»"
          desc="Útil para enviar versiones de revisión antes de la firma."
        />
      </div>
    </Card>
  );
}
