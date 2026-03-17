"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { useDriverStore } from "@/components/rkt-panel/use-driver-store";
import {
  DRIVER_CATEGORIES,
  DRIVER_STATUS_LABELS,
  type DriverCategory,
} from "@/lib/rkt-panel";

type OrderBy = "name" | "registeredAt";

function DriverPhoto({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill unoptimized className="object-contain p-4" />;
}

export default function RktPanelPilotosPage() {
  const router = useRouter();
  const { drivers, loaded, error } = useDriverStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DriverCategory | "Todas">("Todas");
  const [orderBy, setOrderBy] = useState<OrderBy>("registeredAt");

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...drivers]
      .filter((driver) => driver.status === "CONFIRMED")
      .filter((driver) => (category === "Todas" ? true : driver.category.includes(category)))
      .filter((driver) => driver.name.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => {
        if (orderBy === "registeredAt") {
          return new Date(right.history.registeredAt).getTime() - new Date(left.history.registeredAt).getTime();
        }

        return left.name.localeCompare(right.name, "es");
      });
  }, [category, drivers, orderBy, query]);

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
                <option value="registeredAt">Ordenar por fecha inscripción</option>
                <option value="name">Ordenar por nombre</option>
              </select>
            </div>

            <a
              href="/rkt-panel/pre-inscripciones"
              className="rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-500/20"
            >
              Ver pre-inscripciones
            </a>
          </div>
        </motion.section>

        {error ? (
          <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {loaded ? (
            filteredDrivers.length ? (
              filteredDrivers.map((driver, index) => (
                <motion.button
                  key={driver.id}
                  type="button"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  onClick={() => router.push(`/rkt-panel/pilotos/${driver.id}`)}
                  className="group overflow-hidden rounded-[26px] border border-amber-500/15 bg-white/[0.03] text-left backdrop-blur-xl transition hover:border-amber-300/35 hover:bg-white/[0.05]"
                >
                  <div className="aspect-[0.88] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_45%),linear-gradient(180deg,#090909_0%,#050505_100%)]">
                    <div className="relative h-full w-full">
                      <DriverPhoto src={driver.photo} alt={driver.name} />
                    </div>
                  </div>
                  <div className="border-t border-amber-500/10 px-4 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white transition group-hover:text-amber-100">{driver.name}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-amber-300/65">{DRIVER_STATUS_LABELS[driver.status]}</p>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="col-span-2 rounded-[26px] border border-amber-500/15 bg-white/[0.03] p-8 text-sm text-white/55 md:col-span-3 xl:col-span-4">
                No hay pilotos confirmados con los filtros actuales.
              </div>
            )
          ) : (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[26px] border border-white/5 bg-white/[0.03]">
                <div className="aspect-[0.88] animate-pulse bg-white/[0.04]" />
                <div className="px-4 py-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PanelShell>
  );
}
