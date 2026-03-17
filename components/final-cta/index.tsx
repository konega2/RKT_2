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
      <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-black/45 sm:h-20 sm:w-20">
        <span className="font-['Rajdhani',sans-serif] text-3xl font-bold text-[#D4AF37] sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
        {/* corner accents */}
        <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-[#D4AF37]/70" />
        <span className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-[#D4AF37]/70" />
        <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#D4AF37]/70" />
        <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#D4AF37]/70" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-white/75">
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

export function FinalCtaSection({ initialConfirmedPilots }: { initialConfirmedPilots: number }) {
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  // Countdown tick — initialized client-side only to avoid SSR hydration mismatch
  useEffect(() => {
    setCountdown(getCountdown());
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  const pilots = initialConfirmedPilots;
  const progressPct = Math.min((pilots / MAX_PILOTS) * 100, 100);

  return (
    <section
      id="final-cta"
      aria-label="Participantes confirmados e inscripción"
      className="relative overflow-hidden py-24"
    >


      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]"
        >
          Evento RKT · Valencia · 2026
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 font-['Rajdhani',sans-serif] text-4xl font-black uppercase leading-none tracking-tight text-white [text-shadow:0_0_12px_rgba(255,255,255,0.14)] sm:text-5xl md:text-6xl"
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
          className="mx-auto mb-10 max-w-lg rounded-xl border border-[#D4AF37]/28 bg-white/[0.05] p-6 backdrop-blur-sm"
        >
          <p className="mb-1 text-sm uppercase tracking-widest text-white/75">
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
          <p className="mt-2 text-xs text-white">
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
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white">
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
        <div className="mx-auto mt-2 flex w-full max-w-[360px] flex-col gap-4">
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
            className="block w-full rounded-lg px-10 py-5 text-center font-['Rajdhani',sans-serif] text-lg font-black uppercase tracking-widest text-black transition-shadow duration-300 hover:shadow-[0_0_30px_#D4AF3780]"
            style={{
              background:
                "linear-gradient(135deg, #B8962E 0%, #D4AF37 50%, #F0D060 100%)",
            }}
          >
            Reservar mi plaza
          </motion.a>

          <motion.a
            href="https://chat.whatsapp.com/EYN9OnLpEu49Fh4dSHyQr1?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.52 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-3 rounded-lg px-10 py-5 text-center font-['Rajdhani',sans-serif] text-lg font-black uppercase tracking-widest text-white transition-all duration-300"
            style={{
              background: "#25D366",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 12px 34px rgba(37,211,102,0.36)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M19.05 4.91A9.78 9.78 0 0 0 12.1 2c-5.44 0-9.86 4.4-9.86 9.83 0 1.73.46 3.42 1.32 4.9L2 22l5.45-1.42a9.9 9.9 0 0 0 4.64 1.18h.01c5.44 0 9.86-4.41 9.86-9.84 0-2.63-1.03-5.1-2.91-6.99Zm-6.95 15.18h-.01a8.3 8.3 0 0 1-4.23-1.15l-.3-.18-3.23.84.86-3.15-.2-.32a8.2 8.2 0 0 1-1.27-4.3c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.84 2.42 8.13 8.13 0 0 1 2.41 5.8c0 4.54-3.7 8.24-8.12 8.24Zm4.52-6.17c-.25-.12-1.48-.73-1.71-.82-.23-.08-.4-.12-.57.13-.17.24-.65.81-.8.97-.15.16-.3.18-.55.06-.25-.13-1.06-.39-2.01-1.23-.74-.66-1.23-1.47-1.37-1.72-.14-.24-.01-.37.1-.49.11-.1.25-.27.37-.41.12-.15.16-.25.24-.42.08-.16.04-.3-.02-.42-.06-.12-.57-1.36-.78-1.86-.21-.5-.42-.43-.57-.44h-.49c-.17 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.57 4.1 3.61.57.25 1.01.39 1.36.5.57.18 1.08.15 1.49.09.46-.07 1.48-.61 1.69-1.2.21-.6.21-1.11.14-1.21-.07-.1-.23-.16-.48-.28Z" />
            </svg>
            <span>Unirme al grupo</span>
          </motion.a>
        </div>

        <p className="mt-5 text-xs text-white/65">
          Acceso exclusivo · 96 plazas totales · Kartodromo Valencia
        </p>
      </div>
    </section>
  );
}
