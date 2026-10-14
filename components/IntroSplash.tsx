"use client";

import { useEffect, useState } from "react";
import { Mark } from "./Mark";

const CLAVE = "gc:intro-visto";

/** Pantalla de bienvenida: se muestra solo la primera vez por sesión del navegador. */
export function IntroSplash({ ms = 1700 }: { ms?: number }) {
  const [salir, setSalir] = useState(false);
  const [vivo, setVivo] = useState(true);

  useEffect(() => {
    let visto = false;
    try {
      visto = window.sessionStorage.getItem(CLAVE) === "1";
      window.sessionStorage.setItem(CLAVE, "1");
    } catch {
      /* sin almacenamiento */
    }
    const reducido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (visto || reducido) {
      setVivo(false);
      return;
    }
    const t = setTimeout(() => setSalir(true), ms - 350);
    const t2 = setTimeout(() => setVivo(false), ms);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [ms]);

  if (!vivo) return null;

  return (
    <div className={`intro ${salir ? "intro--out" : ""}`} aria-hidden="true" onClick={() => setVivo(false)}>
      <div className="intro__orbit">
        <svg viewBox="0 0 220 220" className="intro__rings" fill="none">
          <circle className="intro__ring intro__ring--1" cx="110" cy="110" r="104" stroke="url(#intro-g1)" strokeWidth="2" />
          <circle className="intro__ring intro__ring--2" cx="110" cy="110" r="96" stroke="rgba(56,189,248,0.45)" strokeWidth="1.4" />
          <defs>
            <linearGradient id="intro-g1" x1="0" y1="0" x2="220" y2="220">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        <Mark id="intro-mark" size={112} className="intro__mark" />
      </div>
      <div className="intro__brand">
        <h1>Generador de Contratos</h1>
        <p>Preparando plantillas legales de la República de Panamá…</p>
      </div>
    </div>
  );
}
