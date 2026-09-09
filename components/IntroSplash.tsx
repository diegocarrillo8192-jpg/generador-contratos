"use client";

import { useEffect, useState } from "react";
import { Mark } from "./Mark";

export function IntroSplash({ ms = 2400 }: { ms?: number }) {
  const [salir, setSalir] = useState(false);
  const [vivo, setVivo] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSalir(true), ms - 350);
    const t2 = setTimeout(() => setVivo(false), ms);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [ms]);

  if (!vivo) return null;

  return (
    <div className={`intro ${salir ? "intro--out" : ""}`} aria-hidden="true">
      <div className="intro__orbit">
        <svg viewBox="0 0 220 220" className="intro__rings" fill="none">
          <circle
            className="intro__ring intro__ring--1"
            cx="110"
            cy="110"
            r="104"
            stroke="url(#intro-g1)"
            strokeWidth="2"
          />
          <circle
            className="intro__ring intro__ring--2"
            cx="110"
            cy="110"
            r="96"
            stroke="rgba(56,189,248,0.45)"
            strokeWidth="1.4"
          />
          <defs>
            <linearGradient id="intro-g1" x1="0" y1="0" x2="220" y2="220">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
        <Mark size={120} className="intro__mark" />
      </div>
      <div className="intro__brand">
        <h1>Generador de Contratos</h1>
        <p>Cargando plantillas legales de la República de Panamá…</p>
      </div>
    </div>
  );
}
