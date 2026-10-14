import type { FormData, TipoContrato } from "./types";
import { causalesDefaultLaboral, causalesDefaultServicios, datosIniciales, fechaDefault, personaVacia } from "./types";

function sumarDias(iso: string, dias: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Datos ficticios para conocer la herramienta. Ninguna persona ni empresa es real. */
export function datosEjemplo(tipo: TipoContrato): FormData {
  const hoy = fechaDefault();
  const base = datosIniciales();
  const empresa = {
    ...personaVacia(),
    tipo: "juridica" as const,
    nombre: "Servicios Ejemplo Istmo, S.A.",
    representante: "María Fernanda Ejemplo Ríos",
    cedula: "8-888-1234",
    ruc: "155555555-2-2020",
    dv: "45",
    telefono: "+507 300-0000",
    correo: "rrhh@ejemplo.com.pa",
    provincia: "Panamá",
    distrito: "Panamá",
    corregimiento: "Bella Vista",
    direccion: "Calle 50, Edificio Ejemplo, piso 8, oficina 8-B",
  };
  const persona = {
    ...personaVacia(),
    nombre: "Carlos Alberto Muestra Pérez",
    cedula: "8-765-4321",
    telefono: "+507 6000-0000",
    correo: "carlos.muestra@correo.com",
    provincia: "Panamá Oeste",
    distrito: "Arraiján",
    corregimiento: "Vista Alegre",
    direccion: "Urbanización Ejemplo, calle 3, casa 27",
  };

  if (tipo === "servicios") {
    return {
      ...base,
      tipo,
      empleador: empresa,
      trabajador: { ...persona, profesion: "desarrollador de software", ruc: "8-765-4321", dv: "12" },
      objeto: "el diseño, desarrollo e implementación de una plataforma web de gestión de clientes",
      entregables:
        "Documento de requerimientos y alcance aprobado\nPrototipo navegable de la plataforma\nCódigo fuente y despliegue en el servidor del contratante\nManual de usuario y capacitación de dos (2) horas",
      fechaInicio: hoy,
      fechaFin: sumarDias(hoy, 90),
      honorarios: "6500",
      formaPagoServicios: "40% a la firma del contrato\n30% contra entrega del prototipo\n30% contra entrega final y aceptación",
      plazoPago: "15",
      preavisoDias: "15",
      incluyeItbms: true,
      causales: causalesDefaultServicios,
      confidencialidad: true,
    };
  }

  const laboral: FormData = {
    ...base,
    tipo,
    empleador: empresa,
    trabajador: persona,
    cargo: "Asistente Administrativo",
    lugarTrabajo: "las oficinas de EL EMPLEADOR en la Ciudad de Panamá",
    funciones:
      "Atender llamadas, correspondencia y visitantes\nRegistrar facturas y mantener el control de archivo\nApoyar en la preparación de informes administrativos\nGestionar la agenda de la gerencia",
    horario: "lunes a viernes de 8:00 a.m. a 5:00 p.m., con una hora de descanso",
    salario: "950",
    beneficios: "Seguro médico privado colectivo\nBono de alimentación de B/. 50.00 mensuales",
    causales: causalesDefaultLaboral,
    fechaInicio: hoy,
    confidencialidad: true,
  };
  if (tipo === "definido") return { ...laboral, fechaFin: sumarDias(hoy, 180) };
  if (tipo === "obra") {
    return {
      ...laboral,
      cargo: "Maestro de obra",
      lugarTrabajo: "el proyecto residencial ubicado en Costa del Este",
      obraDescripcion: "Construcción del muro perimetral del proyecto\nInstalación de aceras y cordones\nAcabados de pintura exterior",
      funciones: "Dirigir la cuadrilla asignada\nVelar por el cumplimiento de las normas de seguridad\nReportar avances diarios al ingeniero residente",
      fechaFin: sumarDias(hoy, 120),
      salario: "1100",
      confidencialidad: false,
      anexoEquipos: true,
      equipos: "Casco, chaleco y botas de seguridad\nJuego de herramientas manuales\nTeléfono celular de la empresa",
    };
  }
  return { ...laboral, periodoPrueba: true, mesesPrueba: "3", modalidad: "hibrido" };
}
