"use client";

import { useMemo, useState } from "react";
import type { FormData } from "@/lib/types";
import { dineroNum, parseMonto } from "@/lib/format";
import { calcularPlanilla, ITBMS, tasasPorDefecto, type Tasas } from "@/lib/planilla";
import { CalcIcon, RefreshIcon } from "./icons";

function Fila({ l, v, fuerte, neg }: { l: string; v: number; fuerte?: boolean; neg?: boolean }) {
  return (
    <div className={`calc-row ${fuerte ? "calc-row--strong" : ""}`}>
      <span>{l}</span>
      <span className="calc-row__v">
        {neg && v > 0 ? "− " : ""}
        {dineroNum(v)}
      </span>
    </div>
  );
}

function Tasa({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const [texto, setTexto] = useState(String(value));
  return (
    <label className="tasa">
      <span>{label}</span>
      <span className="input-wrap">
        <input
          className="ui-input ui-input--sm"
          inputMode="decimal"
          value={texto}
          onChange={(e) => {
            const t = e.target.value.replace(/[^0-9.,]/g, "");
            setTexto(t);
            const n = parseFloat(t.replace(",", "."));
            onChange(Number.isFinite(n) ? n : 0);
          }}
        />
        <span className="suffix">%</span>
      </span>
    </label>
  );
}

function CostosLaborales({ data }: { data: FormData }) {
  const [tasas, setTasas] = useState<Tasas>(() => tasasPorDefecto(data.fechaInicio));
  const [version, setVersion] = useState(0);
  const salario = parseMonto(data.salario) ?? 0;
  const r = useMemo(() => calcularPlanilla(salario, tasas), [salario, tasas]);
  const setT = (k: keyof Tasas) => (n: number) => setTasas((t) => ({ ...t, [k]: n }));
  const totalEmpleador = r.costoMensual - r.bruto;
  const pctBruto = r.costoMensual > 0 ? (r.bruto / r.costoMensual) * 100 : 0;

  if (salario <= 0) {
    return (
      <div className="empty">
        <span className="empty__ico">
          <CalcIcon size={28} />
        </span>
        <strong>Ingrese el salario</strong>
        <p>Escriba el salario mensual en «Condiciones de trabajo» para estimar el salario neto y el costo total para la empresa.</p>
      </div>
    );
  }

  return (
    <>
      <div className="calc-hero">
        <div>
          <span className="calc-hero__l">Salario neto estimado</span>
          <span className="calc-hero__v">{dineroNum(r.neto)}</span>
          <span className="calc-hero__s">al mes para el trabajador</span>
        </div>
        <div>
          <span className="calc-hero__l">Costo total mensual</span>
          <span className="calc-hero__v calc-hero__v--accent">{dineroNum(r.costoMensual)}</span>
          <span className="calc-hero__s">{dineroNum(r.costoAnual)} al año para la empresa</span>
        </div>
      </div>

      <div className="bar" aria-hidden="true">
        <span style={{ width: `${pctBruto}%` }} className="bar__a" />
        <span style={{ width: `${100 - pctBruto}%` }} className="bar__b" />
      </div>
      <div className="bar-legend">
        <span>
          <i className="dot dot--a" /> Salario {pctBruto.toFixed(0)}%
        </span>
        <span>
          <i className="dot dot--b" /> Cargas y provisiones {(100 - pctBruto).toFixed(0)}%
        </span>
      </div>

      <div className="calc-block">
        <h3>Trabajador</h3>
        <Fila l="Salario bruto mensual" v={r.bruto} />
        <Fila l={`Seguro Social (${tasas.cssTrabajador}%)`} v={r.cssTrabajador} neg />
        <Fila l={`Seguro Educativo (${tasas.seTrabajador}%)`} v={r.seTrabajador} neg />
        <Fila l="Impuesto sobre la Renta (estimado)" v={r.isr} neg />
        <Fila l="Salario neto" v={r.neto} fuerte />
      </div>

      <div className="calc-block">
        <h3>Empleador</h3>
        <Fila l={`Cuota patronal CSS (${tasas.cssEmpleador}%)`} v={r.cssEmpleador} />
        <Fila l={`Seguro Educativo (${tasas.seEmpleador}%)`} v={r.seEmpleador} />
        <Fila l={`Riesgos Profesionales (${tasas.riesgos}%)`} v={r.riesgos} />
        <Fila l="Provisión XIII mes (1/12)" v={r.provisionXiii} />
        <Fila l="Provisión vacaciones (1/11)" v={r.provisionVacaciones} />
        <Fila l="Cargas sobre el salario" v={totalEmpleador} fuerte />
      </div>

      <details className="calc-tasas">
        <summary>Ajustar tasas</summary>
        <div className="tasas-grid" key={version}>
          <Tasa label="CSS trabajador" value={tasas.cssTrabajador} onChange={setT("cssTrabajador")} />
          <Tasa label="S. Educativo trabajador" value={tasas.seTrabajador} onChange={setT("seTrabajador")} />
          <Tasa label="CSS patronal" value={tasas.cssEmpleador} onChange={setT("cssEmpleador")} />
          <Tasa label="S. Educativo patronal" value={tasas.seEmpleador} onChange={setT("seEmpleador")} />
          <Tasa label="Riesgos profesionales" value={tasas.riesgos} onChange={setT("riesgos")} />
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => {
            setTasas(tasasPorDefecto(data.fechaInicio));
            setVersion((v) => v + 1);
          }}>
          <RefreshIcon size={14} /> Restaurar valores
        </button>
      </details>

      <p className="side-note">
        Estimación referencial. CSS patronal escalonada: 13.25% hasta feb-2027, 14.25% hasta feb-2029 y 15.25% después. El riesgo profesional varía según la
        actividad. ISR calculado sobre salario × 13 (incluye XIII mes): 0% hasta B/. 11,000; 15% hasta B/. 50,000; 25% sobre el excedente. Verifique con la
        CSS, la DGI o su contador.
      </p>
    </>
  );
}

function CostosServicios({ data }: { data: FormData }) {
  const h = parseMonto(data.honorarios) ?? 0;
  if (h <= 0) {
    return (
      <div className="empty">
        <span className="empty__ico">
          <CalcIcon size={28} />
        </span>
        <strong>Ingrese los honorarios</strong>
        <p>Escriba los honorarios totales para ver el desglose con ITBMS y el calendario de pagos.</p>
      </div>
    );
  }
  const itbms = data.incluyeItbms ? (h * ITBMS) / 100 : 0;
  const pen = parseMonto(data.penalidadTecho) ?? 0;
  const hitos = data.formaPagoServicios
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((linea) => {
      const m = linea.match(/(\d+(?:[.,]\d+)?)\s*%/);
      const pct = m ? parseFloat(m[1].replace(",", ".")) : null;
      return { linea, monto: pct !== null ? (h * pct) / 100 : null };
    });
  const sumaPct = hitos.reduce((s, x) => s + (x.monto ?? 0), 0);

  return (
    <>
      <div className="calc-hero">
        <div>
          <span className="calc-hero__l">Honorarios</span>
          <span className="calc-hero__v">{dineroNum(h).replace("B/.", "US$")}</span>
          <span className="calc-hero__s">sin impuestos</span>
        </div>
        <div>
          <span className="calc-hero__l">Total a facturar</span>
          <span className="calc-hero__v calc-hero__v--accent">{dineroNum(h + itbms).replace("B/.", "US$")}</span>
          <span className="calc-hero__s">{data.incluyeItbms ? `incluye ITBMS ${ITBMS}%` : "sin ITBMS"}</span>
        </div>
      </div>
      {hitos.length > 0 && (
        <div className="calc-block">
          <h3>Calendario de pagos</h3>
          {hitos.map((x) => (
            <div key={x.linea} className="calc-row">
              <span>{x.linea}</span>
              <span className="calc-row__v">{x.monto !== null ? dineroNum(x.monto).replace("B/.", "US$") : "—"}</span>
            </div>
          ))}
          {sumaPct > 0 && Math.abs(sumaPct - h) > 0.01 && (
            <p className="calc-warn">Los porcentajes suman {dineroNum(sumaPct).replace("B/.", "US$")}, distinto del total pactado.</p>
          )}
        </div>
      )}
      <div className="calc-block">
        <h3>Riesgo contractual</h3>
        <div className="calc-row">
          <span>Penalidad máxima por retraso ({pen}%)</span>
          <span className="calc-row__v">{dineroNum((h * pen) / 100).replace("B/.", "US$")}</span>
        </div>
      </div>
      <p className="side-note">Referencial. Confirme con su contador si el servicio causa ITBMS y si aplica alguna retención.</p>
    </>
  );
}

export default function CostosPanel({ data }: { data: FormData }) {
  return <div className="side-panel">{data.tipo === "servicios" ? <CostosServicios data={data} /> : <CostosLaborales key={data.fechaInicio} data={data} />}</div>;
}
