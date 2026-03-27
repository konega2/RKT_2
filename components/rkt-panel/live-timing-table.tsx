"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { type LiveClassificationEntry, type TrainingSanctionRecord } from "@/lib/rkt-panel";

interface LiveTimingTableProps {
  classification: LiveClassificationEntry[];
  sanctions: TrainingSanctionRecord[];
  selectedDriverId: string | null;
  selectedLap: number | null;
  onSelectDriver: (driverId: string) => void;
}

function formatLapTime(value: number) {
  return `${value.toFixed(3)}s`;
}

function formatGap(value: number) {
  if (value <= 0) {
    return "-";
  }

  return `+${value.toFixed(3)}s`;
}

function easeInOut(progress: number) {
  return 0.5 * (1 - Math.cos(Math.PI * progress));
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

export function LiveTimingTable({ classification, sanctions, selectedDriverId, selectedLap, onSelectDriver }: LiveTimingTableProps) {
  const [openSanctionPilotId, setOpenSanctionPilotId] = useState<string | null>(null);

  const targetClassification = useMemo(
    () => [...classification].sort((first, second) => first.mejorVuelta - second.mejorVuelta),
    [classification],
  );

  const sanctionsByPilot = useMemo(() => {
    const map = new Map<string, TrainingSanctionRecord[]>();

    sanctions.forEach((sanction) => {
      const current = map.get(sanction.pilotoId) ?? [];
      current.push(sanction);
      map.set(sanction.pilotoId, current);
    });

    map.forEach((list, pilotId) => {
      map.set(
        pilotId,
        [...list].sort((first, second) => first.createdAt - second.createdAt),
      );
    });

    return map;
  }, [sanctions]);

  const [displayedClassification, setDisplayedClassification] = useState<LiveClassificationEntry[]>(
    targetClassification,
  );
  const displayedClassificationRef = useRef<LiveClassificationEntry[]>(targetClassification);

  const previousValuesRef = useRef<Map<string, { mejorVuelta: number; ultimaVuelta: number }>>(new Map());

  useEffect(() => {
    if (targetClassification.length === 0) {
      setDisplayedClassification([]);
      return;
    }

    const startSnapshot = new Map(
      displayedClassificationRef.current.map((entry) => [entry.pilotoId, {
        mejorVuelta: entry.mejorVuelta,
        ultimaVuelta: entry.ultimaVuelta,
      }]),
    );

    const durationMs = 650;
    let animationFrame = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const rawProgress = Math.min(1, elapsed / durationMs);
      const easedProgress = easeInOut(rawProgress);

      const nextDisplay = targetClassification.map((targetEntry) => {
        const source = startSnapshot.get(targetEntry.pilotoId);

        if (!source) {
          return targetEntry;
        }

        return {
          ...targetEntry,
          ultimaVuelta: interpolate(source.ultimaVuelta, targetEntry.ultimaVuelta, easedProgress),
          mejorVuelta: interpolate(source.mejorVuelta, targetEntry.mejorVuelta, easedProgress),
        };
      });

      setDisplayedClassification(nextDisplay);

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      setDisplayedClassification(targetClassification);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targetClassification]);

  useEffect(() => {
    displayedClassificationRef.current = displayedClassification;
  }, [displayedClassification]);

  useEffect(() => {
    if (!openSanctionPilotId) {
      return;
    }

    const hasSanctions = (sanctionsByPilot.get(openSanctionPilotId)?.length ?? 0) > 0;

    if (!hasSanctions) {
      setOpenSanctionPilotId(null);
    }
  }, [openSanctionPilotId, sanctionsByPilot]);

  const leaderBestLap = displayedClassification[0]?.mejorVuelta ?? null;
  const previousPositionsRef = useRef<Map<string, number>>(new Map());

  const movementByPilot = useMemo(() => {
    const movement = new Map<string, number>();

    targetClassification.forEach((entry, index) => {
      const currentPos = index + 1;
      const previousPos = previousPositionsRef.current.get(entry.pilotoId);

      if (!previousPos) {
        movement.set(entry.pilotoId, 0);
        return;
      }

      movement.set(entry.pilotoId, previousPos - currentPos);
    });

    return movement;
  }, [targetClassification]);

  const improvedLapByPilot = useMemo(() => {
    const result = new Map<string, boolean>();

    targetClassification.forEach((entry) => {
      const previous = previousValuesRef.current.get(entry.pilotoId);

      if (!previous) {
        result.set(entry.pilotoId, false);
        return;
      }

      result.set(entry.pilotoId, entry.mejorVuelta < previous.mejorVuelta);
    });

    return result;
  }, [targetClassification]);

  useEffect(() => {
    const snapshot = new Map<string, number>();

    targetClassification.forEach((entry, index) => {
      snapshot.set(entry.pilotoId, index + 1);
    });

    previousPositionsRef.current = snapshot;
  }, [targetClassification]);

  useEffect(() => {
    const snapshot = new Map<string, { mejorVuelta: number; ultimaVuelta: number }>();

    targetClassification.forEach((entry) => {
      snapshot.set(entry.pilotoId, {
        mejorVuelta: entry.mejorVuelta,
        ultimaVuelta: entry.ultimaVuelta,
      });
    });

    previousValuesRef.current = snapshot;
  }, [targetClassification]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-white/60">
        Clasificación {selectedLap === null ? "LIVE" : `Vuelta ${Math.floor(selectedLap)}`}
      </p>

      {targetClassification.length === 0 ? (
        <div className="mt-3 text-sm text-white/45">Todavía no hay vueltas registradas.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2.5 text-left text-sm text-white/85">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                <th className="px-3 py-2.5">Pos</th>
                <th className="px-3 py-2.5">Piloto</th>
                <th className="px-3 py-2.5">Kart</th>
                <th className="px-3 py-2.5">Última vuelta</th>
                <th className="px-3 py-2.5">Mejor vuelta</th>
                <th className="px-3 py-2.5">Gap</th>
              </tr>
            </thead>
            <tbody>
              {displayedClassification.map((entry, index) => {
                const isSelected = selectedDriverId === entry.pilotoId;
                const gap = leaderBestLap === null ? 0 : entry.mejorVuelta - leaderBestLap;
                const movement = movementByPilot.get(entry.pilotoId) ?? 0;
                const improvedLap = improvedLapByPilot.get(entry.pilotoId) ?? false;
                const droppedPosition = movement < 0;

                return (
                  <motion.tr
                    key={entry.pilotoId}
                    layout
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    animate={
                      improvedLap
                        ? { backgroundColor: ["rgba(0,0,0,0.30)", "rgba(16,185,129,0.20)", "rgba(0,0,0,0.30)"] }
                        : droppedPosition
                          ? { backgroundColor: ["rgba(0,0,0,0.30)", "rgba(239,68,68,0.16)", "rgba(0,0,0,0.30)"] }
                          : { backgroundColor: "rgba(0,0,0,0.30)" }
                    }
                    className={`rounded-xl border ${
                      isSelected
                        ? "border-amber-300/40 bg-amber-500/10"
                        : "border-white/10 bg-black/30"
                    }`}
                  >
                    <td className="rounded-l-xl px-3 py-3.5 text-base font-semibold text-amber-100">
                      <div className="flex items-center gap-2">
                        <span>P{index + 1}</span>
                        {movement > 0 ? <span className="text-emerald-300">↑{movement}</span> : null}
                        {movement < 0 ? <span className="text-red-300">↓{Math.abs(movement)}</span> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectDriver(entry.pilotoId)}
                            className="inline-flex items-center gap-2 truncate text-base font-semibold text-white underline-offset-2 transition hover:text-amber-100 hover:underline"
                          >
                            {entry.pilotoNombre}
                          </button>
                          {entry.hasSanction ? (
                            <button
                              type="button"
                              onClick={() => setOpenSanctionPilotId((current) => (current === entry.pilotoId ? null : entry.pilotoId))}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-amber-300/35 bg-gradient-to-b from-amber-400/25 to-amber-600/20 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.08)] transition hover:border-amber-200/60 hover:from-amber-300/35 hover:to-amber-500/30"
                              aria-label="Ver motivos de sanción"
                              title="Ver motivos de sanción"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                                <path
                                  d="M12 4.2 21 19.8a1.2 1.2 0 0 1-1.04 1.8H4.04A1.2 1.2 0 0 1 3 19.8L12 4.2Z"
                                  fill="currentColor"
                                />
                                <rect x="11" y="9" width="2" height="6" rx="1" fill="rgba(17,24,39,0.9)" />
                                <circle cx="12" cy="17.3" r="1" fill="rgba(17,24,39,0.9)" />
                              </svg>
                            </button>
                          ) : null}
                        </div>

                        {openSanctionPilotId === entry.pilotoId ? (
                          <div className="max-w-[430px] rounded-xl border border-amber-300/35 bg-black/75 p-3 text-sm text-amber-100">
                            {(sanctionsByPilot.get(entry.pilotoId) ?? []).map((sanction) => (
                              <div key={sanction.id} className="mb-1.5 leading-relaxed last:mb-0">
                                <span className="font-semibold">
                                  {sanction.tipo === "time_penalty" ? `+${sanction.valor.toFixed(1)}s` : "Vuelta eliminada"}
                                </span>
                                <span className="ml-1.5 text-amber-50/95">· {sanction.motivo}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-[15px]">K{entry.kart}</td>
                    <td className="px-3 py-3.5 text-[15px]">{formatLapTime(entry.ultimaVuelta)}</td>
                    <td
                      className={`px-3 py-3.5 text-[15px] font-semibold ${
                        entry.isBestOverall
                          ? "text-emerald-300 [text-shadow:0_0_12px_rgba(16,185,129,0.7)]"
                          : "text-white/85"
                      }`}
                    >
                      {formatLapTime(entry.mejorVuelta)}
                      {entry.timePenaltySeconds > 0 ? (
                        <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-300/90">
                          +{entry.timePenaltySeconds.toFixed(1)}s
                        </span>
                      ) : null}
                    </td>
                    <td className="rounded-r-xl px-3 py-3.5 text-[15px] text-white/65">{formatGap(gap)}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
