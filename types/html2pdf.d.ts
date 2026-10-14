declare module "html2pdf.js" {
  interface JsPdfLike {
    internal: {
      getNumberOfPages(): number;
      pageSize: { getWidth(): number; getHeight(): number };
    };
    setPage(n: number): void;
    setFontSize(n: number): void;
    setTextColor(r: number, g: number, b: number): void;
    text(t: string, x: number, y: number, opts?: { align?: "left" | "center" | "right" }): void;
    output(type: "blob"): Blob;
  }
  interface Html2PdfWorker {
    set(opt: Record<string, unknown>): Html2PdfWorker;
    from(el: HTMLElement): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    get(key: "pdf"): Promise<JsPdfLike>;
    save(name?: string): Promise<void>;
  }
  const html2pdf: () => Html2PdfWorker;
  export default html2pdf;
}
