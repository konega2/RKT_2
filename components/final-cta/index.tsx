"use client";

import { useEffect, useRef, useState } from "react";

import { motion, useInView } from "framer-motion";

const MAX_PILOTS = 96;
const EVENT_DATE = new Date("2026-07-03T09:00:00");

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getCountdown(): Countdown {
  const now = new Date();
  const diff = Math.max(0, EVENT_DATE.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-black/60 sm:h-20 sm:w-20">
        <span className="font-['Rajdhani',sans-serif] text-3xl font-bold text-[#D4AF37] sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
        {/* corner accents */}
        <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-[#D4AF37]/70" />
        <span className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-[#D4AF37]/70" />
        <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#D4AF37]/70" />
        <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#D4AF37]/70" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
        {label}
      </span>
    </div>
  );
}

function AnimatedCounter({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [inView, target]);

  return <span ref={ref}>{current}</span>;
}

export function FinalCtaSection() {
  const [confirmedPilots, setConfirmedPilots] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  // Fetch pilot count
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/pilots/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setConfirmedPilots(data.confirmedPilots ?? 0);
      } catch {
        // silently ignore
      }
    };
    load();
    const interval = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Countdown tick — initialized client-side only to avoid SSR hydration mismatch
  useEffect(() => {
    setCountdown(getCountdown());
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  const pilots = confirmedPilots ?? 0;
  const progressPct = Math.min((pilots / MAX_PILOTS) * 100, 100);

  return (
    <section
      id="final-cta"
      aria-label="Participantes confirmados e inscripción"
      className="relative overflow-hidden bg-black py-24"
    >
      {/* Background streaks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            105deg,
            #D4AF37 0px,
            #D4AF37 1px,
            transparent 1px,
            transparent 60px
          )`,
        }}
      />
      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, #D4AF37 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]"
        >
          Campeonato RKT · Valencia · 2026
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 font-['Rajdhani',sans-serif] text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          ¿ESTÁS DENTRO?
        </motion.h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mb-10 h-[2px] w-24 origin-center bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
        />

        {/* Pilot counter block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mb-10 max-w-lg rounded-xl border border-[#D4AF37]/20 bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <p className="mb-1 text-sm uppercase tracking-widest text-white/50">
            Plazas ocupadas
          </p>
          <p className="mb-4 font-['Rajdhani',sans-serif] text-5xl font-black text-white sm:text-6xl">
            <AnimatedCounter target={pilots} />
            <span className="text-[#D4AF37]"> / {MAX_PILOTS}</span>
          </p>

          {/* Progress bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #B8962E 0%, #D4AF37 50%, #F0D060 100%)",
                boxShadow: "0 0 10px #D4AF3780",
              }}
              initial={{ width: "0%" }}
              whileInView={{ width: `${progressPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-white/40">
            {MAX_PILOTS - pilots > 0
              ? `Quedan ${MAX_PILOTS - pilots} plazas disponibles`
              : "¡Aforo completo!"}
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-12"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Faltan para el evento · 3 Jul 2026
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {countdown ? (
              <>
                <CountdownUnit value={countdown.days} label="días" />
                <span className="mb-5 text-2xl font-bold text-[#D4AF37]/60">:</span>
                <CountdownUnit value={countdown.hours} label="horas" />
                <span className="mb-5 text-2xl font-bold text-[#D4AF37]/60">:</span>
                <CountdownUnit value={countdown.minutes} label="min" />
                <span className="mb-5 text-2xl font-bold text-[#D4AF37]/60">:</span>
                <CountdownUnit value={countdown.seconds} label="seg" />
              </>
            ) : (
              <div className="h-20 w-72 animate-pulse rounded-lg bg-white/5" />
            )}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.a
          href="https://kartodromovalencia.com/pre-inscripcion/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block rounded-lg px-10 py-5 font-['Rajdhani',sans-serif] text-lg font-black uppercase tracking-widest text-black transition-shadow duration-300 hover:shadow-[0_0_30px_#D4AF3780]"
          style={{
            background:
              "linear-gradient(135deg, #B8962E 0%, #D4AF37 50%, #F0D060 100%)",
          }}
        >
          Reservar mi plaza
        </motion.a>

        <p className="mt-5 text-xs text-white/30">
          Acceso exclusivo · 96 plazas totales · Kartodromo Valencia
        </p>
      </div>
    </section>
  );
}
