import type { DocModel, FirmaBloque } from "@/lib/doc";
import {
  conClaves,
  conClavesFirmas,
  conClavesItems,
  firmaNotarizacion,
} from "@/lib/doc";

function FirmaCelda({ f }: { f: FirmaBloque }) {
  return (
    <div className="paper__firma">
      <div className="paper__firma-role">{f.titulo}</div>
      <div className="paper__firma-name">{f.nombre}</div>
      {f.detalle && <div className="paper__firma-detalle">{f.detalle}</div>}
      <div className="paper__firma-line" />
      <div className="paper__firma-sign">Firma</div>
    </div>
  );
}

export default function PreviewDoc({ doc }: { doc: DocModel }) {
  const notario = firmaNotarizacion("");
  const bloques = conClaves(doc.blocks);
  const firmas = conClavesFirmas([
    doc.firmas.izquierda,
    doc.firmas.derecha,
    ...doc.testigos,
  ]);
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
        {bloques.map(({ block: b, clave }) => {
          switch (b.t) {
            case "title":
              return (
                <h1 key={clave} className="paper__title">
                  {b.text}
                </h1>
              );
            case "subtitle":
              return (
                <div key={clave} className="paper__subtitle">
                  {b.text}
                </div>
              );
            case "h":
              return (
                <p key={clave} className="paper__annex">
                  {b.text}
                </p>
              );
            case "p":
              return (
                <p key={clave} className="paper__p">
                  {b.text}
                </p>
              );
            case "clause":
              return (
                <p key={clave} className="paper__clause">
                  {b.n}: {b.text}
                </p>
              );
            case "enum":
              return (
                <div key={clave}>
                  {conClavesItems(b.items).map((item) => (
                    <p key={item.clave} className="paper__enum">
                      {String.fromCharCode(97 + item.posicion)}) {item.text}
                    </p>
                  ))}
                </div>
              );
            case "num":
              return (
                <div key={clave}>
                  {conClavesItems(b.items).map((item) => (
                    <p key={item.clave} className="paper__num">
                      {item.posicion + 1}. {item.text}
                    </p>
                  ))}
                </div>
              );
            case "sp":
              return <div key={clave} className="paper__space" />;
          }
        })}
        <div className={`paper__firmas ${doc.testigos.length > 0 ? "" : "paper__firmas--dos"}`}>
          {firmas.map(({ firma, clave }) => (
            <FirmaCelda key={clave} f={firma} />
          ))}
        </div>
        {doc.notarizacion && (
          <div className="paper__notario">
            <p className="paper__notario-title">
              Espacio para Notarización / Autenticación de Firmas
            </p>
            <p className="paper__p">{notario.bloque}</p>
            {notario.lineas.map((linea) => (
              <p key={linea} className="paper__notario-linea">
                {linea}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
