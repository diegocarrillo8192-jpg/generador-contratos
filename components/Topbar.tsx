"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { BookIcon, EditIcon, MoonIcon, SunIcon } from "./icons";
import { almacen } from "@/lib/storage";

export function ThemeToggle() {
  const [tema, setTema] = useState<"oscuro" | "claro">("oscuro");

  useEffect(() => {
    const actual = document.documentElement.dataset.theme === "claro" ? "claro" : "oscuro";
    setTema(actual);
  }, []);

  const cambiar = () => {
    const nuevo = tema === "oscuro" ? "claro" : "oscuro";
    document.documentElement.dataset.theme = nuevo;
    almacen.guardarTema(nuevo);
    setTema(nuevo);
  };

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={cambiar}
      aria-label={tema === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={tema === "oscuro" ? "Tema claro" : "Tema oscuro"}
    >
      {tema === "oscuro" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export function Topbar({ activo, children }: { activo: "generador" | "manual"; children?: ReactNode }) {
  return (
    <header className="topbar no-print">
      <div className="topbar__inner">
        <Link href="/" className="topbar__brand" aria-label="Ir al generador">
          <Logo size={36} />
        </Link>
        <nav className="topnav" aria-label="Secciones">
          <Link href="/" className={`topnav__a ${activo === "generador" ? "topnav__a--on" : ""}`} aria-current={activo === "generador" ? "page" : undefined}>
            <EditIcon size={16} />
            <span className="topnav__full">Generador</span>
            <span className="topnav__short">Crear</span>
          </Link>
          <Link href="/manual" className={`topnav__a ${activo === "manual" ? "topnav__a--on" : ""}`} aria-current={activo === "manual" ? "page" : undefined}>
            <BookIcon size={16} />
            <span className="topnav__full">Manual de uso</span>
            <span className="topnav__short">Manual</span>
          </Link>
        </nav>
        <div className="topbar__actions">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
