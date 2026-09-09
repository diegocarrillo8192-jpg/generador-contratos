import type { FormData, Persona, TipoContrato } from "@/lib/types";
import {
  corregimientosDe,
  distritosDe,
  PROVINCIAS,
} from "@/lib/panama";
import { Field, Card, Seg } from "./ui";
import {
  BuildingIcon,
  BriefcaseIcon,
  HandshakeIcon,
  ScaleIcon,
  UsersIcon,
  ClockIcon,
} from "./icons";

type Which = "empleador" | "trabajador";

const MENSAJES = {
  laboral: {
    A: "Empleador",
    B: "Trabajador",
  },
  servicios: {
    A: "Contratante",
    B: "Contratista",
  },
};

function ToggleTipo({
  value,
  disabled,
  onChange,
}: {
  value: Persona["tipo"];
  disabled?: boolean;
  onChange: (v: Persona["tipo"]) => void;
}) {
  if (disabled) return null;
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
      {(["natural", "juridica"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          style={
            value === t
              ? {
                  background: "linear-gradient(135deg,#0ea5b7,#2563eb)",
                  borderColor: "transparent",
                  color: "#fff",
                }
              : {}
          }
          className="check-pill"
        >
          {t === "natural" ? "Persona natural" : "Persona jurídica"}
        </button>
      ))}
    </div>
  );
}

function LocationFields({
  persona,
  onPatch,
}: {
  persona: Persona;
  onPatch: (k: keyof Persona, v: string) => void;
}) {
  const distritos = distritosDe(persona.provincia);
  const corregimientos = corregimientosDe(persona.provincia, persona.distrito);
  const dlId = `dl-${persona.distrito || "x"}-${persona.provincia}`.replace(/\s+/g, "");
  return (
    <>
      <div className="field-grid">
        <Field label="Provincia" required>
          <select
            className="ui-input"
            value={persona.provincia}
            onChange={(e) => {
              onPatch("provincia", e.target.value);
              onPatch("distrito", "");
              onPatch("corregimiento", "");
            }}
          >
            <option value="">Seleccione…</option>
            {PROVINCIAS.map((p) => (
              <option key={p.nombre} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Distrito" required>
          <select
            className="ui-input"
            value={persona.distrito}
            disabled={!persona.provincia}
            onChange={(e) => {
              onPatch("distrito", e.target.value);
              onPatch("corregimiento", "");
            }}
          >
            <option value="">Seleccione…</option>
            {distritos.map((d) => (
              <option key={d.nombre} value={d.nombre}>
                {d.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Corregimiento" required>
          <>
            <input
              className="ui-input"
              list={dlId}
              value={persona.corregimiento}
              placeholder={persona.distrito ? `Corregimiento de ${persona.distrito}` : "Seleccione distrito primero"}
              onChange={(e) => onPatch("corregimiento", e.target.value)}
            />
            <datalist id={dlId}>
              {corregimientos.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </>
        </Field>
        <Field label="Teléfono">
          <input
            className="ui-input"
            value={persona.telefono}
            placeholder="+507 0000-0000"
            onChange={(e) => onPatch("telefono", e.target.value)}
          />
        </Field>
      </div>
      <div className="field-grid" style={{ marginTop: 12 }}>
        <Field label="Correo electrónico" full>
          <input
            type="email"
            className="ui-input"
            value={persona.correo}
            placeholder="correo@ejemplo.com"
            onChange={(e) => onPatch("correo", e.target.value)}
          />
        </Field>
        <Field label="Dirección exacta (urbanización, calle, casa/edificio, piso)" full>
          <input
            className="ui-input"
            value={persona.direccion}
            placeholder="Ej.: Calle 50, Edificio ... piso ..., Bella Vista"
            onChange={(e) => onPatch("direccion", e.target.value)}
          />
        </Field>
      </div>
    </>
  );
}

function PersonaFields({
  persona,
  onPatch,
  lockNatural,
  nombreLabel,
  showProfesion,
}: {
  persona: Persona;
  onPatch: (k: keyof Persona, v: string) => void;
  lockNatural?: boolean;
  nombreLabel: string;
  showProfesion?: boolean;
}) {
  const esJuridica = persona.tipo === "juridica";
  return (
    <div>
      <ToggleTipo
        value={persona.tipo}
        disabled={lockNatural}
        onChange={(t) => onPatch("tipo", t)}
      />
      <div className="field-grid" style={{ marginTop: 10 }}>
        <Field label={nombreLabel} required full={esJuridica}>
          <input
            className="ui-input"
            value={persona.nombre}
            placeholder={esJuridica ? "Razón social o denominación social" : "Nombre completo"}
            onChange={(e) => onPatch("nombre", e.target.value)}
          />
        </Field>
        {esJuridica && (
          <Field label="Representante legal / apoderado" full required>
            <input
              className="ui-input"
              value={persona.representante}
              placeholder="Nombre del representante legal"
              onChange={(e) => onPatch("representante", e.target.value)}
            />
          </Field>
        )}
        <Field label="Cédula de Identidad Personal" required={!esJuridica}>
          <input
            className="ui-input"
            value={persona.cedula}
            placeholder="8-1234-567"
            onChange={(e) => onPatch("cedula", e.target.value)}
          />
        </Field>
        <Field label="RUC">
          <div className="field-grid" style={{ gap: 8 }}>
            <input
              className="ui-input"
              value={persona.ruc}
              placeholder="8-123-1234-123"
              style={{ minWidth: 0 }}
              onChange={(e) => onPatch("ruc", e.target.value)}
            />
            <input
              className="ui-input"
              value={persona.dv}
              placeholder="DV"
              style={{ minWidth: 0 }}
              onChange={(e) => onPatch("dv", e.target.value)}
            />
          </div>
        </Field>
        {showProfesion && (
          <Field label={persona.tipo === "juridica" ? "Especialidad / giro" : "Profesión o especialidad"} full>
            <input
              className="ui-input"
              value={persona.profesion}
              placeholder="Ej.: Ingeniero(a), abogado(a), consultor(a), empresa de tecnología…"
              onChange={(e) => onPatch("profesion", e.target.value)}
            />
          </Field>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <LocationFields persona={persona} onPatch={onPatch} />
      </div>
    </div>
  );
}

export default function ContractForms({
  data,
  set,
  setPersona,
  onChangeTipo,
}: {
  data: FormData;
  set: (patch: Partial<FormData>) => void;
  setPersona: (which: Which, k: keyof Persona, v: string) => void;
  onChangeTipo: (t: TipoContrato) => void;
}) {
  const esLaboral = data.tipo !== "servicios";
  const esServicios = data.tipo === "servicios";
  const esIndefinido = data.tipo === "indefinido";
  const esObra = data.tipo === "obra";
  const esTemporal = data.tipo === "definido" || data.tipo === "obra";
  const rotulo = esServicios ? MENSAJES.servicios : MENSAJES.laboral;
  const esTrabajadorNatural = data.tipo === "servicios" ? false : true;

  const categoria: "temporal" | "indefinido" | "servicios" = esServicios
    ? "servicios"
    : esIndefinido
      ? "indefinido"
      : "temporal";

  return (
    <div>
      <p className="form-intro">
        Complete los datos del documento. La vista previa y el texto legal se
        actualizan en tiempo real con base en la legislación de la República de
        Panamá (Código de Trabajo, Ley 81 de 2019, Ley del XIII mes, entre
        otras).
      </p>

      <Card
        id="tipo"
        icon={<ScaleIcon />}
        title="1. Tipo de contrato"
        sub="Seleccione el modelo legal que desea generar"
      >
        <Seg
          value={categoria}
          onChange={(v) => {
            if (v === "temporal") onChangeTipo("definido");
            else if (v === "indefinido") onChangeTipo("indefinido");
            else onChangeTipo("servicios");
          }}
          options={[
            {
              value: "temporal",
              label: "Laboral Definido / Obra",
              badge: "Art. 62 y ss. C.T.",
              icon: <ClockIcon />,
            },
            {
              value: "indefinido",
              label: "Laboral Indefinido",
              badge: "Período de prueba · Art. 78 C.T.",
              icon: <BriefcaseIcon />,
            },
            {
              value: "servicios",
              label: "Servicios Profesionales",
              badge: "B2B / independiente",
              icon: <HandshakeIcon />,
            },
          ]}
        />
        {esTemporal && (
          <div style={{ marginTop: 12 }}>
            <div className="field-grid">
              <Field label="Modalidad del contrato temporal" full>
                <Seg
                  value={esObra ? "obra" : "definido"}
                  onChange={(v) => onChangeTipo(v)}
                  options={[
                    { value: "definido", label: "Por tiempo definido" },
                    { value: "obra", label: "Por obra determinada" },
                  ]}
                />
              </Field>
            </div>
            {esObra && (
              <Field label="Descripción de la obra determinada" full required hint="Escriba una labor por línea para enumerarlas dentro de la cláusula.">
                <textarea
                  className="ui-input"
                  rows={3}
                  value={data.obraDescripcion}
                  placeholder={"Ej.:\nConstrucción de muro perimetral…\nInstalación eléctrica…\nPintura general…"}
                  onChange={(e) => set({ obraDescripcion: e.target.value })}
                />
              </Field>
            )}
          </div>
        )}
      </Card>

      <Card
        icon={<UsersIcon />}
        title={`2. Datos de ${rotulo.A.toLowerCase()}`}
        sub={
          esServicios
            ? "Persona natural o jurídica que contrata el servicio (B2B)"
            : "RUC, DV, Cédula y domicilio de la parte empleadora"
        }
      >
        <PersonaFields
          persona={data.empleador}
          onPatch={(k, v) => setPersona("empleador", k, v)}
          nombreLabel={data.empleador.tipo === "juridica" ? "Razón social" : "Nombre completo"}
          showProfesion={esServicios && data.empleador.tipo === "natural"}
        />
      </Card>

      <Card
        icon={<BuildingIcon />}
        title={`3. Datos de ${rotulo.B.toLowerCase()}`}
        sub={
          esServicios
            ? "Profesional independiente o empresa contratista"
            : esTrabajadorNatural
              ? "Cédula, RUC y domicilio de la persona trabajadora"
              : ""
        }
      >
        <PersonaFields
          persona={data.trabajador}
          onPatch={(k, v) => setPersona("trabajador", k, v)}
          lockNatural={!esServicios}
          nombreLabel={data.trabajador.tipo === "juridica" ? "Razón social" : "Nombre completo"}
          showProfesion={esServicios}
        />
      </Card>

      {esLaboral && (
        <Card
          icon={<BriefcaseIcon />}
          title="4. Condiciones de la relación de trabajo"
          sub="Cargo, jornada, salario y período de prueba (si aplica)"
        >
          <div className="field-grid">
            <Field label="Cargo o puesto" required>
              <input
                className="ui-input"
                value={data.cargo}
                placeholder="Ej.: Asistente administrativo"
                onChange={(e) => set({ cargo: e.target.value })}
              />
            </Field>
            <Field label="Lugar de trabajo" required>
              <input
                className="ui-input"
                value={data.lugarTrabajo}
                placeholder="Ej.: Ciudad de Panamá"
                onChange={(e) => set({ lugarTrabajo: e.target.value })}
              />
            </Field>
            <Field label="Fecha de inicio" required>
              <input
                type="date"
                className="ui-input"
                value={data.fechaInicio}
                onChange={(e) => set({ fechaInicio: e.target.value })}
              />
            </Field>
            {esTemporal ? (
              <Field
                label={esObra ? "Fecha estimada de finalización" : "Fecha de finalización"}
                hint={esObra ? "Opcional: el contrato termina al concluir la obra." : "El contrato termina en esta fecha."}
              >
                <input
                  type="date"
                  className="ui-input"
                  value={data.fechaFin}
                  onChange={(e) => set({ fechaFin: e.target.value })}
                />
              </Field>
            ) : (
              <Field label="Duración">
                <input className="ui-input" value="Por tiempo indefinido" disabled />
              </Field>
            )}
            <Field label="Jornada de trabajo" required>
              <select
                className="ui-input"
                value={data.jornada}
                onChange={(e) => set({ jornada: e.target.value as FormData["jornada"] })}
              >
                <option value="diurna">Diurna (máx. 8 h / 48 h sem.)</option>
                <option value="mixta">Mixta (máx. 7.5 h / 45 h sem.)</option>
                <option value="nocturna">Nocturna (máx. 7 h / 42 h sem.)</option>
              </select>
            </Field>
            <Field label="Horas semanales">
              <input
                className="ui-input"
                inputMode="numeric"
                value={data.horasSemanales}
                onChange={(e) => set({ horasSemanales: e.target.value })}
              />
            </Field>
          </div>
          <div className="field-grid" style={{ marginTop: 12 }}>
            <Field label="Salario mensual (US$ / B/.)" required>
              <div className="input-wrap">
                <input
                  className="ui-input"
                  inputMode="decimal"
                  value={data.salario}
                  placeholder="1250.00"
                  onChange={(e) => set({ salario: e.target.value })}
                />
                <span className="suffix">B/.</span>
              </div>
            </Field>
            <Field label="Periodicidad de pago">
              <select
                className="ui-input"
                value={data.periodicidadPago}
                onChange={(e) => set({ periodicidadPago: e.target.value as FormData["periodicidadPago"] })}
              >
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
              </select>
            </Field>
            <Field label="Forma de pago">
              <select
                className="ui-input"
                value={data.formaPago}
                onChange={(e) => set({ formaPago: e.target.value })}
              >
                <option value="transferencia bancaria">Transferencia bancaria</option>
                <option value="cheque">Cheque</option>
                <option value="efectivo">Efectivo</option>
                <option value="mixta">Mixta (cheque / transferencia)</option>
              </select>
            </Field>
            <Field label="Beneficios adicionales" hint="Uno por línea. Ej.: seguro de gastos médicos, bono, alimentación…">
              <textarea
                className="ui-input"
                rows={2}
                value={data.beneficios}
                placeholder="Seguro médico privado"
                onChange={(e) => set({ beneficios: e.target.value })}
              />
            </Field>
          </div>
          {esIndefinido && (
            <div className="field-grid" style={{ marginTop: 14 }}>
              <div className="field field--full">
                <span className="field__label">
                  Período de prueba (Artículo 78 del Código de Trabajo)
                </span>
                <label className="check-pill">
                  <input
                    type="checkbox"
                    checked={data.periodoPrueba}
                    onChange={(e) => set({ periodoPrueba: e.target.checked })}
                  />
                  Incluir cláusula de período de prueba de hasta 3 meses
                </label>
              </div>
              {data.periodoPrueba && (
                <Field label="Meses de período de prueba" hint="Máximo legal: 3 meses.">
                  <input
                    className="ui-input"
                    inputMode="numeric"
                    value={data.mesesPrueba}
                    onChange={(e) => set({ mesesPrueba: e.target.value })}
                  />
                </Field>
              )}
            </div>
          )}
        </Card>
      )}

      {esServicios && (
        <Card
          icon={<HandshakeIcon />}
          title="4. Objeto, honorarios y plazo (B2B / USD)"
          sub="Servicios profesionales independientes"
        >
          <div className="field-grid">
            <Field label="Objeto del contrato" full required>
              <textarea
                className="ui-input"
                rows={2}
                value={data.objeto}
                placeholder="Ej.: Asesoría legal tributaria, desarrollo de software, consultoría…"
                onChange={(e) => set({ objeto: e.target.value })}
              />
            </Field>
            <Field label="Fecha de inicio" required>
              <input
                type="date"
                className="ui-input"
                value={data.fechaInicio}
                onChange={(e) => set({ fechaInicio: e.target.value })}
              />
            </Field>
            <Field label="Fecha de fin / plazo">
              <input
                type="date"
                className="ui-input"
                value={data.fechaFin}
                onChange={(e) => set({ fechaFin: e.target.value })}
              />
            </Field>
            <Field label="Honorarios totales (USD)" required>
              <div className="input-wrap">
                <input
                  className="ui-input"
                  inputMode="decimal"
                  value={data.honorarios}
                  placeholder="5000.00"
                  onChange={(e) => set({ honorarios: e.target.value })}
                />
                <span className="suffix">USD</span>
              </div>
            </Field>
            <Field label="Plazo de pago (días)" hint="Días tras la factura.">
              <input
                className="ui-input"
                inputMode="numeric"
                value={data.plazoPago}
                placeholder="30"
                onChange={(e) => set({ plazoPago: e.target.value })}
              />
            </Field>
          </div>
          <div className="field-grid" style={{ marginTop: 12 }}>
            <Field label="Calendario / forma de pago" full hint="Uno por línea: % o monto + hito. Ej.: 50% al inicio, 50% contra entrega.">
              <textarea
                className="ui-input"
                rows={2}
                value={data.formaPagoServicios}
                placeholder={"50% a la firma\n50% contra entrega final"}
                onChange={(e) => set({ formaPagoServicios: e.target.value })}
              />
            </Field>
          </div>
          <div className="field-grid" style={{ marginTop: 12 }}>
            <Field label="Penalidad por día de retraso (%)">
              <div className="input-wrap">
                <input
                  className="ui-input"
                  inputMode="decimal"
                  value={data.penalidadDia}
                  onChange={(e) => set({ penalidadDia: e.target.value })}
                />
                <span className="suffix">%</span>
              </div>
            </Field>
            <Field label="Tope máximo de penalidad (%)">
              <div className="input-wrap">
                <input
                  className="ui-input"
                  inputMode="decimal"
                  value={data.penalidadTecho}
                  onChange={(e) => set({ penalidadTecho: e.target.value })}
                />
                <span className="suffix">%</span>
              </div>
            </Field>
          </div>
        </Card>
      )}

      <Card
        icon={<BuildingIcon />}
        title="5. Descripción de labores"
        sub={
          esServicios
            ? "Desglose de los entregables y trabajos a realizar"
            : "Desglose de funciones del cargo (una por línea)"
        }
      >
        <Field label={esServicios ? "Entregables / trabajos" : "Funciones del cargo"} full required>
          <textarea
            className="ui-input"
            rows={5}
            value={data.funciones}
            placeholder={
              esServicios
                ? "Informe de asesoría…\nDiseño de campaña…\nCódigo fuente y documentación…"
                : "Atención a clientes…\nRegistro de facturación…\nArchivo y control de documentos…"
            }
            onChange={(e) => set({ funciones: e.target.value })}
          />
        </Field>
        <div style={{ height: 10 }} />
        <Field
          label={esServicios ? "Causales de terminación del contrato" : "Causales legales de terminación (justa causa)"}
          full
          hint={
            esServicios
              ? "Editable. Por defecto se listan causales para resolución del contrato B2B."
              : "Editable. Se citan las causales de justa causa del Artículo 213 del Código de Trabajo."
          }
        >
          <textarea
            className="ui-input"
            rows={7}
            value={data.causales}
            onChange={(e) => set({ causales: e.target.value })}
          />
        </Field>
      </Card>

      <Card
        icon={<ClockIcon />}
        title="6. Fecha y formato del documento"
        sub="Lugar de suscripción y tamaño de papel para la exportación"
      >
        <div className="field-grid">
          <Field label="Fecha de suscripción" required>
            <input
              type="date"
              className="ui-input"
              value={data.fechaSuscripcion}
              onChange={(e) => set({ fechaSuscripcion: e.target.value })}
            />
          </Field>
          <Field label="Ciudad de suscripción" required>
            <input
              className="ui-input"
              value={data.ciudadSuscripcion}
              placeholder="Ciudad de Panamá"
              onChange={(e) => set({ ciudadSuscripcion: e.target.value })}
            />
          </Field>
          <Field label="Papel de impresión / PDF" full>
            <Seg
              value={data.papel}
              onChange={(v) => set({ papel: v })}
              options={[
                { value: "carta", label: "Carta (Letter)" },
                { value: "a4", label: "A4" },
              ]}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
