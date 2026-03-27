"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { DriverLapsDetail } from "@/components/rkt-panel/driver-laps-detail";
import { LiveTimingReplayControls } from "@/components/rkt-panel/live-timing-replay-controls";
import { LiveTimingTable } from "@/components/rkt-panel/live-timing-table";
import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { useDriverStore } from "@/components/rkt-panel/use-driver-store";
import { generateTrainingResultsPdf } from "@/lib/training-results-pdf";
import {
  type DriverRecord,
  type LiveClassificationEntry,
  type TrainingLapRecord,
  type TrainingSanctionRecord,
  type TrainingSanctionType,
  type TrainingSessionRecord,
} from "@/lib/rkt-panel";

function DriverPhoto({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill unoptimized className="pointer-events-none object-contain p-2" />;
}

type LapsApiSuccess = {
  laps: TrainingLapRecord[];
  classification: LiveClassificationEntry[];
  availableLaps: number[];
  sanctions: TrainingSanctionRecord[];
  sanctionsImpact: {
    deletedLapNumbersByPilot: Record<string, number[]>;
    penalizedLapNumbersByPilot: Record<string, number[]>;
    timePenaltySecondsByPilot: Record<string, number>;
  };
};

type LapsApiError = { error?: string };

export default function RktPanelTrainingSessionDetailPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const { drivers, loaded } = useDriverStore();
  const [session, setSession] = useState<TrainingSessionRecord | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingPilotId, setSavingPilotId] = useState<string | null>(null);
  const [laps, setLaps] = useState<TrainingLapRecord[]>([]);
  const [classification, setClassification] = useState<LiveClassificationEntry[]>([]);
  const [lapPilotId, setLapPilotId] = useState("");
  const [lapKart, setLapKart] = useState("1");
  const [lapTime, setLapTime] = useState("");
  const [lapMessage, setLapMessage] = useState<string | null>(null);
  const [savingLap, setSavingLap] = useState(false);
  const [addingMockLap, setAddingMockLap] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [updatingLapId, setUpdatingLapId] = useState<string | null>(null);
  const [deletingLapId, setDeletingLapId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  const [availableLaps, setAvailableLaps] = useState<number[]>([]);
  const [sanctions, setSanctions] = useState<TrainingSanctionRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLap, setCurrentLap] = useState(1);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const scrubAnimationFrameRef = useRef<number | null>(null);
  const [sanctionPilotId, setSanctionPilotId] = useState("");
  const [sanctionType, setSanctionType] = useState<TrainingSanctionType>("time_penalty");
  const [sanctionValue, setSanctionValue] = useState("2");
  const [sanctionReason, setSanctionReason] = useState("");
  const [sanctionLapSelection, setSanctionLapSelection] = useState<number[]>([]);
  const [savingSanction, setSavingSanction] = useState(false);

  const applyLiveTiming = useCallback((
    nextLaps: TrainingLapRecord[],
    nextClassification: LiveClassificationEntry[],
    nextAvailableLaps?: number[],
    nextSanctions?: TrainingSanctionRecord[],
  ) => {
    setLaps(nextLaps);
    setClassification(nextClassification);
    if (nextAvailableLaps) {
      setAvailableLaps(nextAvailableLaps);
    }
    if (nextSanctions) {
      setSanctions(nextSanctions);
    }
    setSession((previousSession) => {
      if (!previousSession) {
        return previousSession;
      }

      return {
        ...previousSession,
        laps: nextLaps,
        sanctions: nextSanctions ?? previousSession.sanctions,
      };
    });
  }, []);

  const fetchClassificationForLap = useCallback(async (trainingId: string, replayLap: number | null) => {
    const search = replayLap === null ? "" : `?lapNumber=${replayLap}`;
    const response = await fetch(`/api/training-sessions/${trainingId}/laps${search}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as LapsApiSuccess | LapsApiError;

    if (!response.ok || !("laps" in data) || !("classification" in data) || !("availableLaps" in data) || !("sanctions" in data)) {
      throw new Error(
        typeof data === "object" && "error" in data
          ? data.error ?? "No se ha podido cargar el live timing."
          : "No se ha podido cargar el live timing.",
      );
    }

    applyLiveTiming(data.laps, data.classification, data.availableLaps, data.sanctions);
  }, [applyLiveTiming]);

  useEffect(() => {
    async function loadSession() {
      try {
        setLoadingSession(true);
        setLoadError(null);
        setSelectedLap(null);
        setAvailableLaps([]);
        setSanctions([]);
        setIsPlaying(false);
        setCurrentLap(1);
        setReplaySpeed(1);
        setIsDragging(false);
        const response = await fetch(`/api/training-sessions/${sessionId}`, { cache: "no-store" });
        const data = (await response.json()) as TrainingSessionRecord | { error?: string };

        if (!response.ok || !("id" in data)) {
          setLoadError(typeof data === "object" && "error" in data ? data.error ?? "No se ha podido cargar la sesión." : "No se ha podido cargar la sesión.");
          setSession(null);
          return;
        }

        setSession(data);
        setLaps(data.laps);
        setSanctions(data.sanctions ?? []);

        if (data.pilots.length > 0) {
          setLapPilotId((currentPilotId) => currentPilotId || data.pilots[0].id);
          setSanctionPilotId((currentPilotId) => currentPilotId || data.pilots[0].id);
        }
      } catch {
        setLoadError("No se ha podido cargar la sesión.");
        setSession(null);
      } finally {
        setLoadingSession(false);
      }
    }

    void loadSession();
  }, [fetchClassificationForLap, sessionId]);

  useEffect(() => {
    if (!selectedDriverId) {
      return;
    }

    const existsInTable = classification.some((entry) => entry.pilotoId === selectedDriverId);

    if (!existsInTable) {
      setSelectedDriverId(null);
    }
  }, [classification, selectedDriverId]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const exists = session.pilots.some((pilot) => pilot.id === sanctionPilotId);

    if (!exists) {
      setSanctionPilotId(session.pilots[0]?.id ?? "");
      setSanctionLapSelection([]);
    }
  }, [sanctionPilotId, session]);

  const maxAvailableLap = availableLaps[availableLaps.length - 1] ?? 0;

  useEffect(() => {
    if (selectedLap === null) {
      if (maxAvailableLap > 0) {
        setCurrentLap(maxAvailableLap);
      }
      return;
    }

    setCurrentLap(selectedLap);
  }, [maxAvailableLap, selectedLap]);

  const replayLapForClassification = useMemo(() => {
    if (selectedLap === null) {
      return null;
    }

    const flooredLap = Math.floor(selectedLap);
    return Math.max(1, Math.min(maxAvailableLap || flooredLap, flooredLap));
  }, [maxAvailableLap, selectedLap]);

  useEffect(() => {
    const trainingId = session?.id;

    if (!trainingId) {
      return;
    }

    const safeTrainingId: string = trainingId;

    async function refreshReplay() {
      try {
        await fetchClassificationForLap(safeTrainingId, replayLapForClassification);
      } catch {
        setLapMessage("No se ha podido actualizar el replay.");
      }
    }

    void refreshReplay();
  }, [fetchClassificationForLap, replayLapForClassification, session?.id]);

  useEffect(() => {
    if (!isPlaying || maxAvailableLap < 1 || isDragging) {
      return;
    }

    const baseIntervalMs = 2000;
    const intervalMs = Math.max(900, Math.round(baseIntervalMs / replaySpeed));
    const interval = setInterval(() => {
      setCurrentLap((previousLap) => {
        const baseLap = Math.max(1, previousLap || 1);

        if (baseLap >= maxAvailableLap) {
          setIsPlaying(false);
          return maxAvailableLap;
        }

        const nextLap = baseLap + 1;
        setSelectedLap(nextLap);

        if (nextLap >= maxAvailableLap) {
          setIsPlaying(false);
        }

        return nextLap;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isDragging, isPlaying, maxAvailableLap, replaySpeed]);

  function handleReplayLapChange(nextLap: number) {
    setIsPlaying(false);
    if (scrubAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrubAnimationFrameRef.current);
    }

    scrubAnimationFrameRef.current = requestAnimationFrame(() => {
      setCurrentLap(nextLap);
      setSelectedLap(nextLap);
    });
  }

  function handleScrubStart() {
    setIsPlaying(false);
    setIsDragging(true);
  }

  function handleScrubEnd() {
    setIsDragging(false);
  }

  function handleTogglePlay() {
    if (maxAvailableLap < 1) {
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const startLap = selectedLap === null || selectedLap >= maxAvailableLap ? 1 : Math.floor(selectedLap);
    setCurrentLap(startLap);
    setSelectedLap(startLap);
    setIsPlaying(true);
  }

  function handleGoLive() {
    setIsPlaying(false);
    setIsDragging(false);
    setSelectedLap(null);
  }

  useEffect(() => {
    return () => {
      if (scrubAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scrubAnimationFrameRef.current);
      }
    };
  }, []);

  const assignedPilotIds = useMemo(
    () => new Set(session?.pilots.map((pilot) => pilot.id) ?? []),
    [session?.pilots],
  );

  const availablePilots = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return drivers
      .filter((pilot) => pilot.status === "CONFIRMED")
      .filter((pilot) => !assignedPilotIds.has(pilot.id))
      .filter((pilot) => pilot.name.toLowerCase().includes(normalized));
  }, [assignedPilotIds, drivers, query]);

  const isComplete = !!session && session.pilots.length >= session.maxPilots;

  const sanctionPilotLaps = useMemo(() => {
    if (!sanctionPilotId) {
      return [];
    }

    const unique = new Set<number>();
    laps
      .filter((lap) => lap.pilotoId === sanctionPilotId)
      .forEach((lap) => unique.add(lap.lapNumber));

    return Array.from(unique).sort((first, second) => first - second);
  }, [laps, sanctionPilotId]);

  function toggleSanctionLap(lapNumber: number) {
    setSanctionLapSelection((previous) => {
      if (previous.includes(lapNumber)) {
        return previous.filter((value) => value !== lapNumber);
      }

      return [...previous, lapNumber].sort((first, second) => first - second);
    });
  }

  function selectLatestSanctionLap() {
    const latestLap = sanctionPilotLaps[sanctionPilotLaps.length - 1];

    if (!latestLap) {
      return;
    }

    setSanctionLapSelection([latestLap]);
  }

  async function applySanction() {
    if (!session || !sanctionPilotId) {
      return;
    }

    const trimmedReason = sanctionReason.trim();
    const normalizedLaps = sanctionLapSelection.filter((value) => Number.isFinite(value) && value >= 1);

    if (!trimmedReason) {
      setLapMessage("Añade un motivo para la sanción.");
      return;
    }

    if (sanctionType === "lap_deleted" && normalizedLaps.length === 0) {
      setLapMessage("Selecciona al menos una vuelta para eliminar.");
      return;
    }

    const numericPenalty = Number(sanctionValue);

    if (sanctionType === "time_penalty" && (!Number.isFinite(numericPenalty) || numericPenalty <= 0)) {
      setLapMessage("Introduce segundos válidos para la penalización.");
      return;
    }

    try {
      setSavingSanction(true);

      const response = await fetch(`/api/training-sessions/${session.id}/sanctions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotoId: sanctionPilotId,
          tipo: sanctionType,
          valor: sanctionType === "time_penalty" ? numericPenalty : 0,
          vueltas: normalizedLaps,
          motivo: trimmedReason,
        }),
      });

      const data = (await response.json()) as
        | (LapsApiSuccess & { error?: string })
        | LapsApiError;

      if (!response.ok || !("laps" in data) || !("classification" in data) || !("availableLaps" in data) || !("sanctions" in data)) {
        setLapMessage(
          typeof data === "object" && "error" in data
            ? data.error ?? "No se ha podido aplicar la sanción."
            : "No se ha podido aplicar la sanción.",
        );
        return;
      }

      applyLiveTiming(data.laps, data.classification, data.availableLaps, data.sanctions);

      if (selectedLap !== null) {
        await fetchClassificationForLap(session.id, replayLapForClassification);
      }

      setSanctionReason("");
      setSanctionLapSelection([]);
      setLapMessage(null);
    } catch {
      setLapMessage("No se ha podido aplicar la sanción.");
    } finally {
      setSavingSanction(false);
    }
  }

  async function addPilot(pilotId: string) {
    if (!session || isComplete) {
      if (isComplete) {
        setMessage("Sesión completa.");
      }
      return;
    }

    const pilotToAdd = drivers.find((pilot) => pilot.id === pilotId);

    if (!pilotToAdd) {
      return;
    }

    setSavingPilotId(pilotId);
    const previousSession = session;
    setSession({ ...session, pilots: [...session.pilots, pilotToAdd] });

    try {
      const response = await fetch(`/api/training-sessions/${session.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pilotId }),
      });

      const data = (await response.json()) as TrainingSessionRecord | { error?: string };

      if (!response.ok) {
        setSession(previousSession);
        setMessage(typeof data === "object" && "error" in data ? data.error ?? "No se ha podido asignar." : "No se ha podido asignar.");
        return;
      }

      const updatedSession = data as TrainingSessionRecord;
      setSession(updatedSession);

      if (!sanctionPilotId) {
        setSanctionPilotId(updatedSession.pilots[0]?.id ?? "");
      }
      setMessage(null);
    } catch {
      setSession(previousSession);
      setMessage("No se ha podido asignar.");
    } finally {
      setSavingPilotId(null);
    }
  }

  async function removePilot(pilotId: string) {
    if (!session) {
      return;
    }

    const response = await fetch(`/api/training-sessions/${session.id}/assignments/${pilotId}`, {
      method: "DELETE",
    });

    const data = (await response.json()) as TrainingSessionRecord | { error?: string };

    if (!response.ok) {
      setMessage(typeof data === "object" && "error" in data ? data.error ?? "No se ha podido eliminar." : "No se ha podido eliminar.");
      return;
    }

    const updatedSession = data as TrainingSessionRecord;
    setSession(updatedSession);

    if (lapPilotId === pilotId) {
      setLapPilotId(updatedSession.pilots[0]?.id ?? "");
    }

    if (selectedDriverId === pilotId) {
      setSelectedDriverId(null);
    }

    if (sanctionPilotId === pilotId) {
      setSanctionPilotId(updatedSession.pilots[0]?.id ?? "");
    }

    setMessage(null);
  }

  async function saveLap() {
    if (!session || !lapPilotId) {
      return;
    }

    const selectedPilot = session.pilots.find((pilot) => pilot.id === lapPilotId);

    if (!selectedPilot) {
      setLapMessage("Selecciona un piloto asignado.");
      return;
    }

    const numericLapTime = Number(lapTime);

    if (!Number.isFinite(numericLapTime) || numericLapTime <= 0) {
      setLapMessage("Introduce un tiempo válido en segundos.");
      return;
    }

    try {
      setSavingLap(true);
      const response = await fetch(`/api/training-sessions/${session.id}/laps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotoId: selectedPilot.id,
          pilotoNombre: selectedPilot.name,
          kart: lapKart,
          tiempo: numericLapTime,
        }),
      });

      const data = (await response.json()) as
        | (LapsApiSuccess & { error?: string })
        | LapsApiError;

      if (!response.ok || !("laps" in data) || !("classification" in data) || !("availableLaps" in data) || !("sanctions" in data)) {
        setLapMessage(
          typeof data === "object" && "error" in data
            ? data.error ?? "No se ha podido guardar la vuelta."
            : "No se ha podido guardar la vuelta.",
        );
        return;
      }

      applyLiveTiming(data.laps, data.classification, data.availableLaps, data.sanctions);

      if (selectedLap !== null) {
        await fetchClassificationForLap(session.id, selectedLap);
      }

      setLapTime("");
      setLapMessage(null);
    } catch {
      setLapMessage("No se ha podido guardar la vuelta.");
    } finally {
      setSavingLap(false);
    }
  }

  async function saveMockLap() {
    if (!session) {
      return;
    }

    try {
      setAddingMockLap(true);
      const response = await fetch(`/api/training-sessions/${session.id}/laps/mock`, {
        method: "POST",
      });

      const data = (await response.json()) as
        | (LapsApiSuccess & { error?: string })
        | LapsApiError;

      if (!response.ok || !("laps" in data) || !("classification" in data) || !("availableLaps" in data) || !("sanctions" in data)) {
        setLapMessage(
          typeof data === "object" && "error" in data
            ? data.error ?? "No se ha podido simular la vuelta."
            : "No se ha podido simular la vuelta.",
        );
        return;
      }

      applyLiveTiming(data.laps, data.classification, data.availableLaps, data.sanctions);

      if (selectedLap !== null) {
        await fetchClassificationForLap(session.id, selectedLap);
      }

      setLapMessage(null);
    } catch {
      setLapMessage("No se ha podido simular la vuelta.");
    } finally {
      setAddingMockLap(false);
    }
  }

  async function handleUpdateLap(
    lapId: string,
    payload: { tiempo: number; kart: string },
  ) {
    if (!session) {
      return;
    }

    try {
      setUpdatingLapId(lapId);

      const response = await fetch(`/api/training-sessions/${session.id}/laps/${lapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as
        | (LapsApiSuccess & { error?: string })
        | LapsApiError;

      if (!response.ok || !("laps" in data) || !("classification" in data) || !("availableLaps" in data) || !("sanctions" in data)) {
        setLapMessage(
          typeof data === "object" && "error" in data
            ? data.error ?? "No se ha podido actualizar la vuelta."
            : "No se ha podido actualizar la vuelta.",
        );
        return;
      }

      applyLiveTiming(data.laps, data.classification, data.availableLaps, data.sanctions);

      if (selectedLap !== null) {
        await fetchClassificationForLap(session.id, replayLapForClassification);
      }

      setLapMessage(null);
    } catch {
      setLapMessage("No se ha podido actualizar la vuelta.");
    } finally {
      setUpdatingLapId(null);
    }
  }

  async function handleDeleteLap(lapId: string) {
    if (!session) {
      return;
    }

    try {
      setDeletingLapId(lapId);

      const response = await fetch(`/api/training-sessions/${session.id}/laps/${lapId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as
        | (LapsApiSuccess & { error?: string })
        | LapsApiError;

      if (!response.ok || !("laps" in data) || !("classification" in data) || !("availableLaps" in data) || !("sanctions" in data)) {
        setLapMessage(
          typeof data === "object" && "error" in data
            ? data.error ?? "No se ha podido eliminar la vuelta."
            : "No se ha podido eliminar la vuelta.",
        );
        return;
      }

      applyLiveTiming(data.laps, data.classification, data.availableLaps, data.sanctions);

      if (selectedLap !== null) {
        await fetchClassificationForLap(session.id, replayLapForClassification);
      }

      setLapMessage(null);
    } catch {
      setLapMessage("No se ha podido eliminar la vuelta.");
    } finally {
      setDeletingLapId(null);
    }
  }

  async function exportOfficialPdf() {
    if (!session) {
      return;
    }

    try {
      setExportingPdf(true);

      const response = await fetch(`/api/training-sessions/${session.id}/laps`, {
        cache: "no-store",
      });

      const data = (await response.json()) as LapsApiSuccess | LapsApiError;

      if (!response.ok || !("classification" in data) || !("sanctions" in data)) {
        setLapMessage(
          typeof data === "object" && "error" in data
            ? data.error ?? "No se ha podido generar el PDF."
            : "No se ha podido generar el PDF.",
        );
        return;
      }

      await generateTrainingResultsPdf({
        eventName: "Rental Karting Trophy",
        trainingName: session.name,
        generatedAt: new Date(),
        classification: data.classification,
        sanctions: data.sanctions,
      });

      setLapMessage(null);
    } catch {
      setLapMessage("No se ha podido generar el PDF.");
    } finally {
      setExportingPdf(false);
    }
  }

  if (loadingSession) {
    return (
      <PanelShell heading="Entrenamientos" kicker="Gestión de sesiones">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-white/60">Cargando sesión...</div>
      </PanelShell>
    );
  }

  if (!session) {
    return (
      <PanelShell heading="Entrenamientos" kicker="Gestión de sesiones">
        <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-8 text-red-200">{loadError ?? "No se ha encontrado la sesión."}</div>
      </PanelShell>
    );
  }

  const emptySlots = Math.max(0, session.maxPilots - session.pilots.length);

  return (
    <PanelShell heading={session.name} kicker="Detalle de sesión">
      <div className="mb-6 rounded-[24px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 uppercase tracking-[0.14em] text-amber-100">{session.time}</span>
          <span>Duración: {session.duration} min</span>
          <span>
            Pilotos: {session.pilots.length} / {session.maxPilots}
          </span>
          {isComplete ? <span className="text-red-300">Sesión completa.</span> : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300/70">Pilotos asignados</p>
          <div className="mt-4 space-y-3">
            {session.pilots.map((pilot) => (
              <div
                key={pilot.id}
                className="group flex items-center justify-between rounded-2xl border border-amber-500/20 bg-gradient-to-r from-black/45 via-black/35 to-amber-500/5 px-4 py-3 transition hover:border-amber-400/35"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-amber-500/15 bg-black/40">
                    <DriverPhoto src={pilot.photo} alt={pilot.name} />
                  </div>
                  <span className="text-sm font-semibold text-amber-50/95 transition group-hover:text-amber-100">{pilot.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void removePilot(pilot.id);
                  }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-200 transition hover:border-red-400/55 hover:bg-red-500/20"
                >
                  Eliminar
                </button>
              </div>
            ))}

            {Array.from({ length: emptySlots }).map((_, index) => (
              <div key={`empty-${index}`} className="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-4 text-sm text-white/35">
                Slot vacío
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300/70">Añadir pilotos</p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar piloto..."
            className="mt-4 w-full rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/45"
          />

          {message ? (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.14em] text-red-200">
              {message}
            </div>
          ) : null}

          <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
            {!loaded ? (
              <div className="text-sm text-white/45">Cargando pilotos...</div>
            ) : availablePilots.length === 0 ? (
              <div className="text-sm text-white/45">No hay pilotos disponibles.</div>
            ) : (
              availablePilots.map((pilot: DriverRecord) => (
                <button
                  key={pilot.id}
                  type="button"
                  onClick={() => {
                    void addPilot(pilot.id);
                  }}
                  disabled={isComplete || savingPilotId === pilot.id}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-black/35 via-black/30 to-white/[0.02] px-3 py-2.5 text-left transition hover:border-amber-300/35 hover:from-black/45 hover:to-amber-500/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-amber-500/15 bg-black/40">
                    <DriverPhoto src={pilot.photo} alt={pilot.name} />
                  </div>
                  <span className="text-sm font-medium text-white/90 transition group-hover:text-amber-100">{pilot.name}</span>
                </button>
              ))
            )}
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.08 }}
        className="mt-6 rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.34em] text-amber-300/70">Live timing</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void exportOfficialPdf();
              }}
              disabled={exportingPdf || classification.length === 0}
              className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {exportingPdf ? "Exportando..." : "Exportar PDF"}
            </button>
            <button
              type="button"
              onClick={() => {
                void saveMockLap();
              }}
              disabled={addingMockLap || session.pilots.length === 0}
              className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {addingMockLap ? "Simulando..." : "Añadir vuelta aleatoria"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_140px_auto]">
          <div className="relative">
            <select
              value={lapPilotId}
              onChange={(event) => setLapPilotId(event.target.value)}
              disabled={session.pilots.length === 0}
              className="w-full appearance-none rounded-2xl border border-amber-500/20 bg-black/40 px-4 py-3.5 pr-10 text-base font-medium text-amber-50 outline-none transition focus:border-amber-300/55 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {session.pilots.length === 0 ? (
                <option value="">Sin pilotos asignados</option>
              ) : (
                session.pilots.map((pilot) => (
                  <option key={pilot.id} value={pilot.id}>
                    {pilot.name}
                  </option>
                ))
              )}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-base text-amber-200/80">▾</span>
          </div>

          <input
            value={lapKart}
            onChange={(event) => setLapKart(event.target.value)}
            placeholder="Kart"
            className="rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3.5 text-base text-white outline-none placeholder:text-white/25 focus:border-amber-400/45"
          />

          <input
            value={lapTime}
            onChange={(event) => setLapTime(event.target.value)}
            type="number"
            min="0"
            step="0.001"
            placeholder="Tiempo (s)"
            className="rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3.5 text-base text-white outline-none placeholder:text-white/25 focus:border-amber-400/45"
          />

          <button
            type="button"
            onClick={() => {
              void saveLap();
            }}
            disabled={savingLap || session.pilots.length === 0}
            className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {savingLap ? "Guardando..." : "Añadir vuelta"}
          </button>
        </div>

        {lapMessage ? (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.14em] text-red-200">
            {lapMessage}
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Sanciones</p>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px_140px]">
            <div className="relative">
              <select
                value={sanctionPilotId}
                onChange={(event) => {
                  setSanctionPilotId(event.target.value);
                  setSanctionLapSelection([]);
                }}
                disabled={session.pilots.length === 0}
                className="w-full appearance-none rounded-xl border border-amber-500/20 bg-black/40 px-3 py-2.5 pr-8 text-sm font-medium text-amber-50 outline-none transition focus:border-amber-300/55 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {session.pilots.length === 0 ? (
                  <option value="">Sin pilotos</option>
                ) : (
                  session.pilots.map((pilot) => (
                    <option key={pilot.id} value={pilot.id}>
                      {pilot.name}
                    </option>
                  ))
                )}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-amber-200/80">▾</span>
            </div>

            <div className="relative">
              <select
                value={sanctionType}
                onChange={(event) => setSanctionType(event.target.value as TrainingSanctionType)}
                className="w-full appearance-none rounded-xl border border-amber-500/20 bg-black/40 px-3 py-2.5 pr-8 text-sm font-medium text-amber-50 outline-none transition focus:border-amber-300/55"
              >
                <option value="time_penalty">+Segundos</option>
                <option value="lap_deleted">Eliminar vuelta(s)</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-amber-200/80">▾</span>
            </div>

            <input
              value={sanctionValue}
              onChange={(event) => setSanctionValue(event.target.value)}
              type="number"
              min="0"
              step="0.1"
              placeholder="Segundos"
              disabled={sanctionType !== "time_penalty"}
              className="rounded-xl border border-amber-500/15 bg-black/35 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/45 disabled:opacity-40"
            />
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-[0.14em] text-white/55">Vueltas afectadas</span>
              <button
                type="button"
                onClick={selectLatestSanctionLap}
                disabled={sanctionPilotLaps.length === 0}
                className="rounded-lg border border-white/15 bg-black/35 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/75 transition hover:border-amber-300/35 hover:text-amber-100 disabled:opacity-40"
              >
                Última vuelta
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {sanctionPilotLaps.length === 0 ? (
                <span className="text-sm text-white/45">Este piloto no tiene vueltas registradas.</span>
              ) : (
                sanctionPilotLaps.map((lapNumber) => {
                  const selected = sanctionLapSelection.includes(lapNumber);
                  return (
                    <button
                      key={`sanction-lap-${lapNumber}`}
                      type="button"
                      onClick={() => toggleSanctionLap(lapNumber)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        selected
                          ? "border-amber-300/55 bg-amber-500/20 text-amber-50"
                          : "border-white/12 bg-black/35 text-white/75 hover:border-amber-300/35 hover:text-amber-100"
                      }`}
                    >
                      V{lapNumber}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={sanctionReason}
              onChange={(event) => setSanctionReason(event.target.value)}
              placeholder="Motivo de la sanción"
              className="rounded-xl border border-amber-500/15 bg-black/35 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/45"
            />
            <button
              type="button"
              onClick={() => {
                void applySanction();
              }}
              disabled={savingSanction || !sanctionPilotId}
              className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingSanction ? "Aplicando..." : "Aplicar sanción"}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <LiveTimingReplayControls
            availableLaps={availableLaps}
            selectedLap={selectedLap}
            currentLap={currentLap}
            isPlaying={isPlaying}
            replaySpeed={replaySpeed}
            isDragging={isDragging}
            onChangeLap={handleReplayLapChange}
            onScrubStart={handleScrubStart}
            onScrubEnd={handleScrubEnd}
            onChangeSpeed={setReplaySpeed}
            onTogglePlay={handleTogglePlay}
            onGoLive={handleGoLive}
          />

          <LiveTimingTable
            classification={classification}
            sanctions={sanctions}
            selectedDriverId={selectedDriverId}
            selectedLap={selectedLap}
            onSelectDriver={setSelectedDriverId}
          />
          <DriverLapsDetail
            selectedDriverId={selectedDriverId}
            laps={laps}
            classification={classification}
            sanctions={sanctions}
            updatingLapId={updatingLapId}
            deletingLapId={deletingLapId}
            onUpdateLap={handleUpdateLap}
            onDeleteLap={handleDeleteLap}
          />
        </div>
      </motion.section>
    </PanelShell>
  );
}
