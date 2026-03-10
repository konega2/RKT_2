"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { usePanelGuard } from "@/components/rkt-panel/use-panel-auth";

const STREAKS = [
  {
    id: 0,
    d: "M -380 840 C 80 520 520 280 980 30 C 1220 -100 1510 -220 1860 -320",
    outer: "#78350F",
    mid: "#D97706",
    core: "#FDE68A",
  },
  {
    id: 1,
    d: "M -440 660 C 0 420 460 210 940 -20 C 1260 -150 1560 -250 1880 -360",
    outer: "#451A03",
    mid: "#B45309",
    core: "#FCD34D",
  },
] as const;

const NAV_ITEMS = [
  { href: "/rkt-panel/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/rkt-panel/pre-inscripciones", label: "Pre-inscripciones", icon: "clipboard" },
  { href: "/rkt-panel/pilotos", label: "Pilotos confirmados", icon: "helmet" },
  { href: "/rkt-panel/entrenamientos", label: "Entrenamientos", icon: "helmet" },
] as const;

function Icon({ kind }: { kind: "grid" | "helmet" | "clipboard" | "logout" }) {
  if (kind === "helmet") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path d="M4 13a8 8 0 1 1 16 0v3h-5l-2 3H7a3 3 0 0 1-3-3v-3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9h6" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "clipboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path d="M9 4h6" strokeLinecap="round" />
        <path d="M9 3h6a2 2 0 0 1 2 2v1H7V5a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 11h8M8 15h5" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "logout") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12H10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

export function PanelShell({ children, heading, kicker }: { children: ReactNode; heading: string; kicker: string }) {
  const pathname = usePathname();
  const { authenticated, logout, ready } = usePanelGuard();

  if (!ready || !authenticated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <PanelBackdrop />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="rounded-2xl border border-amber-500/20 bg-black/70 px-8 py-6 text-sm uppercase tracking-[0.28em] text-amber-200/80 backdrop-blur-xl">
            Cargando panel...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <PanelBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-amber-500/10 bg-black/75 backdrop-blur-xl lg:w-[300px] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-6 py-6 lg:block">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-amber-400/20 bg-amber-500/5">
                <Image src="/logos/logo_rkt.png" alt="RKT" fill className="object-contain p-1.5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/70">RKT Internal</p>
                <p className="text-lg font-semibold text-white">Rental Karting Trophy</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 px-4 pb-4 lg:px-6">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all duration-300",
                    active
                      ? "border-amber-300/30 bg-amber-500/10 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.08)]"
                      : "border-transparent bg-white/[0.03] text-white/72 hover:border-amber-400/15 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 text-amber-300">
                    <Icon kind={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

          </nav>

          <div className="mt-auto px-4 pb-5 lg:px-6 lg:pt-6">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-amber-500/20 bg-black/60 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-400/40 hover:bg-amber-500/10"
            >
              <Icon kind="logout" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 px-6 py-6 lg:px-10 lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8 flex flex-col gap-3"
          >
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-300/70">{kicker}</p>
            <h1 className="text-3xl font-black uppercase tracking-[0.06em] text-white md:text-4xl">{heading}</h1>
          </motion.div>

          {children}
        </main>
      </div>
    </div>
  );
}

export function PanelBackdrop() {
  return (
    <>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-70" preserveAspectRatio="none" viewBox="0 0 1440 900">
        {STREAKS.map((streak) => (
          <g key={streak.id}>
            <path d={streak.d} stroke={streak.outer} strokeWidth="24" fill="none" opacity="0.08" />
            <path d={streak.d} stroke={streak.mid} strokeWidth="9" fill="none" opacity="0.14" />
            <path d={streak.d} stroke={streak.core} strokeWidth="2.8" fill="none" opacity="0.26" />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_38%),radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.05),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.04]" />
    </>
  );
}
