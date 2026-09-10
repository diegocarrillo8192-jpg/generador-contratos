import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function resolverMetadataBase(value: string): URL {
  try {
    return new URL(value);
  } catch {
    return new URL("http://localhost:3000/");
  }
}

export const metadata: Metadata = {
  metadataBase: resolverMetadataBase(SITE_URL),
  title: "Generador de Contratos | Contratos Laborales y de Servicios en Panamá",
  description:
    "Crea contratos individuales de trabajo y contratos de prestación de servicios profesionales redactados bajo la legislación de la República de Panamá (Código de Trabajo, Ley 81 de 2019). Vista previa en vivo, exportación a PDF e impresión.",
  applicationName: "Generador de Contratos",
  keywords: [
    "contrato de trabajo Panamá",
    "contrato servicios profesionales",
    "generador de contratos",
    "Código de Trabajo Panamá",
    "Ley 81 de 2019",
    "RUC",
    "ITBMS",
  ],
  category: "legal",
  openGraph: {
    type: "website",
    locale: "es_PA",
    url: "/",
    siteName: "Generador de Contratos",
    title:
      "Generador de Contratos | Contratos Laborales y de Servicios en Panamá",
    description:
      "Contratos individuales de trabajo y de prestación de servicios profesionales redactados bajo la legislación de la República de Panamá. Vista previa en tiempo real, descarga en PDF e impresión.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Generador de Contratos · Panamá",
    description:
      "Contratos laborales y de servicios profesionales bajo la legislación panameña.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#060b1a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PA">
      <body>{children}</body>
    </html>
  );
}
