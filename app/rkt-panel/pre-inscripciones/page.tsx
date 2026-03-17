"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { useDriverStore } from "@/components/rkt-panel/use-driver-store";
import {
  DRIVER_CATEGORIES,
  formatPanelDate,
  slugifyDriverName,
  type DriverCategory,
  type DriverRecord,
} from "@/lib/rkt-panel";

type OrderBy = "newest" | "oldest";

interface DriverDraft {
  name: string;
  age: string;
  dni: string;
  phone: string;
  email: string;
  category: DriverCategory[];
  photo: string;
}

const EMPTY_DRAFT: DriverDraft = {
  name: "",
  age: "",
  dni: "",
  phone: "",
  email: "",
  category: ["Junior"],
  photo: "/logos/logo_rkt.png",
};

function DriverPhoto({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill unoptimized className="object-contain p-4" />;
}

export default function RktPanelPreinscripcionesPage() {
  const { drivers, loaded, error, upsertDriver, removeDriver } = useDriverStore();
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>("newest");
  const [openCreate, setOpenCreate] = useState(false);
  const [draft, setDraft] = useState<DriverDraft>(EMPTY_DRAFT);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pendingDrivers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...drivers]
      .filter((driver) => driver.status === "PENDING")
      .filter((driver) => driver.name.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => {
        const diff = new Date(right.history.registeredAt).getTime() - new Date(left.history.registeredAt).getTime();
        return orderBy === "newest" ? diff : -diff;
      });
  }, [drivers, orderBy, query]);

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

  async function handleCreateDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const driver: DriverRecord = {
      id: `${slugifyDriverName(draft.name)}-${Date.now().toString().slice(-6)}`,
      name: draft.name,
      age: Number(draft.age || 0),
      dni: draft.dni,
      phone: draft.phone,
      email: draft.email,
      category: draft.category,
      status: "PENDING",
      photo: draft.photo,
      documentation: {
        insuranceAccepted: false,
        liabilitySigned: false,
        imageAccepted: false,
      },
      history: {
        registeredAt: now,
        confirmedAt: now,
        confirmedBy: "Pendiente",
      },
      comments: [],
      internalNotes: "",
    };

    try {
      await upsertDriver(driver);
      setDraft(EMPTY_DRAFT);
      setOpenCreate(false);
      setFeedback("Piloto añadido como pre-inscrito.");
    } catch (createError) {
      setFeedback(createError instanceof Error ? createError.message : "No se ha podido crear la pre-inscripción.");
    }
  }

  async function handleConfirm(driver: DriverRecord) {
    setProcessingId(driver.id);
    setFeedback(null);

    try {
      const now = new Date().toISOString();
      await upsertDriver({
        ...driver,
        status: "CONFIRMED",
        history: {
          ...driver.history,
          confirmedAt: now,
          confirmedBy: "Panel RKT",
        },
      });
      setFeedback(`${driver.name} ha pasado a pilotos confirmados.`);
    } catch (confirmError) {
      setFeedback(confirmError instanceof Error ? confirmError.message : "No se ha podido confirmar el piloto.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(driver: DriverRecord) {
    const confirmed = window.confirm(`¿Rechazar a ${driver.name}? Esta acción eliminará el piloto.`);

    if (!confirmed) {
      return;
    }

    setProcessingId(driver.id);
    setFeedback(null);

    try {
      await removeDriver(driver.id);
      setFeedback(`${driver.name} ha sido eliminado.`);
    } catch (rejectError) {
      setFeedback(rejectError instanceof Error ? rejectError.message : "No se ha podido rechazar el piloto.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <PanelShell heading="Pre-inscripciones" kicker="Admisión de pilotos">
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="grid flex-1 gap-3 md:grid-cols-[1.6fr_0.9fr]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre"
                className="rounded-2xl border border-amber-500/15 bg-black/45 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-amber-400/45"
              />

              <select
                value={orderBy}
                onChange={(event) => setOrderBy(event.target.value as OrderBy)}
                className="rounded-2xl border border-amber-500/15 bg-black/45 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45"
              >
                <option value="newest">Más recientes primero</option>
                <option value="oldest">Más antiguas primero</option>
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

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/45">
            <span className="rounded-full border border-amber-500/15 bg-black/35 px-3 py-1 text-amber-100">
              {loaded ? pendingDrivers.length : "--"} pendientes
            </span>
            <span>Revisión manual antes de confirmar</span>
          </div>
        </motion.section>

        {error ? (
          <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>
        ) : null}

        {feedback ? (
          <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">{feedback}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loaded ? (
            pendingDrivers.length ? (
              pendingDrivers.map((driver, index) => {
                const busy = processingId === driver.id;

                return (
                  <motion.article
                    key={driver.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                    className="overflow-hidden rounded-[26px] border border-amber-500/15 bg-white/[0.03] backdrop-blur-xl"
                  >
                    <div className="aspect-[1.02] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_45%),linear-gradient(180deg,#090909_0%,#050505_100%)]">
                      <div className="relative h-full w-full">
                        <DriverPhoto src={driver.photo} alt={driver.name} />
                      </div>
                    </div>

                    <div className="border-t border-amber-500/10 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{driver.name}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-amber-300/65">Inscrito · {formatPanelDate(driver.history.registeredAt)}</p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            void handleConfirm(driver);
                          }}
                          className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 transition hover:border-emerald-300/55 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? "Procesando..." : "Confirmar"}
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            void handleReject(driver);
                          }}
                          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-200 transition hover:border-red-400/55 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? "Procesando..." : "Rechazar"}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            ) : (
              <div className="rounded-[26px] border border-amber-500/15 bg-white/[0.03] p-8 text-sm text-white/55 md:col-span-2 xl:col-span-3">
                No hay pilotos pendientes de revisión.
              </div>
            )
          ) : (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[26px] border border-white/5 bg-white/[0.03]">
                <div className="aspect-[1.02] animate-pulse bg-white/[0.04]" />
                <div className="space-y-3 px-5 py-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
                  <div className="h-10 w-full animate-pulse rounded-2xl bg-white/[0.04]" />
                </div>
              </div>
            ))
          )}
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
                  <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300/70">Alta manual</p>
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
                  <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">Categorías</span>
                  <div className="grid gap-2 rounded-2xl border border-amber-500/15 bg-black/60 p-3">
                    {DRIVER_CATEGORIES.map((option) => {
                      const checked = draft.category.includes(option);

                      return (
                        <label key={option} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/30 px-3 py-2 text-sm text-white/80">
                          <span>{option}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const nextCategories = event.target.checked
                                ? [...draft.category, option]
                                : draft.category.filter((category) => category !== option);

                              updateDraft("category", nextCategories);
                            }}
                            className="h-4 w-4 accent-amber-400"
                          />
                        </label>
                      );
                    })}
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
                    Guardar pre-inscripción
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
