import type { DocModel } from "@/lib/doc";

export default function PreviewDoc({ doc }: { doc: DocModel }) {
  return (
    <article className="paper">
      <div className="paper__brand">
        <svg width="30" height="30" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="pp-g" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0891b2" />
              <stop offset="1" stopColor="#1e40af" />
            </linearGradient>
          </defs>
          <rect width="96" height="96" rx="24" fill="url(#pp-g)" />
          <rect x="29" y="17" width="37" height="56" rx="7" fill="#ffffff" />
          <rect x="36" y="29" width="23" height="4.5" rx="2.25" fill="#0b1526" opacity="0.85" />
          <rect x="36" y="39" width="23" height="4.5" rx="2.25" fill="#0b1526" opacity="0.85" />
          <rect x="36" y="49" width="15" height="4.5" rx="2.25" fill="#0b1526" opacity="0.85" />
          <circle cx="62" cy="60" r="14" fill="#38bdf8" />
          <path d="M55.5 60.5l4.3 4.3 7.2-8.6" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="paper__brand-txt">
          <strong style={{ display: "block", color: "#0f172a", letterSpacing: "0.4px" }}>
            Generador de Contratos
          </strong>
          Ciudad de Panamá, República de Panamá
        </div>
      </div>
      <div className="paper__doc">
        {doc.blocks.map((b, i) => {
          switch (b.t) {
            case "title":
              return (
                <h1 key={i} className="paper__title">
                  {b.text}
                </h1>
              );
            case "subtitle":
              return (
                <div key={i} className="paper__subtitle">
                  {b.text}
                </div>
              );
            case "p":
              return (
                <p key={i} className="paper__p">
                  {b.text}
                </p>
              );
            case "clause":
              return (
                <p key={i} className="paper__clause">
                  {b.n}: {b.text}
                </p>
              );
            case "enum":
              return (
                <div key={i}>
                  {b.items.map((it, j) => (
                    <p key={j} className="paper__enum">
                      {String.fromCharCode(97 + j)}) {it}
                    </p>
                  ))}
                </div>
              );
            case "num":
              return (
                <div key={i}>
                  {b.items.map((it, j) => (
                    <p key={j} className="paper__num">
                      {j + 1}. {it}
                    </p>
                  ))}
                </div>
              );
            case "sp":
              return <div key={i} className="paper__space" />;
          }
        })}
        <div className="paper__firmas">
          <div className="paper__firma">
            <div className="paper__firma-role">{doc.firmas.izquierda[0]}</div>
            <div className="paper__firma-name">{doc.firmas.izquierda[1]}</div>
            <div className="paper__firma-line" />
            <div className="paper__firma-sign">Firma</div>
          </div>
          <div className="paper__firma">
            <div className="paper__firma-role">{doc.firmas.derecha[0]}</div>
            <div className="paper__firma-name">{doc.firmas.derecha[1]}</div>
            <div className="paper__firma-line" />
            <div className="paper__firma-sign">Firma</div>
          </div>
        </div>
      </div>
    </article>
  );
}
