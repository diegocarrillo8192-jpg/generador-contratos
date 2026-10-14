import type { DocModel, FirmaBloque } from "./doc";
import { fechaHoraFirma, firmaNotarizacion, letraInciso } from "./doc";
import type { Marca } from "./types";

const FUENTE = "Times New Roman";
const T = 23; // tamaño en medios puntos (11.5 pt)

function dataUrlABytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function medirImagen(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = src;
  });
}

const ALTO_LOGO: Record<Marca["tamano"], number> = { s: 40, m: 56, l: 76 };

export async function generarWord(doc: DocModel, marca: Marca | null, papel: "carta" | "a4"): Promise<Blob> {
  const d = await import("docx");
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Header,
    ImageRun,
    Packer,
    PageNumber,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = d;

  const p = (text: string, opts: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; size?: number; indent?: number; after?: number; caps?: boolean; color?: string } = {}) =>
    new Paragraph({
      alignment: opts.align ?? AlignmentType.JUSTIFIED,
      spacing: { after: opts.after ?? 160, line: 300 },
      indent: opts.indent ? { left: opts.indent, hanging: 300 } : undefined,
      children: [
        new TextRun({
          text,
          bold: opts.bold,
          font: FUENTE,
          size: opts.size ?? T,
          allCaps: opts.caps,
          color: opts.color,
        }),
      ],
    });

  const cuerpo: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [];
  for (const b of doc.blocks) {
    switch (b.t) {
      case "title":
        cuerpo.push(p(b.text, { bold: true, align: AlignmentType.CENTER, size: 28, after: 60 }));
        break;
      case "subtitle":
        cuerpo.push(p(b.text.toUpperCase(), { align: AlignmentType.CENTER, size: 18, after: 300, color: "475569" }));
        break;
      case "h":
        cuerpo.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 360, after: 200 },
            border: { top: { style: BorderStyle.SINGLE, size: 8, color: "0F172A", space: 8 } },
            children: [new TextRun({ text: b.text, bold: true, font: FUENTE, size: T })],
          })
        );
        break;
      case "p":
        cuerpo.push(p(b.text));
        break;
      case "clause":
        cuerpo.push(
          new Paragraph({
            spacing: { before: 240, after: 120 },
            keepNext: true,
            children: [new TextRun({ text: `${b.n}: ${b.text.toUpperCase()}`, bold: true, font: FUENTE, size: T })],
          })
        );
        break;
      case "enum":
        b.items.forEach((it, i) => cuerpo.push(p(`${letraInciso(i)}) ${it}`, { indent: 600, after: 100 })));
        break;
      case "num":
        b.items.forEach((it, i) => cuerpo.push(p(`${i + 1}. ${it}`, { indent: 600, after: 100 })));
        break;
      case "sp":
        cuerpo.push(new Paragraph({ children: [] }));
        break;
    }
  }

  // ---- Firmas en tabla de dos columnas sin bordes ----
  const sinBorde = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
  const firmas = [doc.firmas.izquierda, doc.firmas.derecha, ...doc.testigos];
  const medidas = await Promise.all(firmas.map((f) => (f.img ? medirImagen(f.img) : Promise.resolve(null))));
  const celdaFirma = (f: FirmaBloque | undefined, i: number) => {
    if (!f) return new TableCell({ borders: sinBorde, width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] });
    const m = medidas[i];
    let trazo: InstanceType<typeof Paragraph>;
    if (f.img && m) {
      const alto = 52;
      const ancho = Math.min(200, Math.round((m.w / m.h) * alto));
      trazo = new Paragraph({
        spacing: { before: 300 },
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ type: "png", data: dataUrlABytes(f.img), transformation: { width: ancho, height: Math.round((ancho / m.w) * m.h) } })],
      });
    } else {
      trazo = new Paragraph({ spacing: { before: 900 }, children: [] });
    }
    return new TableCell({
      borders: sinBorde,
      width: { size: 50, type: WidthType.PERCENTAGE },
      children: [
        trazo,
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "______________________________", font: FUENTE, size: T })] }),
        p(f.titulo, { bold: true, align: AlignmentType.CENTER, after: 20 }),
        p(f.nombre, { align: AlignmentType.CENTER, after: 20 }),
        ...(f.detalle ? [p(f.detalle, { align: AlignmentType.CENTER, size: 18, color: "475569", after: 20 })] : []),
        ...(f.img
          ? [p(`Firmado electrónicamente · ${fechaHoraFirma(f.fechaFirma ?? "")}`, { align: AlignmentType.CENTER, size: 16, color: "0E7490" })]
          : []),
      ],
    });
  };
  const filas = [];
  for (let i = 0; i < firmas.length; i += 2) {
    filas.push(new TableRow({ cantSplit: true, children: [celdaFirma(firmas[i], i), celdaFirma(firmas[i + 1], i + 1)] }));
  }
  cuerpo.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { ...sinBorde, insideHorizontal: sinBorde.top, insideVertical: sinBorde.top },
      rows: filas,
    })
  );

  if (doc.notarizacion) {
    const n = firmaNotarizacion(doc.ciudad);
    cuerpo.push(
      new Paragraph({ spacing: { before: 480 }, children: [] }),
      p("ESPACIO PARA NOTARIZACIÓN / AUTENTICACIÓN DE FIRMAS", { bold: true, align: AlignmentType.CENTER }),
      p(n.bloque),
      ...n.lineas.map((l) => p(l, { align: AlignmentType.LEFT, after: 240 }))
    );
  }

  // ---- Membrete ----
  const encabezado: InstanceType<typeof Paragraph>[] = [];
  if (marca && marca.mostrar && (marca.logo || marca.nombre.trim())) {
    const align = marca.alineacion === "centro" ? AlignmentType.CENTER : AlignmentType.LEFT;
    if (marca.logo) {
      const { w, h } = await medirImagen(marca.logo);
      const alto = ALTO_LOGO[marca.tamano] ?? 56;
      const ancho = Math.min(260, Math.round((w / h) * alto));
      encabezado.push(
        new Paragraph({
          alignment: align,
          children: [
            new ImageRun({
              type: "png",
              data: dataUrlABytes(marca.logo),
              transformation: { width: ancho, height: Math.round((ancho / w) * h) },
            }),
          ],
        })
      );
    }
    if (marca.nombre.trim()) encabezado.push(p(marca.nombre.trim(), { bold: true, align, size: 20, after: 0 }));
    if (marca.detalle.trim()) encabezado.push(p(marca.detalle.trim(), { align, size: 16, color: "475569", after: 0 }));
    encabezado.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "0F172A", space: 4 } },
        children: [],
      })
    );
  }

  const pie = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES], font: FUENTE, size: 16, color: "64748B" }),
          new TextRun({ text: `     Huella: ${doc.huella}`, font: FUENTE, size: 16, color: "64748B" }),
          ...(doc.firmaVirtual ? [] : [new TextRun({ text: "     Iniciales: ________  ________", font: FUENTE, size: 16, color: "64748B" })]),
        ],
      }),
    ],
  });

  const tamano = papel === "a4" ? { width: 11906, height: 16838 } : { width: 12240, height: 15840 };

  const documento = new Document({
    creator: "Generador de Contratos · Panamá",
    title: doc.titulo,
    styles: { default: { document: { run: { font: FUENTE, size: T } } } },
    sections: [
      {
        properties: {
          page: {
            size: tamano,
            margin: { top: 1134, bottom: 1134, left: 1247, right: 1247, header: 567, footer: 567 },
          },
        },
        headers: encabezado.length ? { default: new Header({ children: encabezado }) } : undefined,
        footers: { default: pie },
        children: cuerpo,
      },
    ],
  });

  return Packer.toBlob(documento);
}
