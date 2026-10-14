import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function resolverMetadataBase(value: string): URL {
  try {
    return new URL(value);
  } catch {
    return new URL("http://localhost:3000/");
  }
}

export const metadata: Metadata = {
  metadataBase: resolverMetadataBase(SITE_URL),
  title: {
    default: "Generador de Contratos | Contratos Laborales y de Servicios en Panamá",
    template: "%s | Generador de Contratos Panamá",
  },
  description:
    "Crea contratos individuales de trabajo y de prestación de servicios profesionales bajo la legislación de la República de Panamá. Vista previa en vivo, revisión legal automática, calculadora de costos laborales, logo de la empresa y exportación a PDF y Word.",
  applicationName: "Generador de Contratos",
  keywords: [
    "contrato de trabajo Panamá",
    "contrato servicios profesionales",
    "generador de contratos",
    "Código de Trabajo Panamá",
    "Ley 81 de 2019",
    "teletrabajo Panamá",
    "RUC",
    "ITBMS",
  ],
  category: "legal",
  openGraph: {
    type: "website",
    locale: "es_PA",
    url: "/",
    siteName: "Generador de Contratos",
    title: "Generador de Contratos | Contratos Laborales y de Servicios en Panamá",
    description:
      "Contratos laborales y de servicios profesionales redactados bajo la legislación de Panamá. Vista previa en tiempo real, PDF y Word con el logo de su empresa.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Generador de Contratos · Panamá",
    description: "Contratos laborales y de servicios profesionales bajo la legislación panameña.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070b14" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Aplica el tema guardado antes de pintar para evitar el parpadeo.
const scriptTema = `(function(){try{var t=localStorage.getItem("gc:tema");if(t!=="claro"&&t!=="oscuro"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"claro":"oscuro"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="oscuro"}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PA" data-theme="oscuro" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
