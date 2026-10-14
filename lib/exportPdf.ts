/**
 * Genera un archivo PDF a partir de la hoja de vista previa (para adjuntarlo a un correo
 * o compartirlo). La impresión del navegador sigue disponible para obtener texto seleccionable.
 */
export async function generarPdf(papel: "carta" | "a4", huella: string): Promise<Blob> {
  const original = document.querySelector<HTMLElement>(".paper");
  if (!original) throw new Error("No se encontró el documento.");
  const { default: html2pdf } = await import("html2pdf.js");

  // Se clona sin el zoom de la vista previa para obtener tamaño real.
  const cont = document.createElement("div");
  cont.style.cssText = `position:fixed;left:-20000px;top:0;width:${papel === "a4" ? 794 : 816}px;background:#fff;`;
  const clon = original.cloneNode(true) as HTMLElement;
  clon.classList.add("paper--pdf");
  cont.appendChild(clon);
  document.body.appendChild(cont);

  try {
    const worker = html2pdf()
      .set({
        margin: [16, 16, 18, 16],
        image: { type: "jpeg", quality: 0.9 },
        html2canvas: { scale: 1.7, useCORS: true, backgroundColor: "#ffffff", logging: false },
        jsPDF: { unit: "mm", format: papel === "a4" ? "a4" : "letter", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["p", ".paper__keep", ".paper__cierre", ".paper__notario", ".paper__brand", ".paper__huella"] },
      })
      .from(clon)
      .toPdf();
    const pdf = await worker.get("pdf");
    const total = pdf.internal.getNumberOfPages();
    const ancho = pdf.internal.pageSize.getWidth();
    const alto = pdf.internal.pageSize.getHeight();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(110, 120, 140);
      pdf.text(`Página ${i} de ${total}  ·  Huella ${huella}`, ancho / 2, alto - 8, { align: "center" });
    }
    return pdf.output("blob") as Blob;
  } finally {
    cont.remove();
  }
}
