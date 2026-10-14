"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CheckIcon, XIcon } from "./icons";

export function Field({
  label,
  required,
  hint,
  children,
  className = "",
  full = false,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  full?: boolean;
  htmlFor?: string;
}) {
  // Se usa <div> + <label htmlFor> para que un clic en la etiqueta no active
  // botones u otros controles anidados (p. ej. selectores segmentados).
  return (
    <div className={`field ${full ? "field--full" : ""} ${className}`}>
      {htmlFor ? (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {required && <span className="req" aria-hidden="true">*</span>}
        </label>
      ) : (
        <span className="field__label">
          {label}
          {required && <span className="req" aria-hidden="true">*</span>}
        </span>
      )}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Card({
  icon,
  step,
  title,
  sub,
  children,
  id,
  estado,
  aside,
}: {
  icon?: ReactNode;
  step?: number;
  title: string;
  sub?: string;
  children: ReactNode;
  id?: string;
  estado?: { total: number; listos: number };
  aside?: ReactNode;
}) {
  const completo = estado && estado.total > 0 && estado.listos === estado.total;
  return (
    <section className={`ui-card ${completo ? "ui-card--ok" : ""}`} id={id} aria-labelledby={id ? `${id}-t` : undefined}>
      <header className="ui-card__head">
        {icon && (
          <span className="ui-card__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="ui-card__titles">
          <h2 className="ui-card__title" id={id ? `${id}-t` : undefined}>
            {step !== undefined && <span className="ui-card__step">{String(step).padStart(2, "0")}</span>}
            {title}
          </h2>
          {sub && <p className="ui-card__sub">{sub}</p>}
        </div>
        {aside}
        {estado && estado.total > 0 && (
          <span className={`chip ${completo ? "chip--ok" : ""}`} title="Campos obligatorios completados">
            {completo ? <CheckIcon size={13} /> : null}
            {estado.listos}/{estado.total}
          </span>
        )}
      </header>
      <div className="ui-card__body">{children}</div>
    </section>
  );
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
  cols,
  label,
}: {
  value: T;
  options: Array<{ value: T; label: string; icon?: ReactNode; badge?: ReactNode }>;
  onChange: (v: T) => void;
  cols?: number;
  label?: string;
}) {
  return (
    <div
      className="seg"
      role="radiogroup"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={`seg__btn ${value === o.value ? "seg__btn--on" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <span className="seg__ico">{o.icon}</span>}
          <span className="seg__label">{o.label}</span>
          {o.badge ? <span className="seg__badge">{o.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  desc,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  desc?: ReactNode;
  id?: string;
}) {
  const auto = useId();
  const sid = id ?? auto;
  return (
    <label className={`switch-row ${checked ? "switch-row--on" : ""}`} htmlFor={sid}>
      <span className="switch-row__txt">
        <span className="switch-row__label">{label}</span>
        {desc && <span className="switch-row__desc">{desc}</span>}
      </span>
      <input
        id={sid}
        type="checkbox"
        role="switch"
        className="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal--wide" : ""}`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal__box">
        <header className="modal__head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <XIcon />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </dialog>
  );
}

export function ProgressRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} className="ring__bg" strokeWidth="4" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="ring__fg"
        strokeWidth="4"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring__txt">
        {value}%
      </text>
    </svg>
  );
}

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

/** Menú desplegable simple para acciones secundarias. */
export function Menu({ label, icon, items, align = "right" }: { label: string; icon: ReactNode; items: MenuItem[]; align?: "left" | "right" }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);
  return (
    <div className="menu" ref={ref}>
      <button type="button" className="icon-btn" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={abierto} onClick={() => setAbierto((v) => !v)}>
        {icon}
      </button>
      {abierto && (
        <div className={`menu__pop menu__pop--${align}`} role="menu">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className={`menu__item ${it.danger ? "menu__item--danger" : ""}`}
              onClick={() => {
                setAbierto(false);
                it.onSelect();
              }}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
