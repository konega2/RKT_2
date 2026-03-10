export type DriverStatus = "Activo" | "Inactivo";
export type DriverCategory = "Senior" | "Junior" | "Pro" | "Amateur";

export interface DriverComment {
  id: string;
  text: string;
  createdAt: string;
}

export interface DriverDocumentation {
  insuranceAccepted: boolean;
  liabilitySigned: boolean;
  imageAccepted: boolean;
}

export interface DriverHistory {
  registeredAt: string;
  confirmedAt: string;
  confirmedBy: string;
}

export interface DriverRecord {
  id: string;
  name: string;
  age: number;
  dni: string;
  phone: string;
  email: string;
  category: DriverCategory;
  status: DriverStatus;
  photo: string;
  documentation: DriverDocumentation;
  history: DriverHistory;
  comments: DriverComment[];
  internalNotes: string;
}

export interface TrainingSessionRecord {
  id: string;
  name: string;
  time: string;
  duration: number;
  maxPilots: number;
  pilots: DriverRecord[];
}

export const PANEL_AUTH_KEY = "rkt-panel-authenticated";
export const DRIVERS_STORAGE_KEY = "rkt-panel-drivers";

export const PANEL_CREDENTIALS = {
  username: "RKT",
  password: "RKT_2007",
} as const;

export const DRIVER_CATEGORIES: DriverCategory[] = ["Senior", "Junior", "Pro", "Amateur"];
export const DRIVER_STATUSES: DriverStatus[] = ["Activo", "Inactivo"];

const DEFAULT_PHOTO = "/logos/logo_rkt.png";

export const DEFAULT_TRAINING_SESSIONS = [
  { time: "10:30", name: "Entrenamientos Libres 1" },
  { time: "10:50", name: "Entrenamientos Libres 2" },
  { time: "11:10", name: "Entrenamientos Libres 3" },
  { time: "11:30", name: "Entrenamientos Libres 4" },
  { time: "11:50", name: "Entrenamientos Libres 5" },
  { time: "12:10", name: "Entrenamientos Libres 6" },
  { time: "12:40", name: "Entrenamientos Libres 7" },
  { time: "13:00", name: "Entrenamientos Libres 8" },
  { time: "13:20", name: "Entrenamientos Libres 9" },
  { time: "13:40", name: "Entrenamientos Libres 10" },
  { time: "14:00", name: "Entrenamientos Libres 11" },
  { time: "14:20", name: "Entrenamientos Libres 12" },
  { time: "14:50", name: "Entrenamientos Libres 13" },
  { time: "15:10", name: "Entrenamientos Libres 14" },
  { time: "15:30", name: "Entrenamientos Libres 15" },
  { time: "15:50", name: "Entrenamientos Libres 16" },
  { time: "16:10", name: "Entrenamientos Libres 17" },
  { time: "16:30", name: "Entrenamientos Libres 18" },
  { time: "17:00", name: "Entrenamientos Libres 19" },
  { time: "17:20", name: "Entrenamientos Libres 20" },
  { time: "17:40", name: "Entrenamientos Libres 21" },
  { time: "18:00", name: "Entrenamientos Libres 22" },
  { time: "18:20", name: "Entrenamientos Libres 23" },
  { time: "18:40", name: "Entrenamientos Libres 24" },
  { time: "19:10", name: "Entrenamientos Libres 25" },
  { time: "19:30", name: "Entrenamientos Libres 26" },
  { time: "19:50", name: "Entrenamientos Libres 27" },
] as const;

export const DEFAULT_DRIVERS: DriverRecord[] = [
  {
    id: "alex-martin",
    name: "Álex Martín",
    age: 28,
    dni: "12345678A",
    phone: "+34 612 345 678",
    email: "alex.martin@rkt.local",
    category: "Pro",
    status: "Activo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: true,
      liabilitySigned: true,
      imageAccepted: true,
    },
    history: {
      registeredAt: "2026-03-02T11:00:00.000Z",
      confirmedAt: "2026-03-03T09:30:00.000Z",
      confirmedBy: "Dirección deportiva",
    },
    comments: [
      {
        id: "c-1",
        text: "Piloto con experiencia previa en endurance indoor.",
        createdAt: "2026-03-03T09:45:00.000Z",
      },
    ],
    internalNotes: "Revisar talla de mono antes del cierre de inscripciones.",
  },
  {
    id: "david-perez",
    name: "David Pérez",
    age: 24,
    dni: "22345678B",
    phone: "+34 622 111 090",
    email: "david.perez@rkt.local",
    category: "Senior",
    status: "Activo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: true,
      liabilitySigned: true,
      imageAccepted: false,
    },
    history: {
      registeredAt: "2026-03-04T13:10:00.000Z",
      confirmedAt: "2026-03-04T18:20:00.000Z",
      confirmedBy: "Administración RKT",
    },
    comments: [],
    internalNotes: "Pendiente de recibir autorización de imagen firmada.",
  },
  {
    id: "jaime-ruiz",
    name: "Jaime Ruiz",
    age: 19,
    dni: "32345678C",
    phone: "+34 633 888 220",
    email: "jaime.ruiz@rkt.local",
    category: "Junior",
    status: "Activo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: true,
      liabilitySigned: true,
      imageAccepted: true,
    },
    history: {
      registeredAt: "2026-03-05T08:00:00.000Z",
      confirmedAt: "2026-03-05T11:30:00.000Z",
      confirmedBy: "Coordinación deportiva",
    },
    comments: [
      {
        id: "c-2",
        text: "Confirmar si necesita asiento adicional para warm-up.",
        createdAt: "2026-03-05T11:40:00.000Z",
      },
    ],
    internalNotes: "Muy buen ritmo en entrenamientos previos.",
  },
  {
    id: "lucas-ferrer",
    name: "Lucas Ferrer",
    age: 31,
    dni: "42345678D",
    phone: "+34 644 222 110",
    email: "lucas.ferrer@rkt.local",
    category: "Amateur",
    status: "Inactivo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: false,
      liabilitySigned: false,
      imageAccepted: true,
    },
    history: {
      registeredAt: "2026-03-06T15:25:00.000Z",
      confirmedAt: "2026-03-07T10:00:00.000Z",
      confirmedBy: "Backoffice RKT",
    },
    comments: [],
    internalNotes: "Esperando verificación de documentación de seguro.",
  },
  {
    id: "sergio-moya",
    name: "Sergio Moya",
    age: 26,
    dni: "52345678E",
    phone: "+34 655 123 456",
    email: "sergio.moya@rkt.local",
    category: "Pro",
    status: "Activo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: true,
      liabilitySigned: true,
      imageAccepted: true,
    },
    history: {
      registeredAt: "2026-03-07T12:40:00.000Z",
      confirmedAt: "2026-03-07T14:15:00.000Z",
      confirmedBy: "Dirección deportiva",
    },
    comments: [],
    internalNotes: "Asignar briefing avanzado de estrategia.",
  },
  {
    id: "marc-lopez",
    name: "Marc López",
    age: 22,
    dni: "62345678F",
    phone: "+34 666 777 888",
    email: "marc.lopez@rkt.local",
    category: "Senior",
    status: "Activo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: true,
      liabilitySigned: true,
      imageAccepted: true,
    },
    history: {
      registeredAt: "2026-03-08T09:00:00.000Z",
      confirmedAt: "2026-03-08T12:00:00.000Z",
      confirmedBy: "Administración RKT",
    },
    comments: [],
    internalNotes: "Solicita box cercano al briefing room.",
  },
  {
    id: "raul-gomez",
    name: "Raúl Gómez",
    age: 29,
    dni: "72345678G",
    phone: "+34 677 456 789",
    email: "raul.gomez@rkt.local",
    category: "Amateur",
    status: "Activo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: true,
      liabilitySigned: false,
      imageAccepted: true,
    },
    history: {
      registeredAt: "2026-03-09T10:10:00.000Z",
      confirmedAt: "2026-03-09T13:00:00.000Z",
      confirmedBy: "Backoffice RKT",
    },
    comments: [],
    internalNotes: "Pendiente firma digital del documento de responsabilidad.",
  },
  {
    id: "ivan-castro",
    name: "Iván Castro",
    age: 27,
    dni: "82345678H",
    phone: "+34 688 900 321",
    email: "ivan.castro@rkt.local",
    category: "Junior",
    status: "Activo",
    photo: DEFAULT_PHOTO,
    documentation: {
      insuranceAccepted: true,
      liabilitySigned: true,
      imageAccepted: true,
    },
    history: {
      registeredAt: "2026-03-09T16:20:00.000Z",
      confirmedAt: "2026-03-09T18:10:00.000Z",
      confirmedBy: "Coordinación deportiva",
    },
    comments: [],
    internalNotes: "Añadir a listado de rookies destacados.",
  },
];

export function formatPanelDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function slugifyDriverName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
