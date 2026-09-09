export interface Provincia {
  nombre: string;
  distritos: Distrito[];
}

export interface Distrito {
  nombre: string;
  corregimientos?: string[];
}

export const PROVINCIAS: Provincia[] = [
  {
    nombre: "Bocas del Toro",
    distritos: [
      { nombre: "Bocas del Toro" },
      { nombre: "Changuinola" },
      { nombre: "Chiriquí Grande" },
    ],
  },
  {
    nombre: "Chiriquí",
    distritos: [
      { nombre: "Alanje" },
      { nombre: "Barú" },
      { nombre: "Boquerón" },
      { nombre: "Boquete" },
      { nombre: "Bugaba" },
      { nombre: "David", corregimientos: ["David", "Bijagual", "Cochea", "Chiriquí", "Guacá", "Las Lomas", "Pedregal", "San Carlos", "San Pablo Nuevo", "San Pablo Viejo"] },
      { nombre: "Dolega" },
      { nombre: "Gualaca" },
      { nombre: "Remedios" },
      { nombre: "San Félix" },
      { nombre: "San Lorenzo" },
      { nombre: "Tierras Altas" },
      { nombre: "Tolé" },
    ],
  },
  {
    nombre: "Coclé",
    distritos: [
      { nombre: "Aguadulce", corregimientos: ["Aguadulce", "Barrios Unidos", "El Roble", "El Cristo", "Pocrí"] },
      { nombre: "Antón", corregimientos: ["Antón", "Caballero", "Cabuya", "Chiguirí Arriba", "El Chirú", "El Retiro", "El Valle", "Juan Díaz", "Río Hato", "San Juan de Dios", "Santa Rita"] },
      { nombre: "La Pintada" },
      { nombre: "Natá" },
      { nombre: "Olá" },
      { nombre: "Penonomé", corregimientos: ["Penonomé", "Cañaveral", "Coclé", "Chiguirí Abajo", "El Coco", "Pajonal", "Río Grande", "Río Indio", "Toabré", "Tulú"] },
    ],
  },
  {
    nombre: "Colón",
    distritos: [
      { nombre: "Chagres" },
      { nombre: "Colón", corregimientos: ["Barrio Norte", "Barrio Sur", "Buena Vista", "Cativá", "Ciricito", "Cristóbal", "Escobal", "Limón", "Nueva Providencia", "Puerto Pilón", "Sabanitas", "Salamanca", "San Juan", "Santa Rosa"] },
      { nombre: "Donoso" },
      { nombre: "Omar Torrijos Herrera" },
      { nombre: "Portobelo" },
      { nombre: "Santa Isabel" },
    ],
  },
  {
    nombre: "Darién",
    distritos: [
      { nombre: "Chepigana" },
      { nombre: "Pinogana" },
      { nombre: "Santa Fe" },
    ],
  },
  {
    nombre: "Herrera",
    distritos: [
      { nombre: "Chitré", corregimientos: ["Chitré", "La Arena", "Llano Bonito", "Monagrillo", "San Juan Bautista"] },
      { nombre: "Las Minas" },
      { nombre: "Los Pozos" },
      { nombre: "Ocú" },
      { nombre: "Parita" },
      { nombre: "Pesé" },
      { nombre: "Santa María" },
    ],
  },
  {
    nombre: "Los Santos",
    distritos: [
      { nombre: "Guararé" },
      { nombre: "Las Tablas", corregimientos: ["Las Tablas", "Bajo Corral", "Bayano", "El Carate", "El Cocal", "El Manantial", "El Muñoz", "El Pedregoso", "La Laja", "La Miel", "La Palma", "La Tiza", "Las Palmitas", "Las Tablas Abajo", "Nuario", "Palmira", "Peña Blanca", "San José", "San José del Valle", "San Miguel", "Santo Domingo", "Sesteadero", "Valle Rico", "Vallerriquito"] },
      { nombre: "Los Santos" },
      { nombre: "Macaracas" },
      { nombre: "Pedasí" },
      { nombre: "Pocrí" },
      { nombre: "Tonosí" },
    ],
  },
  {
    nombre: "Panamá",
    distritos: [
      {
        nombre: "Balboa",
        corregimientos: ["San Miguel", "La Ensenada", "La Esmeralda", "La Guinea", "Pedro González", "Saboga"],
      },
      {
        nombre: "Chepo",
        corregimientos: ["Chepo", "Cañita", "Chepillo", "El Llano", "Las Margaritas", "Los Llanitos", "Madugandí", "Mulatupo", "Río Congo", "San Martín"],
      },
      { nombre: "Chimán" },
      {
        nombre: "Panamá",
        corregimientos: [
          "San Felipe", "El Chorrillo", "Santa Ana", "Calidonia", "Curundú", "Betania", "Bella Vista", "Bethania",
          "San Francisco", "Pueblo Nuevo", "Parque Lefevre", "Río Abajo", "Juan Díaz", "Pedregal",
          "San Martín", "Tocumen", "Las Mañanitas", "Pacora", "San Miguelito", "24 de Diciembre",
          "Ancón", "Chilibre", "Ernesto Córdoba Campos", "Las Cumbres", "Alcalde Díaz", "Caimitillo",
        ],
      },
      { nombre: "San Miguelito", corregimientos: ["Amelia Denis de Icaza", "Belisario Porras", "José Domingo Espinar", "Mateo Iturralde", "Victoriano Lorenzo", "Arnulfo Arias", "Belisario Frías", "Omar Torrijos", "Rufina Alfaro"] },
      { nombre: "Taboga", corregimientos: ["Taboga", "Otoque Occidente", "Otoque Oriente"] },
    ],
  },
  {
    nombre: "Panamá Oeste",
    distritos: [
      { nombre: "Arraiján", corregimientos: ["Arraiján", "Burunga", "Cerro Silvestre", "Juan Demóstenes Arosemena", "Nuevo Emperador", "Santa Clara", "Veracruz", "Vista Alegre"] },
      { nombre: "Capira", corregimientos: ["Capira", "Caimito", "Campana", "Cermeño", "Cirí de Los Sotos", "Cirí Grande", "El Cacao", "La Trinidad", "Las Ollas Arriba", "Lídice", "Villa Carmen", "Villa Rosario", "Santa Rosa"] },
      { nombre: "Chame", corregimientos: ["Chame", "Bejuco", "Buenos Aires", "Cabuyal", "Chica", "El Líbano", "Las Lajas", "Nueva Gorgona", "Punta Chame", "Sajalices", "Sorá"] },
      { nombre: "La Chorrera", corregimientos: ["La Chorrera", "Barrio Balboa", "Barrio Colón", "Amador", "Arosemena", "El Arado", "El Coco", "Feuillet", "Guadalupe", "Herrera", "Hurtado", "Iturralde", "La Represa", "Los Díaz", "Mendoza", "Obaldía", "Playa Leona", "Puerto Caimito", "Santa Rita"] },
      { nombre: "San Carlos", corregimientos: ["San Carlos", "El Espino", "El Higo", "Guayabito", "La Ermita", "La Laguna", "Las Uvas", "Los Llanitos", "San José"] },
    ],
  },
  {
    nombre: "Veraguas",
    distritos: [
      { nombre: "Atalaya" },
      { nombre: "Calobre" },
      { nombre: "Cañazas" },
      { nombre: "La Mesa" },
      { nombre: "Las Palmas" },
      { nombre: "Mariato" },
      { nombre: "Montijo" },
      { nombre: "Río de Jesús" },
      { nombre: "San Francisco" },
      { nombre: "Santa Fe" },
      { nombre: "Santiago", corregimientos: ["Santiago", "La Colorada", "La Peña", "La Raya de Santa María", "Ponuga", "San Pedro del Espino", "Canto del Llano", "Los Algarrobos", "Rodrigo Luque", "Urracá", "San Martín de Porres", "Villa Lourdes", "Edwin Fábrega"] },
      { nombre: "Soná" },
    ],
  },
  {
    nombre: "Comarca Emberá-Wounaan",
    distritos: [{ nombre: "Cémaco" }, { nombre: "Sambú" }],
  },
  {
    nombre: "Comarca Guna Yala",
    distritos: [{ nombre: "Comarca Guna Yala (corregimientos)" }],
  },
  {
    nombre: "Comarca Ngäbe-Buglé",
    distritos: [
      { nombre: "Besikó" },
      { nombre: "Jirondai" },
      { nombre: "Kankintú" },
      { nombre: "Kusapín" },
      { nombre: "Mironó" },
      { nombre: "Müna" },
      { nombre: "Nole Duima" },
      { nombre: "Ñürüm" },
      { nombre: "Santa Catalina o Calovébora" },
    ],
  },
];

export function distritosDe(provincia: string): Distrito[] {
  const p = PROVINCIAS.find((x) => x.nombre === provincia);
  return p ? p.distritos : [];
}

export function corregimientosDe(provincia: string, distrito: string): string[] {
  const p = PROVINCIAS.find((x) => x.nombre === provincia);
  if (!p) return [];
  const d = p.distritos.find((x) => x.nombre === distrito);
  return d && d.corregimientos ? d.corregimientos : [];
}
