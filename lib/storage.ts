import type { FormData, Marca } from "./types";
import { normalizarDatos, normalizarMarca } from "./types";

const K_BORRADOR = "gc:borrador:v2";
const K_MARCA = "gc:marca:v1";
const K_GUARDADOS = "gc:guardados:v1";
const K_TEMA = "gc:tema";

export interface ContratoGuardado {
  id: string;
  nombre: string;
  tipo: FormData["tipo"];
  actualizado: string;
  datos: FormData;
}

function leer<T>(clave: string): T | null {
  try {
    const raw = window.localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Devuelve false si el navegador rechazó la escritura (cuota llena, modo privado…). */
function escribir(clave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export const almacen = {
  cargarBorrador(): FormData | null {
    const b = leer<Partial<FormData>>(K_BORRADOR);
    return b ? normalizarDatos(b) : null;
  },
  guardarBorrador(d: FormData): boolean {
    return escribir(K_BORRADOR, d);
  },
  cargarMarca(): Marca | null {
    const m = leer<Partial<Marca>>(K_MARCA);
    return m ? normalizarMarca(m) : null;
  },
  guardarMarca(m: Marca): boolean {
    return escribir(K_MARCA, m);
  },
  listar(): ContratoGuardado[] {
    const l = leer<ContratoGuardado[]>(K_GUARDADOS);
    if (!Array.isArray(l)) return [];
    return l
      .filter((c) => c && typeof c.id === "string")
      .map((c) => ({ ...c, datos: normalizarDatos(c.datos) }))
      .sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  },
  guardarLista(l: ContratoGuardado[]): boolean {
    return escribir(K_GUARDADOS, l);
  },
  tema(): "oscuro" | "claro" | null {
    try {
      const t = window.localStorage.getItem(K_TEMA);
      return t === "claro" || t === "oscuro" ? t : null;
    } catch {
      return null;
    }
  },
  guardarTema(t: "oscuro" | "claro") {
    try {
      window.localStorage.setItem(K_TEMA, t);
    } catch {
      /* sin almacenamiento disponible */
    }
  },
};

export function nuevoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function descargarArchivo(nombre: string, contenido: Blob) {
  const url = URL.createObjectURL(contenido);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Reduce el logo a un máximo de 600 px y lo convierte a data URL para guardarlo en el navegador. */
export function procesarLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g|webp|svg\+xml|gif)$/.test(file.type)) {
      reject(new Error("Formato no admitido. Use PNG, JPG, WEBP o SVG."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("El archivo supera 5 MB."));
      return;
    }
    const lector = new FileReader();
    lector.onerror = () => reject(new Error("No se pudo leer el archivo."));
    lector.onload = () => {
      const src = String(lector.result);
      const img = new Image();
      img.onerror = () => reject(new Error("La imagen no es válida."));
      img.onload = () => {
        const max = 600;
        const escala = Math.min(1, max / Math.max(img.width || max, img.height || max));
        const w = Math.max(1, Math.round((img.width || max) * escala));
        const h = Math.max(1, Math.round((img.height || max) * escala));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        // PNG conserva transparencias; Word también lo admite.
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = src;
    };
    lector.readAsDataURL(file);
  });
}
