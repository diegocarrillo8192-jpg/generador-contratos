import type { Persona } from "@/lib/types";
import {
  corregimientosDe,
  distritosDe,
  PROVINCIAS,
} from "@/lib/panama";
import { Field } from "../ui";

export type Which = "empleador" | "trabajador";

export type PersonaPatch = (k: keyof Persona, v: string) => void;

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

export function LocationFields({
  persona,
  prefix,
  onPatch,
}: {
  persona: Persona;
  prefix: string;
  onPatch: PersonaPatch;
}) {
  const distritos = distritosDe(persona.provincia);
  const corregimientos = corregimientosDe(persona.provincia, persona.distrito);
  const dlId = `dl-${persona.distrito || "x"}-${persona.provincia}`.replace(/\s+/g, "");
  return (
    <>
      <div className="field-grid">
        <Field label="Provincia" required htmlFor={`${prefix}-provincia`}>
          <select
            id={`${prefix}-provincia`}
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
        <Field label="Distrito" required htmlFor={`${prefix}-distrito`}>
          <select
            id={`${prefix}-distrito`}
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
        <Field label="Corregimiento" required htmlFor={`${prefix}-corregimiento`}>
          <>
            <input
              id={`${prefix}-corregimiento`}
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
        <Field label="Teléfono" htmlFor={`${prefix}-telefono`}>
          <input
            id={`${prefix}-telefono`}
            className="ui-input"
            value={persona.telefono}
            placeholder="+507 0000-0000"
            onChange={(e) => onPatch("telefono", e.target.value)}
          />
        </Field>
      </div>
      <div className="field-grid" style={{ marginTop: 12 }}>
        <Field label="Correo electrónico" full htmlFor={`${prefix}-correo`}>
          <input
            id={`${prefix}-correo`}
            type="email"
            className="ui-input"
            value={persona.correo}
            placeholder="correo@ejemplo.com"
            onChange={(e) => onPatch("correo", e.target.value)}
          />
        </Field>
        <Field
          label="Dirección exacta (urbanización, calle, casa/edificio, piso)"
          full
          htmlFor={`${prefix}-direccion`}
        >
          <input
            id={`${prefix}-direccion`}
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

export function PersonaFields({
  persona,
  prefix,
  onPatch,
  lockNatural,
  nombreLabel,
  showProfesion,
}: {
  persona: Persona;
  prefix: string;
  onPatch: PersonaPatch;
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
        <Field label={nombreLabel} required full={esJuridica} htmlFor={`${prefix}-nombre`}>
          <input
            id={`${prefix}-nombre`}
            className="ui-input"
            value={persona.nombre}
            placeholder={esJuridica ? "Razón social o denominación social" : "Nombre completo"}
            onChange={(e) => onPatch("nombre", e.target.value)}
          />
        </Field>
        {esJuridica && (
          <Field label="Representante legal / apoderado" full required htmlFor={`${prefix}-representante`}>
            <input
              id={`${prefix}-representante`}
              className="ui-input"
              value={persona.representante}
              placeholder="Nombre del representante legal"
              onChange={(e) => onPatch("representante", e.target.value)}
            />
          </Field>
        )}
        <Field label="Cédula de Identidad Personal" required={!esJuridica} htmlFor={`${prefix}-cedula`}>
          <input
            id={`${prefix}-cedula`}
            className="ui-input"
            value={persona.cedula}
            placeholder="8-1234-567"
            onChange={(e) => onPatch("cedula", e.target.value)}
          />
        </Field>
        <Field label="RUC" htmlFor={`${prefix}-ruc`}>
          <div className="field-grid" style={{ gap: 8 }}>
            <input
              id={`${prefix}-ruc`}
              className="ui-input"
              value={persona.ruc}
              placeholder="8-123-1234-123"
              style={{ minWidth: 0 }}
              onChange={(e) => onPatch("ruc", e.target.value)}
            />
            <input
              aria-label="Dígito Verificador (DV)"
              className="ui-input"
              value={persona.dv}
              placeholder="DV"
              style={{ minWidth: 0 }}
              onChange={(e) => onPatch("dv", e.target.value)}
            />
          </div>
        </Field>
        {showProfesion && (
          <Field
            label={persona.tipo === "juridica" ? "Especialidad / giro" : "Profesión o especialidad"}
            full
            htmlFor={`${prefix}-profesion`}
          >
            <input
              id={`${prefix}-profesion`}
              className="ui-input"
              value={persona.profesion}
              placeholder="Ej.: Ingeniero(a), abogado(a), consultor(a), empresa de tecnología…"
              onChange={(e) => onPatch("profesion", e.target.value)}
            />
          </Field>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <LocationFields persona={persona} prefix={prefix} onPatch={onPatch} />
      </div>
    </div>
  );
}
