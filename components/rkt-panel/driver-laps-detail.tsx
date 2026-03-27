"use client";

import { useEffect, useMemo, useState } from "react";

import {
  type LiveClassificationEntry,
  type TrainingLapRecord,
  type TrainingSanctionRecord,
} from "@/lib/rkt-panel";

interface DriverLapsDetailProps {
  selectedDriverId: string | null;
  laps: TrainingLapRecord[];
  classification: LiveClassificationEntry[];
  sanctions: TrainingSanctionRecord[];
  updatingLapId: string | null;
  deletingLapId: string | null;
  onUpdateLap: (lapId: string, payload: { tiempo: number; kart: string }) => Promise<void>;
  onDeleteLap: (lapId: string) => Promise<void>;
}

function formatLapTime(value: number) {
  return `${value.toFixed(3)}s`;
}

function normalizeLapNumbers(values: number[]) {
  const normalized = values
    .filter((value) => Number.isFinite(value) && value >= 1)
    .map((value) => Math.floor(value));

  return Array.from(new Set(normalized)).sort((first, second) => first - second);
}

function resolveSanctionLapNumbers(lapNumbers: number[], sanctionLapNumbers: number[]) {
  const normalized = normalizeLapNumbers(sanctionLapNumbers);

  if (normalized.length > 0) {
    return normalized;
  }

  const latest = lapNumbers[lapNumbers.length - 1];
  return typeof latest === "number" ? [latest] : [];
}

export function DriverLapsDetail({
  selectedDriverId,
  laps,
  classification,
  sanctions,
  updatingLapId,
  deletingLapId,
  onUpdateLap,
  onDeleteLap,
}: DriverLapsDetailProps) {
  const [editingLapId, setEditingLapId] = useState<string | null>(null);
  const [editTiempo, setEditTiempo] = useState("");
  const [editKart, setEditKart] = useState("");

  useEffect(() => {
    if (!selectedDriverId) {
      setEditingLapId(null);
      setEditTiempo("");
      setEditKart("");
    }
  }, [selectedDriverId]);
  const selectedDriverName = useMemo(() => {
    if (!selectedDriverId) {
      return null;
    }

    const inClassification = classification.find((entry) => entry.pilotoId === selectedDriverId);

    if (inClassification) {
      return inClassification.pilotoNombre;
    }

    const inLaps = laps.find((lap) => lap.pilotoId === selectedDriverId);
    return inLaps?.pilotoNombre ?? null;
  }, [classification, laps, selectedDriverId]);

  const driverLaps = useMemo(() => {
    if (!selectedDriverId) {
      return [];
    }

    return [...laps]
      .filter((lap) => lap.pilotoId === selectedDriverId)
      .sort((first, second) => first.lapNumber - second.lapNumber);
  }, [laps, selectedDriverId]);

  const sanctionInfoByLap = useMemo(() => {
    const map = new Map<number, {
      reasons: Array<{ id: string; tipo: "time_penalty" | "lap_deleted"; valor: number; motivo: string }>;
      penaltySeconds: number;
      deleted: boolean;
    }>();

    if (!selectedDriverId || driverLaps.length === 0) {
      return map;
    }

    const sortedLapNumbers = driverLaps.map((lap) => lap.lapNumber).sort((first, second) => first - second);
    const driverSanctions = sanctions
      .filter((sanction) => sanction.pilotoId === selectedDriverId)
      .sort((first, second) => first.createdAt - second.createdAt);

    driverSanctions.forEach((sanction) => {
      const affectedLapNumbers = resolveSanctionLapNumbers(sortedLapNumbers, sanction.vueltas);

      affectedLapNumbers.forEach((lapNumber) => {
        const current = map.get(lapNumber) ?? {
          reasons: [],
          penaltySeconds: 0,
          deleted: false,
        };

        current.reasons.push({
          id: sanction.id,
          tipo: sanction.tipo,
          valor: sanction.valor,
          motivo: sanction.motivo,
        });

        if (sanction.tipo === "time_penalty") {
          current.penaltySeconds += Math.max(0, sanction.valor);
        }

        if (sanction.tipo === "lap_deleted") {
          current.deleted = true;
        }

        map.set(lapNumber, current);
      });
    });

    return map;
  }, [driverLaps, sanctions, selectedDriverId]);

  const deletedLapNumbers = useMemo(() => {
    const set = new Set<number>();

    sanctionInfoByLap.forEach((info, lapNumber) => {
      if (info.deleted) {
        set.add(lapNumber);
      }
    });

    return set;
  }, [sanctionInfoByLap]);

  const penalizedLapNumbers = useMemo(() => {
    const set = new Set<number>();

    sanctionInfoByLap.forEach((info, lapNumber) => {
      if (info.penaltySeconds > 0) {
        set.add(lapNumber);
      }
    });

    return set;
  }, [sanctionInfoByLap]);

  const personalBestLapTime = useMemo(() => {
    const validLaps = driverLaps
      .map((lap) => {
        const lapInfo = sanctionInfoByLap.get(lap.lapNumber);

        if (lapInfo?.deleted) {
          return null;
        }

        const adjustedTime = lap.tiempo + (lapInfo?.penaltySeconds ?? 0);
        return adjustedTime;
      })
      .filter((value): value is number => value !== null);

    if (validLaps.length === 0) {
      return null;
    }

    return validLaps.reduce(
      (best, lapTime) => (lapTime < best ? lapTime : best),
      Number.POSITIVE_INFINITY,
    );
  }, [driverLaps, sanctionInfoByLap]);

  if (!selectedDriverId) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-white/60">Detalle del piloto</p>
      <p className="mt-2 text-base font-semibold text-amber-100">{selectedDriverName ?? "Piloto seleccionado"}</p>

      {driverLaps.length === 0 ? (
        <div className="mt-3 text-base text-white/45">Este piloto todavía no tiene vueltas registradas en la sesión.</div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {driverLaps.map((lap) => {
            const lapSanctionInfo = sanctionInfoByLap.get(lap.lapNumber);
            const isDeleted = deletedLapNumbers.has(lap.lapNumber);
            const isPenalized = penalizedLapNumbers.has(lap.lapNumber);
            const sanctionPenalty = lapSanctionInfo?.penaltySeconds ?? 0;
            const finalLapTime = lap.tiempo + sanctionPenalty;
            const comparableLapTime = isDeleted ? null : finalLapTime;
            const isPersonalBest = personalBestLapTime !== null && comparableLapTime !== null && comparableLapTime === personalBestLapTime;
            const isEditing = editingLapId === lap.id;
            const isUpdating = updatingLapId === lap.id;
            const isDeleting = deletingLapId === lap.id;
            const hasSanctionDetails = (lapSanctionInfo?.reasons.length ?? 0) > 0;

            return (
              <div
                key={lap.id}
                className={`rounded-xl border px-3.5 py-2.5 text-[15px] ${
                  isDeleted
                    ? "border-red-500/35 bg-red-500/10 text-red-200"
                    : isPersonalBest
                    ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                    : isPenalized
                      ? "border-amber-400/35 bg-amber-500/10 text-amber-100"
                    : "border-white/10 bg-black/30 text-white/85"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>Vuelta {lap.lapNumber}</span>
                    {!isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating || isDeleting}
                          onClick={() => {
                            setEditingLapId(lap.id);
                            setEditTiempo(String(lap.tiempo));
                            setEditKart(lap.kart);
                          }}
                          className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[11px] transition hover:border-amber-300/35 hover:text-amber-100 disabled:opacity-40"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating || isDeleting}
                          onClick={() => {
                            if (!window.confirm("¿Eliminar vuelta?")) {
                              return;
                            }

                            void onDeleteLap(lap.id);
                          }}
                          className="rounded-md border border-red-400/35 bg-red-500/10 px-2 py-1 text-[11px] text-red-200 transition hover:border-red-300/45 hover:bg-red-500/20 disabled:opacity-40"
                        >
                          🗑
                        </button>
                      </>
                    ) : null}
                  </div>

                  {isEditing ? null : (
                    <span className="font-semibold">
                      {isDeleted
                        ? "VUELTA ELIMINADA ❌"
                        : `${formatLapTime(finalLapTime)} ${isPenalized ? "⚠️" : isPersonalBest ? "🔥" : ""}`}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={editTiempo}
                      onChange={(event) => setEditTiempo(event.target.value)}
                      type="number"
                      min="0"
                      step="0.001"
                      className="w-[98px] rounded-md border border-white/20 bg-black/45 px-2 py-1 text-xs text-white outline-none focus:border-amber-300/45"
                    />
                    <input
                      value={editKart}
                      onChange={(event) => setEditKart(event.target.value)}
                      className="w-[70px] rounded-md border border-white/20 bg-black/45 px-2 py-1 text-xs text-white outline-none focus:border-amber-300/45"
                    />
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => {
                        const parsedTime = Number(editTiempo);

                        if (!Number.isFinite(parsedTime) || parsedTime <= 0) {
                          return;
                        }

                        void onUpdateLap(lap.id, {
                          tiempo: parsedTime,
                          kart: editKart,
                        }).then(() => {
                          setEditingLapId(null);
                          setEditTiempo("");
                          setEditKart("");
                        });
                      }}
                      className="rounded-md border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200 transition hover:border-emerald-300/45 hover:bg-emerald-500/20 disabled:opacity-40"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => {
                        setEditingLapId(null);
                        setEditTiempo("");
                        setEditKart("");
                      }}
                      className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[11px] text-white/80 transition hover:border-white/30 disabled:opacity-40"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : null}

                {hasSanctionDetails ? (
                  <div className="mt-2.5 rounded-xl border border-white/12 bg-black/35 p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-4 leading-relaxed">
                      <span className="text-white/85">Original: {formatLapTime(lap.tiempo)}</span>
                      <span className="font-semibold text-amber-200">
                        Sanción: {isDeleted ? "Vuelta eliminada" : `+${sanctionPenalty.toFixed(3)}s`}
                      </span>
                      <span className="font-medium text-white/95">
                        Final: {isDeleted ? "VUELTA ELIMINADA" : formatLapTime(finalLapTime)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {lapSanctionInfo?.reasons.map((reason) => (
                        <div key={reason.id} className="text-[13px] text-white/80">
                          • {reason.tipo === "time_penalty" ? `+${reason.valor.toFixed(1)}s` : "Vuelta eliminada"}: {reason.motivo}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
