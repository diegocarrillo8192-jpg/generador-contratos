import type { Block, BloqueConClave, DocModel, FirmaBloque } from "@/lib/doc";
import { conClaves, conClavesFirmas, conClavesItems, fechaHoraFirma, firmaNotarizacion, letraInciso } from "@/lib/doc";
import type { Marca } from "@/lib/types";

function FirmaCelda({ f }: { f: FirmaBloque }) {
  return (
    <div className="paper__firma">
      {f.img ? (
        <div className="paper__firma-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.img} alt={`Firma de ${f.nombre}`} />
        </div>
      ) : null}
      <div className={`paper__firma-line ${f.img ? "paper__firma-line--img" : ""}`} />
      <div className="paper__firma-role">{f.titulo}</div>
      <div className="paper__firma-name">{f.nombre}</div>
      {f.detalle && <div className="paper__firma-detalle">{f.detalle}</div>}
      {f.img && (
        <div className={`paper__firma-meta ${f.desactualizada ? "paper__firma-meta--old" : ""}`}>
          {f.desactualizada ? "⚠ Firma sobre una versión anterior del texto" : `Firmado electrónicamente · ${fechaHoraFirma(f.fechaFirma ?? "")}`}
        </div>
      )}
    </div>
  );
}

function Bloque({ b }: { b: Block }) {
  switch (b.t) {
    case "title":
      return <h1 className="paper__title">{b.text}</h1>;
    case "subtitle":
      return <div className="paper__subtitle">{b.text}</div>;
    case "h":
      return <p className="paper__annex">{b.text}</p>;
    case "p":
      return <p className="paper__p">{b.text}</p>;
    case "clause":
      return (
        <p className="paper__clause">
          {b.n}: {b.text}
        </p>
      );
    case "enum":
    case "num":
      return (
        <div className="paper__list">
          {conClavesItems(b.items).map((item) => (
            <p key={item.clave} className="paper__enum">
              <span className="paper__marker">{b.t === "enum" ? `${letraInciso(item.posicion)})` : `${item.posicion + 1}.`}</span> {item.text}
            </p>
          ))}
        </div>
      );
    case "sp":
      return <div className="paper__space" />;
    default:
      return null;
  }
}

function Membrete({ marca }: { marca: Marca }) {
  if (!marca.mostrar || (!marca.logo && !marca.nombre.trim() && !marca.detalle.trim())) return null;
  return (
    <div className={`paper__brand paper__brand--${marca.alineacion} paper__brand--${marca.tamano}`}>
      {marca.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={marca.logo} alt="" className="paper__logo" />
      )}
      {(marca.nombre.trim() || marca.detalle.trim()) && (
        <div className="paper__brand-txt">
          {marca.nombre.trim() && <strong>{marca.nombre.trim()}</strong>}
          {marca.detalle.trim() && <span>{marca.detalle.trim()}</span>}
        </div>
      )}
    </div>
  );
}

export default function PreviewDoc({
  doc,
  marca,
  borrador,
  papel,
}: {
  doc: DocModel;
  marca: Marca;
  borrador: boolean;
  papel: "carta" | "a4";
}) {
  const notario = firmaNotarizacion(doc.ciudad);
  const todos = conClaves(doc.blocks);
  // El párrafo de cierre se imprime junto a las firmas para que nunca queden solas en una hoja.
  let iCierre = -1;
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i].block.t === "p") {
      iCierre = i;
      break;
    }
  }
  const cierre = iCierre >= 0 ? todos[iCierre] : null;
  const bloques = todos.filter((_, i) => i !== iCierre);
  const grupos: BloqueConClave[][] = [];
  for (let i = 0; i < bloques.length; i++) {
    const actual = bloques[i];
    const siguiente = bloques[i + 1];
    if ((actual.block.t === "clause" || actual.block.t === "h") && siguiente) {
      grupos.push([actual, siguiente]);
      i += 1;
    } else {
      grupos.push([actual]);
    }
  }
  const firmas = conClavesFirmas([doc.firmas.izquierda, doc.firmas.derecha, ...doc.testigos]);
  return (
    <article className={`paper paper--${papel}`} aria-label="Vista previa del contrato">
      {borrador && (
        <div className="paper__watermark" aria-hidden="true">
          BORRADOR
        </div>
      )}
      <Membrete marca={marca} />
      <div className="paper__doc">
        {grupos.map((g) =>
          g.length === 1 ? (
            <Bloque key={g[0].clave} b={g[0].block} />
          ) : (
            // El título de cada cláusula se mantiene junto a su primer párrafo al paginar.
            <div key={g[0].clave} className="paper__keep">
              {g.map((x) => (
                <Bloque key={x.clave} b={x.block} />
              ))}
            </div>
          )
        )}
        <div className="paper__cierre">
          {cierre && <Bloque b={cierre.block} />}
          <div className="paper__firmas">
            {firmas.map(({ firma, clave }) => (
              <FirmaCelda key={clave} f={firma} />
            ))}
          </div>
        </div>
        {doc.notarizacion && (
          <div className="paper__notario">
            <p className="paper__notario-title">Espacio para notarización / autenticación de firmas</p>
            <p className="paper__p">{notario.bloque}</p>
            {notario.lineas.map((linea) => (
              <p key={linea} className="paper__notario-linea">
                {linea}
              </p>
            ))}
          </div>
        )}
        <div className="paper__huella">
          Huella del documento: <strong>{doc.huella}</strong>
          {doc.firmaVirtual ? " · Documento con firma electrónica simple (Ley 51 de 2008)" : ""}
        </div>
      </div>
    </article>
  );
}
