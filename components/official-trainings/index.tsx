"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { LandingTrainingSession } from "@/lib/landing-data";

const SESSIONS_PER_PAGE = 9;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function occupancyColor(assigned: number, maxPilots: number) {
  const ratio = assigned / maxPilots;

  if (ratio >= 1) {
    return "text-red-300";
  }

  if (ratio >= 0.75) {
    return "text-amber-200";
  }

  return "text-emerald-300";
}

export function OfficialTrainingsSection({ initialSessions }: { initialSessions: LandingTrainingSession[] }) {
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const sortedSessions = useMemo(
    () => [...initialSessions].sort((left, right) => toMinutes(left.time) - toMinutes(right.time)),
    [initialSessions],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedSessions.length / SESSIONS_PER_PAGE)),
    [sortedSessions.length],
  );

  const paginatedSessions = useMemo(() => {
    const start = page * SESSIONS_PER_PAGE;
    return sortedSessions.slice(start, start + SESSIONS_PER_PAGE);
  }, [page, sortedSessions]);

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const bestMatch = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return null;
    }

    const pilots = initialSessions
      .flatMap((session) => session.pilots)
      .filter((pilot, index, array) => array.findIndex((item) => item.id === pilot.id) === index)
      .filter((pilot) => normalizeText(pilot.name).includes(normalizedQuery));

    if (pilots.length === 0) {
      return null;
    }

    const sortedPilots = [...pilots].sort((left, right) => {
      const leftStarts = normalizeText(left.name).startsWith(normalizedQuery) ? 0 : 1;
      const rightStarts = normalizeText(right.name).startsWith(normalizedQuery) ? 0 : 1;

      if (leftStarts !== rightStarts) {
        return leftStarts - rightStarts;
      }

      return left.name.localeCompare(right.name, "es");
    });

    return sortedPilots[0];
  }, [query, initialSessions]);

  const sessionsForPilot = useMemo(() => {
    if (!bestMatch) {
      return [];
    }

    return sortedSessions.filter((session) => session.pilots.some((pilot) => pilot.id === bestMatch.id));
  }, [bestMatch, sortedSessions]);

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[26px] border border-amber-500/25 bg-black/35 p-5 backdrop-blur-xl sm:p-7"
        >
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-300/90">Entrenamientos Oficiales</p>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">Entrenamientos Oficiales</h2>
            <p className="mt-2 text-sm text-white/80">Viernes 3 de julio – sesiones de entrenamientos libres.</p>
          </div>

          <div className="mb-5 rounded-2xl border border-amber-500/20 bg-white/[0.05] p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/85">¿En qué entrenamientos estoy?</p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tu nombre..."
              className="mt-3 w-full rounded-xl border border-amber-500/25 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-amber-300/55"
            />

            <AnimatePresence initial={false}>
              {query.trim() ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.24 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl border border-amber-500/18 bg-amber-500/8 px-4 py-3">
                    {bestMatch ? (
                      <>
                        <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Tus entrenamientos · {bestMatch.name}</p>
                        <div className="mt-2 space-y-1.5">
                          {sessionsForPilot.map((session) => (
                            <p key={session.id} className="text-sm text-white/85">
                              {session.time} – {session.name}
                            </p>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-white/80">No encontramos ese piloto en las sesiones actuales.</p>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border border-amber-500/12 bg-white/[0.02]">
            <div className="grid grid-cols-[0.7fr_1.6fr_0.8fr] gap-3 border-b border-amber-500/10 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-amber-300/65">
              <span>Hora</span>
              <span>Sesión</span>
              <span className="text-right">Ocupación</span>
            </div>

            {paginatedSessions.length === 0 ? (
              <div className="px-4 py-5 text-sm text-white/75">No hay entrenamientos disponibles.</div>
            ) : (
              paginatedSessions.map((session) => {
                const assigned = session.pilots.length;
                const isOpen = openSessionId === session.id;

                return (
                  <div key={session.id} className="border-t border-amber-500/10 first:border-t-0">
                    <button
                      type="button"
                      onClick={() => setOpenSessionId((current) => (current === session.id ? null : session.id))}
                      className="grid w-full grid-cols-[0.7fr_1.6fr_0.8fr] gap-3 px-4 py-3 text-left text-sm transition hover:bg-amber-500/8"
                    >
                      <span className="font-semibold text-amber-100">{session.time}</span>
                      <span className="truncate text-white/85">{session.name}</span>
                      <span className={`text-right font-semibold ${occupancyColor(assigned, session.maxPilots)}`}>
                        {assigned}/{session.maxPilots}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-amber-500/10 bg-black/25 px-4 py-3">
                            {session.pilots.length > 0 ? (
                              <div className="grid gap-2 sm:grid-cols-2">
                                {session.pilots.map((pilot) => (
                                  <div key={pilot.id} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/35 px-2.5 py-2">
                                    <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-amber-500/20 bg-black/60">
                                      <Image src="/logos/logo_rkt.png" alt={pilot.name} fill unoptimized className="object-contain p-1" />
                                    </div>
                                    <span className="truncate text-sm text-white/85">{pilot.name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-white/75">No hay pilotos asignados todavía.</p>
                            )}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {sortedSessions.length > SESSIONS_PER_PAGE ? (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpenSessionId(null);
                  setPage((current) => Math.max(0, current - 1));
                }}
                disabled={page === 0}
                className="rounded-xl border border-amber-500/20 bg-black/45 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/45 hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Anterior
              </button>
              <span className="px-2 text-xs uppercase tracking-[0.14em] text-white/80">
                Página {page + 1} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpenSessionId(null);
                  setPage((current) => Math.min(totalPages - 1, current + 1));
                }}
                disabled={page >= totalPages - 1}
                className="rounded-xl border border-amber-500/20 bg-black/45 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/45 hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
