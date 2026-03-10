"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { useDriverStore } from "@/components/rkt-panel/use-driver-store";
import { type DriverRecord, type TrainingSessionRecord } from "@/lib/rkt-panel";

function DriverPhoto({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill unoptimized className="pointer-events-none object-contain p-2" />;
}

export default function RktPanelTrainingSessionDetailPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const { drivers, loaded } = useDriverStore();
  const [session, setSession] = useState<TrainingSessionRecord | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        setLoadingSession(true);
        setLoadError(null);
        const response = await fetch(`/api/training-sessions/${sessionId}`, { cache: "no-store" });
        const data = (await response.json()) as TrainingSessionRecord | { error?: string };

        if (!response.ok || !("id" in data)) {
          setLoadError(typeof data === "object" && "error" in data ? data.error ?? "No se ha podido cargar la sesión." : "No se ha podido cargar la sesión.");
          setSession(null);
          return;
        }

        setSession(data);
      } finally {
        setLoadingSession(false);
      }
    }

    void loadSession();
  }, [sessionId]);

  const assignedPilotIds = useMemo(
    () => new Set(session?.pilots.map((pilot) => pilot.id) ?? []),
    [session?.pilots],
  );

  const availablePilots = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return drivers
      .filter((pilot) => pilot.status === "Activo")
      .filter((pilot) => !assignedPilotIds.has(pilot.id))
      .filter((pilot) => pilot.name.toLowerCase().includes(normalized));
  }, [assignedPilotIds, drivers, query]);

  const isComplete = !!session && session.pilots.length >= session.maxPilots;

  async function addPilot(pilotId: string) {
    if (!session || isComplete) {
      if (isComplete) {
        setMessage("Sesión completa.");
      }
      return;
    }

    const response = await fetch(`/api/training-sessions/${session.id}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pilotId }),
    });

    const data = (await response.json()) as TrainingSessionRecord | { error?: string };

    if (!response.ok) {
      setMessage(typeof data === "object" && "error" in data ? data.error ?? "No se ha podido asignar." : "No se ha podido asignar.");
      return;
    }

    setSession(data as TrainingSessionRecord);
    setMessage(null);
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

    setSession(data as TrainingSessionRecord);
    setMessage(null);
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
              <div key={pilot.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-amber-500/15 bg-black/40">
                    <DriverPhoto src={pilot.photo} alt={pilot.name} />
                  </div>
                  <span className="text-sm font-medium text-white">{pilot.name}</span>
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
                  disabled={isComplete}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-left transition hover:border-amber-300/35 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-amber-500/15 bg-black/40">
                    <DriverPhoto src={pilot.photo} alt={pilot.name} />
                  </div>
                  <span className="text-sm text-white">{pilot.name}</span>
                </button>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </PanelShell>
  );
}
