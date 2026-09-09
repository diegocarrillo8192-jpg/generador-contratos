import type { ReactNode } from "react";

export function Field({
  label,
  required,
  hint,
  children,
  className = "",
  full = false,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
  full?: boolean;
}) {
  return (
    <label className={`field ${full ? "field--full" : ""} ${className}`}>
      <span className="field__label">
        {label}
        {required && <span className="req">*</span>}
      </span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

export function Card({
  icon,
  title,
  sub,
  children,
  id,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="ui-card" id={id}>
      <div className="ui-card__head">
        {icon && <span className="ui-card__icon">{icon}</span>}
        <div>
          <div className="ui-card__title">{title}</div>
          {sub && <div className="ui-card__sub">{sub}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; icon?: ReactNode; badge?: ReactNode }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="radiogroup">
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
          <span>
            {o.label}
            {o.badge ? <span style={{ display: "block", fontSize: 10, marginTop: 2, color: "var(--cyan-dim)" }}>{o.badge}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}
