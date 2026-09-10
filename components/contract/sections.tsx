import type { FormData, Persona, TipoContrato } from "@/lib/types";
import { Field, Card, Seg } from "../ui";
import {
  BuildingIcon,
  BriefcaseIcon,
  CheckIcon,
  HandshakeIcon,
  ScaleIcon,
  UsersIcon,
  ClockIcon,
} from "../icons";
import { PersonaFields, type Which } from "./persona";

export interface Rotulo {
  A: string;
  B: string;
}

type SetFn = (patch: Partial<FormData>) => void;
type SetPersonaFn = (which: Which, k: keyof Persona, v: string) => void;

export function TipoContratoCard({
  data,
  set,
  onChangeTipo,
}: {
  data: FormData;
  set: SetFn;
  onChangeTipo: (t: TipoContrato) => void;
}) {
  const esIndefinido = data.tipo === "indefinido";
  const esServicios = data.tipo === "servicios";
  const esObra = data.tipo === "obra";
  const esTemporal = data.tipo === "definido" || data.tipo === "obra";
  const categoria: "temporal" | "indefinido" | "servicios" = esServicios
    ? "servicios"
    : esIndefinido
      ? "indefinido"
      : "temporal";

  return (
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
            <Field
              label="Descripción de la obra determinada"
              full
              required
              htmlFor="obra-descripcion"
              hint="Escriba una labor por línea para enumerarlas dentro de la cláusula."
            >
              <textarea
                id="obra-descripcion"
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
  );
}

export function DatosEmpleadorCard({
  data,
  setPersona,
  rotulo,
  esServicios,
}: {
  data: FormData;
  setPersona: SetPersonaFn;
  rotulo: Rotulo;
  esServicios: boolean;
}) {
  return (
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
        prefix="empleador"
        onPatch={(k, v) => setPersona("empleador", k, v)}
        nombreLabel={data.empleador.tipo === "juridica" ? "Razón social" : "Nombre completo"}
        showProfesion={esServicios && data.empleador.tipo === "natural"}
      />
    </Card>
  );
}

export function DatosTrabajadorCard({
  data,
  setPersona,
  rotulo,
  esServicios,
}: {
  data: FormData;
  setPersona: SetPersonaFn;
  rotulo: Rotulo;
  esServicios: boolean;
}) {
  return (
    <Card
      icon={<BuildingIcon />}
      title={`3. Datos de ${rotulo.B.toLowerCase()}`}
      sub={
        esServicios
          ? "Profesional independiente o empresa contratista"
          : "Cédula, RUC y domicilio de la persona trabajadora"
      }
    >
      <PersonaFields
        persona={data.trabajador}
        prefix="trabajador"
        onPatch={(k, v) => setPersona("trabajador", k, v)}
        lockNatural={!esServicios}
        nombreLabel={data.trabajador.tipo === "juridica" ? "Razón social" : "Nombre completo"}
        showProfesion={esServicios}
      />
    </Card>
  );
}

export function CondicionesLaboralesCard({
  data,
  set,
}: {
  data: FormData;
  set: SetFn;
}) {
  const esIndefinido = data.tipo === "indefinido";
  const esObra = data.tipo === "obra";
  const esTemporal = data.tipo === "definido" || data.tipo === "obra";

  return (
    <Card
      icon={<BriefcaseIcon />}
      title="4. Condiciones de la relación de trabajo"
      sub="Cargo, jornada, salario y período de prueba (si aplica)"
    >
      <div className="field-grid">
        <Field label="Cargo o puesto" required htmlFor="cargo">
          <input
            id="cargo"
            className="ui-input"
            value={data.cargo}
            placeholder="Ej.: Asistente administrativo"
            onChange={(e) => set({ cargo: e.target.value })}
          />
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
        <Field label="Fecha de inicio" required htmlFor="fecha-inicio">
          <input
            id="fecha-inicio"
            type="date"
            className="ui-input"
            value={data.fechaInicio}
            onChange={(e) => set({ fechaInicio: e.target.value })}
          />
        </Field>
        {esTemporal ? (
          <Field
            label={esObra ? "Fecha estimada de finalización" : "Fecha de finalización"}
            htmlFor="fecha-fin"
            hint={esObra ? "Opcional: el contrato termina al concluir la obra." : "El contrato termina en esta fecha."}
          >
            <input
              id="fecha-fin"
              type="date"
              className="ui-input"
              value={data.fechaFin}
              onChange={(e) => set({ fechaFin: e.target.value })}
            />
          </Field>
        ) : (
          <Field label="Duración" htmlFor="duracion">
            <input id="duracion" className="ui-input" value="Por tiempo indefinido" disabled />
          </Field>
        )}
        <Field label="Jornada de trabajo" required htmlFor="jornada">
          <select
            id="jornada"
            className="ui-input"
            value={data.jornada}
            onChange={(e) => set({ jornada: e.target.value as FormData["jornada"] })}
          >
            <option value="diurna">Diurna (máx. 8 h / 48 h sem.)</option>
            <option value="mixta">Mixta (máx. 7.5 h / 45 h sem.)</option>
            <option value="nocturna">Nocturna (máx. 7 h / 42 h sem.)</option>
          </select>
        </Field>
        <Field label="Horas semanales" htmlFor="horas-semanales">
          <input
            id="horas-semanales"
            className="ui-input"
            inputMode="numeric"
            value={data.horasSemanales}
            onChange={(e) => set({ horasSemanales: e.target.value })}
          />
        </Field>
      </div>
      <div className="field-grid" style={{ marginTop: 12 }}>
        <Field label="Salario mensual (US$ / B/.)" required htmlFor="salario">
          <div className="input-wrap">
            <input
              id="salario"
              className="ui-input"
              inputMode="decimal"
              value={data.salario}
              placeholder="1250.00"
              onChange={(e) => set({ salario: e.target.value })}
            />
            <span className="suffix">B/.</span>
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
          <select
            id="forma-pago"
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
        <Field
          label="Beneficios adicionales"
          htmlFor="beneficios"
          hint="Uno por línea. Ej.: seguro de gastos médicos, bono, alimentación…"
        >
          <textarea
            id="beneficios"
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
            <Field label="Meses de período de prueba" htmlFor="meses-prueba" hint="Máximo legal: 3 meses.">
              <input
                id="meses-prueba"
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
  );
}

export function ServiciosCard({
  data,
  set,
}: {
  data: FormData;
  set: SetFn;
}) {
  return (
    <Card
      icon={<HandshakeIcon />}
      title="4. Objeto, honorarios y plazo (B2B / USD)"
      sub="Servicios profesionales independientes"
    >
      <div className="field-grid">
        <Field label="Objeto del contrato" full required htmlFor="objeto">
          <textarea
            id="objeto"
            className="ui-input"
            rows={2}
            value={data.objeto}
            placeholder="Ej.: Asesoría legal tributaria, desarrollo de software, consultoría…"
            onChange={(e) => set({ objeto: e.target.value })}
          />
        </Field>
        <Field label="Fecha de inicio" required htmlFor="fecha-inicio-servicios">
          <input
            id="fecha-inicio-servicios"
            type="date"
            className="ui-input"
            value={data.fechaInicio}
            onChange={(e) => set({ fechaInicio: e.target.value })}
          />
        </Field>
        <Field label="Fecha de fin / plazo" htmlFor="fecha-fin-servicios">
          <input
            id="fecha-fin-servicios"
            type="date"
            className="ui-input"
            value={data.fechaFin}
            onChange={(e) => set({ fechaFin: e.target.value })}
          />
        </Field>
        <Field label="Honorarios totales (USD)" required htmlFor="honorarios">
          <div className="input-wrap">
            <input
              id="honorarios"
              className="ui-input"
              inputMode="decimal"
              value={data.honorarios}
              placeholder="5000.00"
              onChange={(e) => set({ honorarios: e.target.value })}
            />
            <span className="suffix">USD</span>
          </div>
        </Field>
        <Field label="Plazo de pago (días)" htmlFor="plazo-pago" hint="Días tras la factura.">
          <input
            id="plazo-pago"
            className="ui-input"
            inputMode="numeric"
            value={data.plazoPago}
            placeholder="30"
            onChange={(e) => set({ plazoPago: e.target.value })}
          />
        </Field>
      </div>
      <div className="field-grid" style={{ marginTop: 12 }}>
        <Field
          label="Calendario / forma de pago"
          full
          htmlFor="forma-pago-servicios"
          hint="Uno por línea: % o monto + hito. Ej.: 50% al inicio, 50% contra entrega."
        >
          <textarea
            id="forma-pago-servicios"
            className="ui-input"
            rows={2}
            value={data.formaPagoServicios}
            placeholder={"50% a la firma\n50% contra entrega final"}
            onChange={(e) => set({ formaPagoServicios: e.target.value })}
          />
        </Field>
      </div>
      <div className="field-grid" style={{ marginTop: 12 }}>
        <Field label="Penalidad por día de retraso (%)" htmlFor="penalidad-dia">
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
        <Field label="Tope máximo de penalidad (%)" htmlFor="penalidad-techo">
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
      </div>
    </Card>
  );
}

export function LaboresCard({
  data,
  set,
  esServicios,
}: {
  data: FormData;
  set: SetFn;
  esServicios: boolean;
}) {
  return (
    <Card
      icon={<BuildingIcon />}
      title="5. Descripción de labores"
      sub={
        esServicios
          ? "Desglose de los entregables y trabajos a realizar"
          : "Desglose de funciones del cargo (una por línea)"
      }
    >
      <Field
        label={esServicios ? "Entregables / trabajos" : "Funciones del cargo"}
        full
        required
        htmlFor="funciones"
      >
        <textarea
          id="funciones"
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
        htmlFor="causales"
        hint={
          esServicios
            ? "Editable. Por defecto se listan causales para resolución del contrato B2B."
            : "Editable. Se citan las causales de justa causa del Artículo 213 del Código de Trabajo."
        }
      >
        <textarea
          id="causales"
          className="ui-input"
          rows={7}
          value={data.causales}
          onChange={(e) => set({ causales: e.target.value })}
        />
      </Field>
    </Card>
  );
}

export function ClausulasCard({
  data,
  set,
  esServicios,
}: {
  data: FormData;
  set: SetFn;
  esServicios: boolean;
}) {
  return (
    <Card
      icon={<CheckIcon />}
      title="6. Cláusulas y anexos opcionales"
      sub="Cumplimiento en confidencialidad, datos personales y custodia de bienes"
    >
      <div className="field-grid" style={{ gap: 10 }}>
        <div className="field field--full">
          <label className="check-pill">
            <input
              type="checkbox"
              checked={data.confidencialidad}
              onChange={(e) => set({ confidencialidad: e.target.checked })}
            />
            Incluir cláusula de Confidencialidad y Propiedad Intelectual (NDA ·
            Ley 81 de 2019 y Ley 64 de 2012)
          </label>
          <span className="hint">
            {esServicios
              ? "Ajustada al tratamiento de datos personales por el contratista y a la cesión de derechos patrimoniales de autor."
              : "Incluye deber de secreto del trabajador, propiedad intelectual de las obras creadas y tratamiento de datos personales conforme a la Ley 81 de 2019."}
          </span>
        </div>
        <div className="field field--full">
          <label className="check-pill">
            <input
              type="checkbox"
              checked={data.anexoEquipos}
              onChange={(e) => set({ anexoEquipos: e.target.checked })}
            />
            Incluir Anexo de Entrega de Equipos / Herramientas de trabajo
          </label>
          <span className="hint">
            Agrega un anexo con inventario, cláusula de responsabilidad de
            custodia, devolución y líneas de recibo con firma.
          </span>
        </div>
      </div>
      {data.anexoEquipos && (
        <div style={{ marginTop: 12 }}>
          <Field
            label="Equipos, vehículos y herramientas entregados"
            full
            htmlFor="equipos"
            hint="Uno por línea. Ej.: Laptop – marca/modelo/serie; Teléfono celular; Vehículo – placa; Herramientas varias."
          >
            <textarea
              id="equipos"
              className="ui-input"
              rows={4}
              value={data.equipos}
              placeholder={"Laptop Lenovo ThinkPad, serie ...\nTeléfono celular corporativo\nVehículo tipo sedán, placa ...\nHerramientas varias"}
              onChange={(e) => set({ equipos: e.target.value })}
            />
          </Field>
        </div>
      )}
    </Card>
  );
}

export function FirmasCard({
  data,
  set,
}: {
  data: FormData;
  set: SetFn;
}) {
  return (
    <Card
      icon={<UsersIcon />}
      title="7. Firmas, testigos y notarización"
      sub="Bloque de cierre del documento"
    >
      <div className="field-grid" style={{ gap: 10 }}>
        <div className="field field--full">
          <label className="check-pill">
            <input
              type="checkbox"
              checked={data.testigosActivo}
              onChange={(e) => set({ testigosActivo: e.target.checked })}
            />
            Incluir 2 testigos (Nombre completo y Cédula)
          </label>
        </div>
      </div>
      {data.testigosActivo && (
        <div className="field-grid" style={{ marginTop: 12 }}>
          <Field label="Testigo 1 — Nombre completo" required htmlFor="testigo1-nombre">
            <input
              id="testigo1-nombre"
              className="ui-input"
              value={data.testigo1Nombre}
              placeholder="Nombre completo del testigo 1"
              onChange={(e) => set({ testigo1Nombre: e.target.value })}
            />
          </Field>
          <Field label="Testigo 1 — Cédula" required htmlFor="testigo1-cedula">
            <input
              id="testigo1-cedula"
              className="ui-input"
              value={data.testigo1Cedula}
              placeholder="8-123-456"
              onChange={(e) => set({ testigo1Cedula: e.target.value })}
            />
          </Field>
          <Field label="Testigo 2 — Nombre completo" required htmlFor="testigo2-nombre">
            <input
              id="testigo2-nombre"
              className="ui-input"
              value={data.testigo2Nombre}
              placeholder="Nombre completo del testigo 2"
              onChange={(e) => set({ testigo2Nombre: e.target.value })}
            />
          </Field>
          <Field label="Testigo 2 — Cédula" required htmlFor="testigo2-cedula">
            <input
              id="testigo2-cedula"
              className="ui-input"
              value={data.testigo2Cedula}
              placeholder="8-123-456"
              onChange={(e) => set({ testigo2Cedula: e.target.value })}
            />
          </Field>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <label className="check-pill">
          <input
            type="checkbox"
            checked={data.notarizacion}
            onChange={(e) => set({ notarizacion: e.target.checked })}
          />
          Incluir espacio para Notarización / Autenticación de Firmas
        </label>
        <span className="hint" style={{ display: "block", marginTop: 6 }}>
          Añade al final un bloque con la fórmula de autenticación ante
          Notario Público o autoridad competente, espacio para sello, firma y
          datos del funcionario.
        </span>
      </div>
    </Card>
  );
}

export function FechaFormatoCard({
  data,
  set,
}: {
  data: FormData;
  set: SetFn;
}) {
  return (
    <Card
      icon={<ClockIcon />}
      title="8. Fecha y formato del documento"
      sub="Lugar de suscripción y tamaño de papel para la exportación"
    >
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
  );
}
