"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { PanelBackdrop } from "@/components/rkt-panel/panel-shell";
import { isPanelAuthenticated, setPanelAuthenticated } from "@/components/rkt-panel/use-panel-auth";
import { PANEL_CREDENTIALS } from "@/lib/rkt-panel";

export function RktPanelLoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const nextPath = useMemo(() => searchParams.get("next") || "/rkt-panel/dashboard", [searchParams]);

  useEffect(() => {
    if (isPanelAuthenticated()) {
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username === PANEL_CREDENTIALS.username && password === PANEL_CREDENTIALS.password) {
      setPanelAuthenticated(true);
      router.push(nextPath);
      return;
    }

    setError("Credenciales incorrectas. Verifica el usuario y la contraseña.");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <PanelBackdrop />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md overflow-hidden rounded-[28px] border border-amber-500/20 bg-black/75 shadow-[0_0_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="border-b border-amber-500/10 px-8 py-8">
            <div className="mx-auto relative mb-6 h-16 w-16 overflow-hidden rounded-2xl border border-amber-400/20 bg-amber-500/5">
              <Image src="/logos/logo_rkt.png" alt="Logo RKT" fill className="object-contain p-2" />
            </div>
            <p className="text-center text-[11px] uppercase tracking-[0.32em] text-amber-300/75">Rental Karting Trophy</p>
            <h1 className="mt-3 text-center text-3xl font-black uppercase tracking-[0.08em] text-white">Acceso al panel</h1>
            <p className="mt-3 text-center text-sm text-white/55">Sistema interno de gestión para el campeonato RKT.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
            <label className="block space-y-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/80">Usuario</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Introduce el usuario"
                className="w-full rounded-2xl border border-amber-500/15 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-amber-400/45 focus:bg-white/[0.05]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/80">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Introduce la contraseña"
                className="w-full rounded-2xl border border-amber-500/15 bg-white/[0.03] px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-amber-400/45 focus:bg-white/[0.05]"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-100 transition hover:border-amber-300/60 hover:bg-amber-500/20"
            >
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
