import { Mark } from "./Mark";

export function Logo({
  size = 40,
  animated = false,
  withText = true,
  textClass = "",
}: {
  size?: number;
  animated?: boolean;
  withText?: boolean;
  textClass?: string;
}) {
  return (
    <span className={`logo ${animated ? "logo--anim" : "logo--pulse"}`}>
      <span className="logo__mark">
        <Mark size={size} />
      </span>
      {withText && (
        <span className={`logo__text ${textClass}`}>
          <span className="logo__name">Generador de Contratos</span>
          <span className="logo__sub">República de Panamá</span>
        </span>
      )}
    </span>
  );
}
