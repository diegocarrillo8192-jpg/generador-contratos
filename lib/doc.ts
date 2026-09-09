export type Block =
  | { t: "title"; text: string }
  | { t: "subtitle"; text: string }
  | { t: "p"; text: string }
  | { t: "clause"; n: string; text: string }
  | { t: "enum"; items: string[] }
  | { t: "num"; items: string[] }
  | { t: "sp" };

export interface DocModel {
  blocks: Block[];
  firmas: { izquierda: string[]; derecha: string[] };
  nota: string;
}

export function encabezadoContrato(titulo: string, ciudad: string, fecha: string): Block[] {
  return [
    { t: "title", text: titulo },
    { t: "subtitle", text: "República de Panamá" },
    {
      t: "p",
      text: `En ${ciudad || "la Ciudad de Panamá"}, República de Panamá, a los ${fecha || "_______"}, comparecen quienes suscriben el presente instrumento:`,
    },
  ];
}

export function firmas(
  a: string,
  b: string,
  etiquetaA: string,
  etiquetaB: string
): DocModel["firmas"] {
  return {
    izquierda: [etiquetaA, a, "", ""],
    derecha: [etiquetaB, b, "", ""],
  };
}

const ABC = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];

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
  const cols = Math.max(doc.firmas.izquierda.length, doc.firmas.derecha.length);
  for (let i = 0; i < cols; i++) {
    const l = doc.firmas.izquierda[i] || "";
    const r = doc.firmas.derecha[i] || "";
    const sep = l && r ? "          " : "";
    out.push(`${l}${sep}${r}`.replace(/\s+$/, ""));
  }
  out.push("");
  if (doc.nota) {
    out.push(doc.nota);
    out.push("");
  }
  return out.join("\n");
}
