export type Block =
  | { t: "title"; text: string }
  | { t: "subtitle"; text: string }
  | { t: "h"; text: string }
  | { t: "p"; text: string }
  | { t: "clause"; n: string; text: string }
  | { t: "enum"; items: string[] }
  | { t: "num"; items: string[] }
  | { t: "sp" };

export interface FirmaBloque {
  titulo: string;
  nombre: string;
  detalle?: string;
}

export interface DocModel {
  blocks: Block[];
  firmas: { izquierda: FirmaBloque; derecha: FirmaBloque };
  testigos: FirmaBloque[];
  notarizacion: boolean;
  nota: string;
}

export function bloqueFirma(
  titulo: string,
  nombre: string,
  detalle?: string
): FirmaBloque {
  return { titulo, nombre, detalle };
}

export interface BloqueConClave {
  block: Block;
  clave: string;
}

export interface ItemConClave {
  text: string;
  clave: string;
  posicion: number;
}

export interface FirmaConClave {
  firma: FirmaBloque;
  clave: string;
}

function claveUnica(base: string, vistos: Map<string, number>): string {
  const ocurrencia = vistos.get(base) ?? 0;
  vistos.set(base, ocurrencia + 1);
  return ocurrencia === 0 ? base : `${base}#${ocurrencia}`;
}

export function conClaves(blocks: Block[]): BloqueConClave[] {
  const vistos = new Map<string, number>();
  return blocks.map((block) => {
    const contenido =
      "text" in block
        ? block.text
        : "items" in block
          ? block.items.join("\u0001")
          : "";
    return { block, clave: claveUnica(`${block.t}:${contenido}`, vistos) };
  });
}

export function conClavesItems(items: string[]): ItemConClave[] {
  const vistos = new Map<string, number>();
  return items.map((text, posicion) => ({
    text,
    posicion,
    clave: claveUnica(text, vistos),
  }));
}

export function conClavesFirmas(firmas: FirmaBloque[]): FirmaConClave[] {
  const vistos = new Map<string, number>();
  return firmas.map((firma) => {
    const base = `${firma.titulo}:${firma.nombre}:${firma.detalle ?? ""}`;
    return { firma, clave: claveUnica(base, vistos) };
  });
}

export function encabezadoContrato(
  titulo: string,
  ciudad: string,
  fecha: string
): Block[] {
  return [
    { t: "title", text: titulo },
    { t: "subtitle", text: "República de Panamá" },
    {
      t: "p",
      text: `En ${ciudad || "la Ciudad de Panamá"}, República de Panamá, a los ${fecha || "_______"}, comparecen quienes suscriben el presente instrumento:`,
    },
  ];
}

export function firmaNotarizacion(
  ciudad: string
): { bloque: string; lineas: string[] } {
  return {
    bloque: `En ${ciudad || "la Ciudad de Panamá"}, República de Panamá, a los ____ días del mes de ________ de 20____, ante mí, NOTARIO PÚBLICO (o autoridad competente) de la República de Panamá, comparecieron las personas cuyas firmas constan en el presente documento, a quienes identifiqué por medio de su Cédula de Identidad Personal y/o RUC, y manifestaron que las firmas que anteceden fueron puestas por su propia y libre voluntad, en mi presencia, por lo que AUTENTICO las mismas y doy fe. Se deja constancia de que el presente espacio sólo es válido una vez sea suscrito y sellado por el Notario Público o autoridad competente.`,
    lineas: [
      "Lugar y fecha de la autenticación: ______________________________________",
      "Nombre del Notario / funcionario: _______________________________________",
      "Firma y sello: ___________________________________________________________",
    ],
  };
}

const ABC = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",
  "o", "p", "q", "r", "s", "t",
];

export function renderTextoTxt(doc: DocModel): string {
  const out: string[] = [];
  for (const b of doc.blocks) {
    switch (b.t) {
      case "title":
        out.push(b.text.toUpperCase());
        out.push("");
        break;
      case "subtitle":
        out.push(b.text.toUpperCase());
        out.push("");
        break;
      case "h":
        out.push(b.text.toUpperCase());
        out.push("");
        break;
      case "p":
        out.push(b.text);
        out.push("");
        break;
      case "clause":
        out.push(`${b.n}: ${b.text.toUpperCase()}`);
        out.push("");
        break;
      case "enum":
        b.items.forEach((it, i) => {
          out.push(`${ABC[i] || (i + 1)}) ${it}`);
        });
        out.push("");
        break;
      case "num":
        b.items.forEach((it, i) => {
          out.push(`${i + 1}. ${it}`);
        });
        out.push("");
        break;
      case "sp":
        out.push("");
        break;
    }
  }
  out.push("");

  const firmasLista: FirmaBloque[] = [
    doc.firmas.izquierda,
    doc.firmas.derecha,
    ...doc.testigos,
  ];
  for (const f of firmasLista) {
    out.push("______________________________________________");
    out.push(f.titulo);
    out.push(f.nombre);
    if (f.detalle) out.push(f.detalle);
    out.push("");
  }

  if (doc.notarizacion) {
    out.push("NOTARIZACIÓN / AUTENTICACIÓN DE FIRMAS");
    out.push("");
    out.push(firmaNotarizacion("").bloque);
    out.push("");
    for (const linea of firmaNotarizacion("").lineas) {
      out.push(linea);
    }
    out.push("");
  }

  if (doc.nota) {
    out.push(doc.nota);
    out.push("");
  }
  return out.join("\n");
}
