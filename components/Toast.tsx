"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertIcon, CheckIcon, InfoIcon } from "./icons";

type Tipo = "ok" | "info" | "error";
interface ToastItem {
  id: number;
  tipo: Tipo;
  texto: string;
  accion?: { label: string; fn: () => void };
}

type Notificar = (texto: string, tipo?: Tipo, accion?: ToastItem["accion"]) => void;

const Ctx = createContext<Notificar>(() => {});

export function useToast(): Notificar {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const quitar = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);

  const notificar = useCallback<Notificar>(
    (texto, tipo = "ok", accion) => {
      seq.current += 1;
      const id = seq.current;
      setItems((l) => [...l.slice(-2), { id, tipo, texto, accion }]);
      setTimeout(() => quitar(id), accion ? 6500 : 3200);
    },
    [quitar]
  );

  const valor = useMemo(() => notificar, [notificar]);

  return (
    <Ctx.Provider value={valor}>
      {children}
      <div className="toasts no-print" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`}>
            <span className="toast__ico">
              {t.tipo === "ok" ? <CheckIcon size={16} /> : t.tipo === "error" ? <AlertIcon size={16} /> : <InfoIcon size={16} />}
            </span>
            <span>{t.texto}</span>
            {t.accion && (
              <button
                type="button"
                className="toast__btn"
                onClick={() => {
                  t.accion?.fn();
                  quitar(t.id);
                }}
              >
                {t.accion.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
