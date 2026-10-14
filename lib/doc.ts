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
  /** Imagen PNG de la firma virtual, si la hay. */
  img?: string;
  /** Fecha ISO de la firma virtual. */
  fechaFirma?: string;
  /** true si el contrato cambió después de que esta persona firmó. */
  desactualizada?: boolean;
}

export interface DocModel {
  titulo: string;
  blocks: Block[];
  firmas: { izquierda: FirmaBloque; derecha: FirmaBloque };
  testigos: FirmaBloque[];
  notarizacion: boolean;
  ciudad: string;
  nota: string;
  /** Huella del texto del contrato (sin firmas) para detectar alteraciones. */
  huella: string;
  firmaVirtual: boolean;
}

/** Huella no criptográfica (cyrb53 doble) del texto: XXXX-XXXX-XXXX-XXXX. */
export function huellaTexto(texto: string): string {
  const h = (seed: number) => {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < texto.length; i++) {
      const ch = texto.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
  };
  const hex = (h(1) + h(7)).toUpperCase().slice(0, 16);
  return hex.match(/.{4}/g)!.join("-");
}

export function fechaHoraFirma(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dos = (n: number) => String(n).padStart(2, "0");
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${h12}:${dos(d.getMinutes())} ${h < 12 ? "a. m." : "p. m."}`;
}

export function bloqueFirma(titulo: string, nombre: string, detalle?: string): FirmaBloque {
  return { titulo, nombre: nombre.trim() || "____________________", detalle: detalle || undefined };
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
    const contenido = "text" in block ? block.text : "items" in block ? block.items.join("\u0001") : "";
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

/** Letra del inciso: a), b) … z), aa), ab) … */
export function letraInciso(i: number): string {
  const abc = "abcdefghijklmnopqrstuvwxyz";
  if (i < abc.length) return abc[i];
  return abc[Math.floor(i / abc.length) - 1] + abc[i % abc.length];
}

export function encabezadoContrato(titulo: string, ciudad: string, fechaLegal: string): Block[] {
  return [
    { t: "title", text: titulo },
    { t: "subtitle", text: "República de Panamá" },
    {
      t: "p",
      text: `En ${ciudad || "la Ciudad de Panamá"}, República de Panamá, a los ${fechaLegal}, comparecen quienes suscriben el presente instrumento:`,
    },
  ];
}

export function firmaNotarizacion(ciudad: string): { bloque: string; lineas: string[] } {
  return {
    bloque: `En ${ciudad || "la Ciudad de Panamá"}, República de Panamá, a los ____ días del mes de ________ de 20____, ante mí, NOTARIO PÚBLICO (o autoridad competente) de la República de Panamá, comparecieron las personas cuyas firmas constan en el presente documento, a quienes identifiqué por medio de su Cédula de Identidad Personal y/o documento de identidad, y manifestaron que las firmas que anteceden fueron puestas por su propia y libre voluntad, en mi presencia, por lo que AUTENTICO las mismas y doy fe. Se deja constancia de que el presente espacio sólo es válido una vez sea suscrito y sellado por el Notario Público o autoridad competente.`,
    lineas: [
      "Lugar y fecha de la autenticación: ______________________________________",
      "Nombre del Notario / funcionario: _______________________________________",
      "Firma y sello: ___________________________________________________________",
    ],
  };
}

export function renderTextoTxt(doc: DocModel): string {
  const out: string[] = [];
  for (const b of doc.blocks) {
    switch (b.t) {
      case "title":
      case "subtitle":
      case "h":
        out.push(b.text.toUpperCase(), "");
        break;
      case "p":
        out.push(b.text, "");
        break;
      case "clause":
        out.push(`${b.n}: ${b.text.toUpperCase()}`, "");
        break;
      case "enum":
        b.items.forEach((it, i) => out.push(`${letraInciso(i)}) ${it}`));
        out.push("");
        break;
      case "num":
        b.items.forEach((it, i) => out.push(`${i + 1}. ${it}`));
        out.push("");
        break;
      case "sp":
        out.push("");
        break;
    }
  }
  out.push("");

  for (const f of [doc.firmas.izquierda, doc.firmas.derecha, ...doc.testigos]) {
    out.push("", "", f.img ? `[Firmado electrónicamente el ${fechaHoraFirma(f.fechaFirma ?? "")}]` : "______________________________________________", f.titulo, f.nombre);
    if (f.detalle) out.push(f.detalle);
  }
  out.push("");

  if (doc.notarizacion) {
    const n = firmaNotarizacion(doc.ciudad);
    out.push("", "NOTARIZACIÓN / AUTENTICACIÓN DE FIRMAS", "", n.bloque, "", ...n.lineas, "");
  }

  if (doc.nota) out.push(doc.nota, "");
  return out.join("\n");
}
