import type { FormData, Persona, TipoContrato } from "@/lib/types";
import {
  ClausulasCard,
  CondicionesLaboralesCard,
  DatosEmpleadorCard,
  DatosTrabajadorCard,
  FechaFormatoCard,
  FirmasCard,
  LaboresCard,
  ServiciosCard,
  TipoContratoCard,
  type Rotulo,
} from "./contract/sections";
import type { Which } from "./contract/persona";

const MENSAJES: Record<"laboral" | "servicios", Rotulo> = {
  laboral: {
    A: "Empleador",
    B: "Trabajador",
  },
  servicios: {
    A: "Contratante",
    B: "Contratista",
  },
};

export default function ContractForms({
  data,
  set,
  setPersona,
  onChangeTipo,
}: {
  data: FormData;
  set: (patch: Partial<FormData>) => void;
  setPersona: (which: Which, k: keyof Persona, v: string) => void;
  onChangeTipo: (t: TipoContrato) => void;
}) {
  const esServicios = data.tipo === "servicios";
  const rotulo = esServicios ? MENSAJES.servicios : MENSAJES.laboral;

  return (
    <div>
      <p className="form-intro">
        Complete los datos del documento. La vista previa y el texto legal se
        actualizan en tiempo real con base en la legislación de la República de
        Panamá (Código de Trabajo, Ley 81 de 2019, Ley del XIII mes, entre
        otras).
      </p>

      <TipoContratoCard data={data} set={set} onChangeTipo={onChangeTipo} />
      <DatosEmpleadorCard
        data={data}
        setPersona={setPersona}
        rotulo={rotulo}
        esServicios={esServicios}
      />
      <DatosTrabajadorCard
        data={data}
        setPersona={setPersona}
        rotulo={rotulo}
        esServicios={esServicios}
      />
      {!esServicios && <CondicionesLaboralesCard data={data} set={set} />}
      {esServicios && <ServiciosCard data={data} set={set} />}
      <LaboresCard data={data} set={set} esServicios={esServicios} />
      <ClausulasCard data={data} set={set} esServicios={esServicios} />
      <FirmasCard data={data} set={set} />
      <FechaFormatoCard data={data} set={set} />
    </div>
  );
}
