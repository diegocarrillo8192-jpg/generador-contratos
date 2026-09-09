import { ImageResponse } from "next/og";

export const alt =
  "Generador de Contratos — Contratos laborales y de servicios profesionales bajo la legislación de Panamá";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg,#060b1a 0%,#0a1730 55%,#0c1f3f 100%)",
          padding: 64,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "linear-gradient(135deg,#22d3ee,#1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 52,
            }}
          >
            G
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, color: "#ffffff", fontWeight: 800 }}>
              Generador de Contratos
            </div>
            <div style={{ fontSize: 26, color: "#7dd3fc" }}>
              República de Panamá
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.12,
              color: "#f1f6ff",
              fontWeight: 800,
            }}
          >
            Contratos laborales y de servicios
          </div>
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.12,
              color: "#22d3ee",
              fontWeight: 800,
            }}
          >
            profesionales bajo la ley panameña
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 26,
            color: "#9db8dd",
          }}
        >
          <span
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              background: "rgba(34,211,238,0.14)",
              color: "#7dd3fc",
            }}
          >
            Código de Trabajo
          </span>
          <span
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              background: "rgba(56,189,248,0.12)",
              color: "#7dd3fc",
            }}
          >
            Ley 81 de 2019 · Datos personales
          </span>
          <span style={{ marginLeft: "auto" }}>RUC · Cédula · ITBMS</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
