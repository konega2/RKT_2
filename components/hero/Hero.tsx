"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const PARTICLES = [
  { id: 0, x: 8, y: 20, size: 2, opacity: 0.5, dur: 8, delay: 0 },
  { id: 1, x: 16, y: 72, size: 3, opacity: 0.42, dur: 10, delay: 1.2 },
  { id: 2, x: 24, y: 42, size: 2, opacity: 0.45, dur: 7, delay: 0.8 },
  { id: 3, x: 36, y: 84, size: 3, opacity: 0.38, dur: 11, delay: 2 },
  { id: 4, x: 48, y: 34, size: 2, opacity: 0.5, dur: 9, delay: 0.4 },
  { id: 5, x: 58, y: 68, size: 3, opacity: 0.4, dur: 8, delay: 1.6 },
  { id: 6, x: 67, y: 18, size: 2, opacity: 0.45, dur: 10, delay: 0.2 },
  { id: 7, x: 76, y: 54, size: 3, opacity: 0.36, dur: 9, delay: 2.4 },
  { id: 8, x: 84, y: 28, size: 2, opacity: 0.4, dur: 7, delay: 1 },
  { id: 9, x: 92, y: 76, size: 3, opacity: 0.44, dur: 10, delay: 0.6 },
  { id: 10, x: 28, y: 94, size: 2, opacity: 0.35, dur: 8, delay: 1.8 },
  { id: 11, x: 74, y: 90, size: 2, opacity: 0.33, dur: 8, delay: 0.9 },
] as const;

const STREAKS = [
  {
    id: 0,
    d: "M -420 1080 C  20 780  460 460  900 180 C 1220 -24 1530 -168 1880 -300",
    outer: "#78350F",
    mid: "#D97706",
    core: "#FDE68A",
    outerOpacity: 0.09,
    midOpacity: 0.19,
    coreOpacity: 0.42,
  },
  {
    id: 1,
    d: "M -460 920  C -10 650  420 360  860 120 C 1190 -58 1510 -178 1860 -296",
    outer: "#78350F",
    mid: "#F59E0B",
    core: "#FEF3C7",
    outerOpacity: 0.07,
    midOpacity: 0.16,
    coreOpacity: 0.34,
  },
  {
    id: 2,
    d: "M -500 760  C -40 530  420 270  900  30 C 1240 -132 1560 -246 1900 -350",
    outer: "#78350F",
    mid: "#B45309",
    core: "#FDE68A",
    outerOpacity: 0.05,
    midOpacity: 0.12,
    coreOpacity: 0.26,
  },
  {
    id: 3,
    d: "M -460 1140 C  20 820  520 500  980 210 C 1300 8 1610 -120 1940 -236",
    outer: "#78350F",
    mid: "#D97706",
    core: "#FDE68A",
    outerOpacity: 0.05,
    midOpacity: 0.1,
    coreOpacity: 0.2,
  },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

const logoFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease } },
};

const titleSlide = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const eventFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.75, delay: 0.15, ease } },
};

const buttonReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay: 0.28, ease } },
};

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero – Rental Karting Trophy"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black"
    >
      <style jsx>{`
        @keyframes streakFlow {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(2200px, 0, 0);
          }
        }

        @keyframes particleDrift {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          18% {
            opacity: var(--particle-opacity);
          }
          100% {
            transform: translate3d(18px, -22px, 0);
            opacity: 0;
          }
        }

        .particle-lite {
          animation-name: particleDrift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        .streak-flow {
          animation: streakFlow 12s linear infinite;
          will-change: transform;
        }

        @keyframes championSweep {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        .champion-shine {
          background-image: linear-gradient(90deg, #ffd700, #ffa500, #ffd700);
          background-size: 200% 100%;
          animation: championSweep 7s linear infinite;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 18px rgba(255, 200, 0, 0.28);
        }

      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,200,0,0.45)_0%,rgba(255,180,0,0.25)_30%,rgba(255,150,0,0.10)_50%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,210,40,0.22)_0%,rgba(255,170,0,0.12)_40%,transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_58%_at_50%_54%,rgba(245,158,11,0.18)_0%,rgba(180,83,9,0.10)_38%,transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_56%_42%_at_50%_46%,rgba(251,191,36,0.24)_0%,transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_50%,transparent_34%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="streak-flow">
          <g>
            {STREAKS.map((streak) => (
              <g key={`a-${streak.id}`}>
                <path
                  d={streak.d}
                  fill="none"
                  stroke={streak.outer}
                  strokeWidth="14"
                  opacity={streak.outerOpacity}
                  strokeLinecap="round"
                />
                <path
                  d={streak.d}
                  fill="none"
                  stroke={streak.mid}
                  strokeWidth="3"
                  opacity={streak.midOpacity}
                  strokeLinecap="round"
                />
                <path
                  d={streak.d}
                  fill="none"
                  stroke={streak.core}
                  strokeWidth="0.95"
                  opacity={streak.coreOpacity}
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
          <g transform="translate(-2200 0)">
            {STREAKS.map((streak) => (
              <g key={`b-${streak.id}`}>
                <path
                  d={streak.d}
                  fill="none"
                  stroke={streak.outer}
                  strokeWidth="14"
                  opacity={streak.outerOpacity}
                  strokeLinecap="round"
                />
                <path
                  d={streak.d}
                  fill="none"
                  stroke={streak.mid}
                  strokeWidth="3"
                  opacity={streak.midOpacity}
                  strokeLinecap="round"
                />
                <path
                  d={streak.d}
                  fill="none"
                  stroke={streak.core}
                  strokeWidth="0.95"
                  opacity={streak.coreOpacity}
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        </g>
      </svg>

      <div
        aria-hidden="true"
        className="scanlines pointer-events-none absolute inset-0 z-0 opacity-[0.16]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        {PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="particle-lite absolute rounded-full bg-amber-300"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              animationDuration: `${particle.dur}s`,
              animationDelay: `${particle.delay}s`,
              ["--particle-opacity" as string]: particle.opacity,
            } as CSSProperties}
          />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-[3px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-90"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-8 text-center md:px-10"
      >
        <motion.div variants={logoFade} className="relative mb-5 md:mb-6">
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.36)_0%,rgba(245,158,11,0.14)_40%,transparent_72%)]" />
          <Image
            src="/logos/logo_rkt.png"
            alt="Rental Karting Trophy"
            width={300}
            height={104}
            priority
            className="relative h-auto w-[120px] object-contain drop-shadow-[0_0_14px_rgba(245,158,11,0.34)] md:w-[160px]"
          />
        </motion.div>

        <motion.div
          variants={reveal}
          className="mb-5 h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        />

        <h1 className="flex flex-col text-[clamp(2.4rem,7vw,5.5rem)] font-black uppercase leading-[0.92] tracking-tighter">
          <motion.span variants={titleSlide} className="block text-white">
            Are you ready
          </motion.span>
          <motion.span variants={titleSlide} className="block text-white">
            to be the first
          </motion.span>
          <motion.span
            variants={titleSlide}
            className="champion-shine block"
          >
            champion?
          </motion.span>
        </h1>

        <motion.div
          className="mt-5 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 120, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45, ease }}
        />

        <motion.div variants={eventFade} className="mt-5 flex flex-col items-center gap-1">
          <span className="text-sm font-semibold text-white/90 sm:text-base">
            Rental Karting Trophy 2026
          </span>
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-xs">
            Kartódromo Internacional Lucas Guerrero
          </span>
          <span className="mt-0.5 text-sm font-bold uppercase tracking-widest text-amber-400 sm:text-sm">
            3–4 July 2026
          </span>
        </motion.div>

        <motion.div variants={buttonReveal} className="mt-7 md:mt-8">
          <a
            href="#final-cta"
            className="group relative inline-block overflow-hidden rounded-md border border-amber-500/30 bg-amber-400 px-10 py-3 text-sm font-black uppercase tracking-widest text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_0_30px_rgba(255,200,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:px-14 md:py-4 md:text-base"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full skew-x-[-18deg] bg-white/15 transition-transform duration-700 group-hover:translate-x-full"
            />
            <span className="relative">Reserva tu plaza en la parrilla</span>
          </a>
        </motion.div>

      </motion.div>
    </section>
  );
}
