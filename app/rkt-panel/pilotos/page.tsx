"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { useDriverStore } from "@/components/rkt-panel/use-driver-store";
import {
  DRIVER_CATEGORIES,
  type DriverCategory,
  type DriverRecord,
  type DriverStatus,
  slugifyDriverName,
} from "@/lib/rkt-panel";

type OrderBy = "name" | "registeredAt" | "status";

interface DriverDraft {
  name: string;
  age: string;
  dni: string;
  phone: string;
  email: string;
  category: DriverCategory;
  status: DriverStatus;
  photo: string;
}

const EMPTY_DRAFT: DriverDraft = {
  name: "",
  age: "",
  dni: "",
  phone: "",
  email: "",
  category: "Senior",
  status: "Activo",
  photo: "/logos/logo_rkt.png",
};

function DriverPhoto({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill unoptimized className="object-cover" />;
}

export default function RktPanelPilotosPage() {
  const router = useRouter();
  const { drivers, loaded, upsertDriver } = useDriverStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DriverCategory | "Todas">("Todas");
  const [orderBy, setOrderBy] = useState<OrderBy>("name");
  const [openCreate, setOpenCreate] = useState(false);
  const [draft, setDraft] = useState<DriverDraft>(EMPTY_DRAFT);

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...drivers]
      .filter((driver) => (category === "Todas" ? true : driver.category === category))
      .filter((driver) => driver.name.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => {
        if (orderBy === "registeredAt") {
          return new Date(right.history.registeredAt).getTime() - new Date(left.history.registeredAt).getTime();
        }

        if (orderBy === "status") {
          return left.status.localeCompare(right.status);
        }

        return left.name.localeCompare(right.name, "es");
      });
  }, [category, drivers, orderBy, query]);

  function updateDraft<K extends keyof DriverDraft>(key: K, value: DriverDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateDraft("photo", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleCreateDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const driver: DriverRecord = {
      id: `${slugifyDriverName(draft.name)}-${Date.now().toString().slice(-5)}`,
      name: draft.name,
      age: Number(draft.age || 0),
      dni: draft.dni,
      phone: draft.phone,
      email: draft.email,
      category: draft.category,
      status: draft.status,
      photo: draft.photo,
      documentation: {
        insuranceAccepted: false,
        liabilitySigned: false,
        imageAccepted: false,
      },
      history: {
        registeredAt: now,
        confirmedAt: now,
        confirmedBy: "Panel RKT",
      },
      comments: [],
      internalNotes: "",
    };

    upsertDriver(driver);
    setDraft(EMPTY_DRAFT);
    setOpenCreate(false);
  }

  return (
    <PanelShell heading="Pilotos confirmados" kicker="Gestión de pilotos">
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="grid flex-1 gap-3 md:grid-cols-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre"
                className="rounded-2xl border border-amber-500/15 bg-black/45 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-amber-400/45"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as DriverCategory | "Todas")}
                className="rounded-2xl border border-amber-500/15 bg-black/45 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45"
              >
                <option value="Todas">Todas las categorías</option>
                {DRIVER_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={orderBy}
                onChange={(event) => setOrderBy(event.target.value as OrderBy)}
                className="rounded-2xl border border-amber-500/15 bg-black/45 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="registeredAt">Ordenar por fecha inscripción</option>
                <option value="status">Ordenar por estado</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-500/20"
            >
              Añadir piloto
            </button>
          </div>
        </motion.section>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {loaded
            ? filteredDrivers.map((driver, index) => (
                <motion.button
                  key={driver.id}
                  type="button"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  onClick={() => router.push(`/rkt-panel/pilotos/${driver.id}`)}
                  className="group overflow-hidden rounded-[26px] border border-amber-500/15 bg-white/[0.03] text-left backdrop-blur-xl transition hover:border-amber-300/35 hover:bg-white/[0.05]"
                >
                  <div className="aspect-[0.88] overflow-hidden bg-black">
                    <DriverPhoto src={driver.photo} alt={driver.name} />
                  </div>
                  <div className="border-t border-amber-500/10 px-4 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white transition group-hover:text-amber-100">{driver.name}</p>
                  </div>
                </motion.button>
              ))
            : Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-[26px] border border-white/5 bg-white/[0.03]">
                  <div className="aspect-[0.88] animate-pulse bg-white/[0.04]" />
                  <div className="px-4 py-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))}
        </div>
      </div>

      <AnimatePresence>
        {openCreate ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[28px] border border-amber-500/20 bg-[#090806] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300/70">Nuevo piloto</p>
                  <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.06em] text-white">Añadir piloto</h2>
                </div>
                <button type="button" onClick={() => setOpenCreate(false)} className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                  Cerrar
                </button>
              </div>

              <form onSubmit={handleCreateDriver} className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Nombre", value: draft.name, onChange: (value: string) => updateDraft("name", value) },
                  { label: "Edad", value: draft.age, onChange: (value: string) => updateDraft("age", value) },
                  { label: "DNI", value: draft.dni, onChange: (value: string) => updateDraft("dni", value) },
                  { label: "Teléfono", value: draft.phone, onChange: (value: string) => updateDraft("phone", value) },
                  { label: "Email", value: draft.email, onChange: (value: string) => updateDraft("email", value) },
                ].map(({ label, value, onChange }) => (
                  <label key={label} className="block space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">{label}</span>
                    <input
                      required
                      value={value}
                      onChange={(event) => onChange(event.target.value)}
                      className="w-full rounded-2xl border border-amber-500/15 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45"
                    />
                  </label>
                ))}

                <label className="block space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">Categoría</span>
                  <div className="relative">
                    <select
                      value={draft.category}
                      onChange={(event) => updateDraft("category", event.target.value as DriverCategory)}
                      className="w-full appearance-none rounded-2xl border border-amber-500/15 bg-black/60 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-amber-400/45 focus:bg-black/70"
                    >
                      {DRIVER_CATEGORIES.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="bg-[#090806] text-white"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-amber-300/75">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                        <path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">Estado</span>
                  <div className="relative">
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft("status", event.target.value as DriverStatus)}
                      className="w-full appearance-none rounded-2xl border border-amber-500/15 bg-black/60 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-amber-400/45 focus:bg-black/70"
                    >
                      <option value="Activo" className="bg-[#090806] text-white">Activo</option>
                      <option value="Inactivo" className="bg-[#090806] text-white">Inactivo</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-amber-300/75">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                        <path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </label>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">Foto del piloto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full rounded-2xl border border-dashed border-amber-500/20 bg-white/[0.03] px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-500/15 file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.2em] file:text-amber-100"
                  />
                </label>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-500/20"
                  >
                    Guardar piloto
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PanelShell>
  );
}
