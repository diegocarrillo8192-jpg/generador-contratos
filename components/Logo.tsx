import { Mark } from "./Mark";

export function Logo({ size = 40, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <span className="logo">
      <span className="logo__mark">
        <Mark id="top-mark" size={size} />
      </span>
      {withText && (
        <span className="logo__text">
          <span className="logo__name">Generador de Contratos</span>
          <span className="logo__sub">República de Panamá</span>
        </span>
      )}
    </span>
  );
}
