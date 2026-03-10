"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { useDriverStore } from "@/components/rkt-panel/use-driver-store";

export default function RktPanelDashboardPage() {
  const { drivers, loaded } = useDriverStore();

  const activeDrivers = drivers.filter((driver) => driver.status === "Activo").length;
  const pendingDocs = drivers.filter(
    (driver) =>
      !driver.documentation.imageAccepted ||
      !driver.documentation.insuranceAccepted ||
      !driver.documentation.liabilitySigned,
  ).length;

  return (
    <PanelShell heading="Panel de gestión RKT" kicker="Dashboard interno">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-8"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300/70">Centro de control</p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white">Panel de gestión RKT</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
            Administra pilotos confirmados, revisa documentación interna y mantén organizado el flujo operativo del campeonato desde un único panel.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { label: "Pilotos totales", value: loaded ? drivers.length : "--" },
              { label: "Activos", value: loaded ? activeDrivers : "--" },
              { label: "Documentación pendiente", value: loaded ? pendingDocs : "--" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-amber-500/10 bg-black/40 p-4"
                style={{ boxShadow: `inset 0 0 0 1px rgba(245,158,11,${0.03 + index * 0.02})` }}
              >
                <p className="text-[11px] uppercase tracking-[0.26em] text-white/35">{stat.label}</p>
                <p className="mt-3 text-3xl font-black text-amber-100">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="rounded-[28px] border border-amber-500/15 bg-gradient-to-b from-amber-500/10 to-transparent p-6 backdrop-blur-xl"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300/70">Accesos rápidos</p>
          <div className="mt-5 space-y-3">
            <Link
              href="/rkt-panel/pilotos"
              className="flex items-center justify-between rounded-2xl border border-amber-300/20 bg-black/45 px-4 py-4 text-white transition hover:border-amber-300/45 hover:bg-black/60"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em]">Pilotos confirmados</p>
                <p className="mt-1 text-xs text-white/45">Gestiona altas, filtros y fichas individuales.</p>
              </div>
              <span className="text-amber-300">→</span>
            </Link>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/50">
              Entrenamientos y carreras estarán disponibles en próximas fases del panel.
            </div>
          </div>
        </motion.section>
      </div>
    </PanelShell>
  );
}
