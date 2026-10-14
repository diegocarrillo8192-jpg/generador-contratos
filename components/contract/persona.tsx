import type { Persona } from "@/lib/types";
import { corregimientosDe, distritosDe, PROVINCIAS } from "@/lib/panama";
import { Field, Seg } from "../ui";
import { BuildingIcon, UsersIcon } from "../icons";

export type Which = "empleador" | "trabajador";

export type PersonaPatch = (k: keyof Persona, v: string) => void;

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
  const dlId = `${prefix}-corregimientos`;
  return (
    <div className="field-grid">
      <Field label="Provincia / comarca" htmlFor={`${prefix}-provincia`}>
        <select
          id={`${prefix}-provincia`}
          className="ui-input"
          value={persona.provincia}
          onChange={(e) => onPatch("provincia", e.target.value)}
        >
          <option value="">Seleccione…</option>
          {PROVINCIAS.map((p) => (
            <option key={p.nombre} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Distrito" htmlFor={`${prefix}-distrito`}>
        <select
          id={`${prefix}-distrito`}
          className="ui-input"
          value={persona.distrito}
          disabled={!persona.provincia}
          onChange={(e) => onPatch("distrito", e.target.value)}
        >
          <option value="">Seleccione…</option>
          {distritos.map((d) => (
            <option key={d.nombre} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Corregimiento" htmlFor={`${prefix}-corregimiento`} hint={corregimientos.length ? "Elija de la lista o escríbalo." : undefined}>
        <input
          id={`${prefix}-corregimiento`}
          className="ui-input"
          list={corregimientos.length ? dlId : undefined}
          value={persona.corregimiento}
          autoComplete="off"
          placeholder={persona.distrito ? `Corregimiento de ${persona.distrito}` : "Seleccione el distrito"}
          onChange={(e) => onPatch("corregimiento", e.target.value)}
        />
        {corregimientos.length > 0 && (
          <datalist id={dlId}>
            {corregimientos.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        )}
      </Field>
      <Field label="Teléfono" htmlFor={`${prefix}-telefono`}>
        <input
          id={`${prefix}-telefono`}
          className="ui-input"
          type="tel"
          autoComplete="tel"
          value={persona.telefono}
          placeholder="+507 6000-0000"
          onChange={(e) => onPatch("telefono", e.target.value)}
        />
      </Field>
      <Field label="Dirección exacta" required full htmlFor={`${prefix}-direccion`} hint="Urbanización o barriada, calle, casa o edificio, piso y oficina.">
        <input
          id={`${prefix}-direccion`}
          className="ui-input"
          value={persona.direccion}
          placeholder="Ej.: Calle 50, Edificio Global, piso 8, oficina 8-B"
          onChange={(e) => onPatch("direccion", e.target.value)}
        />
      </Field>
      <Field label="Correo electrónico" full htmlFor={`${prefix}-correo`}>
        <input
          id={`${prefix}-correo`}
          type="email"
          autoComplete="email"
          className="ui-input"
          value={persona.correo}
          placeholder="correo@ejemplo.com"
          onChange={(e) => onPatch("correo", e.target.value)}
        />
      </Field>
    </div>
  );
}

export function PersonaFields({
  persona,
  prefix,
  onPatch,
  lockNatural,
  showProfesion,
}: {
  persona: Persona;
  prefix: string;
  onPatch: PersonaPatch;
  lockNatural?: boolean;
  showProfesion?: boolean;
}) {
  const esJuridica = persona.tipo === "juridica";
  return (
    <div className="stack">
      {!lockNatural && (
        <Seg
          label="Tipo de persona"
          value={persona.tipo}
          onChange={(t) => onPatch("tipo", t)}
          options={[
            { value: "natural", label: "Persona natural", icon: <UsersIcon size={16} /> },
            { value: "juridica", label: "Persona jurídica", icon: <BuildingIcon size={16} /> },
          ]}
        />
      )}
      <div className="field-grid">
        <Field label={esJuridica ? "Razón social" : "Nombre completo"} required full htmlFor={`${prefix}-nombre`}>
          <input
            id={`${prefix}-nombre`}
            className="ui-input"
            value={persona.nombre}
            autoComplete={esJuridica ? "organization" : "name"}
            placeholder={esJuridica ? "Ej.: Comercial del Istmo, S.A." : "Nombre y apellidos completos"}
            onChange={(e) => onPatch("nombre", e.target.value)}
          />
        </Field>
        {esJuridica && (
          <Field label="Representante legal / apoderado" full required htmlFor={`${prefix}-representante`}>
            <input
              id={`${prefix}-representante`}
              className="ui-input"
              value={persona.representante}
              placeholder="Nombre completo del representante legal"
              onChange={(e) => onPatch("representante", e.target.value)}
            />
          </Field>
        )}
        <Field
          label={esJuridica ? "Cédula del representante" : "Cédula de identidad"}
          required
          htmlFor={`${prefix}-cedula`}
          hint="Formato: 8-123-4567 · PE-1-234 · E-8-12345"
        >
          <input
            id={`${prefix}-cedula`}
            className="ui-input"
            value={persona.cedula}
            placeholder="8-123-4567"
            onChange={(e) => onPatch("cedula", e.target.value.toUpperCase())}
          />
        </Field>
        {!esJuridica ? (
          <Field label="Nacionalidad" htmlFor={`${prefix}-nacionalidad`}>
            <input
              id={`${prefix}-nacionalidad`}
              className="ui-input"
              value={persona.nacionalidad}
              placeholder="panameña"
              list="nacionalidades"
              onChange={(e) => onPatch("nacionalidad", e.target.value)}
            />
          </Field>
        ) : (
          <div className="field" aria-hidden="true" />
        )}
        <Field label="RUC" required={esJuridica} htmlFor={`${prefix}-ruc`}>
          <input
            id={`${prefix}-ruc`}
            className="ui-input"
            value={persona.ruc}
            placeholder={esJuridica ? "155555555-2-2020" : "8-123-4567"}
            onChange={(e) => onPatch("ruc", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="DV" htmlFor={`${prefix}-dv`} hint="Dígito verificador">
          <input
            id={`${prefix}-dv`}
            className="ui-input"
            inputMode="numeric"
            maxLength={3}
            value={persona.dv}
            placeholder="00"
            onChange={(e) => onPatch("dv", e.target.value.replace(/[^0-9]/g, ""))}
          />
        </Field>
        {showProfesion && (
          <Field label={esJuridica ? "Actividad o giro" : "Profesión u oficio"} full htmlFor={`${prefix}-profesion`}>
            <input
              id={`${prefix}-profesion`}
              className="ui-input"
              value={persona.profesion}
              placeholder={esJuridica ? "Ej.: servicios de consultoría tecnológica" : "Ej.: ingeniero(a) civil, contador(a) público autorizado"}
              onChange={(e) => onPatch("profesion", e.target.value)}
            />
          </Field>
        )}
      </div>
      <div className="divider-label">Domicilio</div>
      <LocationFields persona={persona} prefix={prefix} onPatch={onPatch} />
    </div>
  );
}

export function NacionalidadesDatalist() {
  return (
    <datalist id="nacionalidades">
      {["panameña", "colombiana", "venezolana", "costarricense", "nicaragüense", "dominicana", "estadounidense", "española", "mexicana", "china", "cubana", "peruana", "ecuatoriana"].map((n) => (
        <option key={n} value={n} />
      ))}
    </datalist>
  );
}
