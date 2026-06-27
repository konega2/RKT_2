"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { generatePilotFpSummaryPdf } from "@/lib/pilot-fp-summary-pdf";
import { type TrainingPilotSummaryRecord, type TrainingSessionSummaryRecord } from "@/lib/rkt-panel";

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function statusStyle(count: number, max: number) {
  const ratio = count / max;

  if (ratio >= 1) {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (ratio >= 0.67) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
}

export default function RktPanelTrainingsPage() {
  const [sessions, setSessions] = useState<TrainingSessionSummaryRecord[]>([]);
  const [exportingSummary, setExportingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        setError(null);
        const response = await fetch("/api/training-sessions", { cache: "no-store" });
        const data = (await response.json()) as TrainingSessionSummaryRecord[] | { error?: string };

        if (!response.ok || !Array.isArray(data)) {
          setError(typeof data === "object" && "error" in data ? data.error ?? "No se han podido cargar las sesiones." : "No se han podido cargar las sesiones.");
          return;
        }

        setSessions(data);
      } finally {
        setLoading(false);
      }
    }

    void loadSessions();

    const intervalId = window.setInterval(() => {
      void loadSessions();
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => toMinutes(a.time) - toMinutes(b.time)),
    [sessions],
  );

  async function handleDownloadPilotSummary() {
    try {
      setExportingSummary(true);
      setSummaryError(null);

      const response = await fetch("/api/training-sessions/pilot-summary", { cache: "no-store" });
      const data = (await response.json()) as TrainingPilotSummaryRecord[] | { error?: string };

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(
          typeof data === "object" && "error" in data
            ? data.error ?? "No se ha podido generar el PDF."
            : "No se ha podido generar el PDF.",
        );
      }

      await generatePilotFpSummaryPdf({ generatedAt: new Date(), pilots: data });
    } catch (downloadError) {
      setSummaryError(downloadError instanceof Error ? downloadError.message : "No se ha podido generar el PDF.");
    } finally {
      setExportingSummary(false);
    }
  }

  return (
    <PanelShell heading="Entrenamientos" kicker="Gestión de sesiones">
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/70">Resumen global</p>
              <p className="mt-2 text-sm text-white/78">
                Descarga un PDF con todos los pilotos, cuántos FP tienen asignados y la hora de cada sesión.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleDownloadPilotSummary();
              }}
              disabled={exportingSummary}
              className="rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportingSummary ? "Generando PDF..." : "Descargar resumen FP"}
            </button>
          </div>

          {summaryError ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {summaryError}
            </div>
          ) : null}
        </motion.section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {error ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/[0.08]" />
                  <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-white/[0.08]" />
                  <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-white/[0.08]" />
                </div>
              ))
            : sortedSessions.map((session, index) => {
                const assigned = session.assignedPilots;
                const visual = statusStyle(assigned, session.maxPilots);

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: index * 0.02 }}
                  >
                    <Link
                      href={`/rkt-panel/entrenamientos/${session.id}`}
                      className="block rounded-[24px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-amber-300/35 hover:bg-white/[0.05]"
                    >
                      <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/70">{session.time}</p>
                      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white">{session.name}</p>
                      <p className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${visual}`}>
                        {assigned} / {session.maxPilots} pilotos
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </PanelShell>
  );
}
