"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

/* ─── Data ─────────────────────────────────────────────────────────────── */

interface FeatureCard {
  id: number;
  title: string;
  link: string;
  image: string;
}

interface RecentCard {
  id: number;
  title: string;
  date: string;
  link: string;
  image: string;
}

const RECENT_CARDS: RecentCard[] = [
  {
    id: 0,
    title: "FLOTA DE KARTS DEL CAMPEONATO",
    date: "28 Mayo 2025",
    link: "https://www.instagram.com/p/DVnyXpaDfmG/",
    image: "/images/Flota_karts.png",
  },
  {
    id: 1,
    title: "RETRANSMISIÓN OFICIAL DEL EVENTO",
    date: "21 Mayo 2025",
    link: "https://www.instagram.com/p/DUqy9EfjYz-/",
    image: "/images/retrasnmision_oficial.png",
  },
];

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 0,
    title: "TODO LO QUE TIENES QUE SABER SOBRE EL RKT",
    link: "https://www.instagram.com/p/DUyZvwcDTJU/?img_index=1",
    image: "/images/Todo_lo_que_tienes_que_saber.png",
  },
  {
    id: 1,
    title: "FORMATO DEL EVENTO",
    link: "https://www.instagram.com/p/DTQz-zQjc8_/",
    image: "/images/formato_del_evento.png",
  },
  {
    id: 2,
    title: "RETRANSMISIÓN OFICIAL DEL EVENTO",
    link: "https://www.instagram.com/p/DUqy9EfjYz-/",
    image: "/images/retrasnmision_oficial.png",
  },
  {
    id: 3,
    title: "FLOTA DE KARTS DEL CAMPEONATO",
    link: "https://www.instagram.com/p/DVnyXpaDfmG/",
    image: "/images/Flota_karts.png",
  },
];

/* ─── Animation constants ────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

/* ─── Instagram icon ─────────────────────────────────────────────────── */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.01" fill="currentColor" strokeWidth={2.5} />
    </svg>
  );
}

/* ─── Feature card ───────────────────────────────────────────────────── */

function FeatureCardItem({ card, hoverScale = 1.06 }: { card: FeatureCard; hoverScale?: number }) {
  return (
    <motion.a
      href={card.link}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardVariants}
      className="group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer"
      style={{
        background:
          "linear-gradient(160deg, rgba(18,12,4,0.97) 0%, rgba(8,6,2,0.99) 100%)",
        border: "1px solid rgba(180,131,40,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      }}
      whileHover={{ scale: hoverScale, y: -6 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      {/* Hover glow ring */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-350"
        style={{
          boxShadow:
            "0 0 32px 4px rgba(217,119,6,0.18), inset 0 0 0 1px rgba(251,191,36,0.5)",
        }}
      />

      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-500 ease-out"
        />

        {/* Permanent subtle gradient at bottom of image */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,6,2,0.75) 0%, rgba(8,6,2,0.15) 45%, transparent 100%)",
          }}
        />

        {/* Instagram icon — appears on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md"
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(251,191,36,0.35)",
            }}
          >
            <InstagramIcon className="h-4 w-4 text-amber-400" />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "rgba(251,191,36,0.9)" }}
            >
              Ver post
            </span>
          </div>
        </div>

        {/* Top-left number tag */}
        <div
          className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full"
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(217,119,6,0.4)",
          }}
        >
          <span
            className="text-[10px] font-black"
            style={{ color: "rgba(251,191,36,0.85)" }}
          >
            {String(card.id + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Title area */}
      <div className="flex flex-col gap-2.5 p-4">
        {/* Accent top border */}
        <div
          className="h-px w-8 group-hover:w-full transition-all duration-500"
          style={{
            background:
              "linear-gradient(90deg, rgba(251,191,36,0.7) 0%, rgba(217,119,6,0.15) 100%)",
          }}
        />
        <p
          className="text-xs font-bold uppercase leading-snug text-white/85 group-hover:text-amber-200 transition-colors duration-300"
          style={{ letterSpacing: "0.09em" }}
        >
          {card.title}
        </p>
      </div>
    </motion.a>
  );
}

/* ─── Recent card (Block 2) ─────────────────────────────────────────── */

function RecentCardItem({ card }: { card: RecentCard }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.32, ease: EASE }}
      style={{
        background: "linear-gradient(145deg, rgba(20,14,6,0.97) 0%, rgba(10,8,3,0.99) 100%)",
        border: "1px solid rgba(180,131,40,0.32)",
      }}
    >
      {/* Hover glow */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: "0 0 40px 6px rgba(217,119,6,0.2), inset 0 0 0 1px rgba(251,191,36,0.5)" }}
      />

      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-100"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,7,2,0.85) 0%, rgba(10,7,2,0.2) 50%, transparent 100%)" }}
        />
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm border border-amber-600/25">
          <InstagramIcon className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium text-amber-400/80 tracking-wide">Instagram</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <div
            className="h-px flex-1"
            style={{ background: "linear-gradient(90deg, rgba(217,119,6,0.6) 0%, transparent 100%)" }}
          />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(217,119,6,0.8)" }}>
            {card.date}
          </span>
        </div>

        <h3
          className="text-lg font-black uppercase leading-tight text-white group-hover:text-amber-100 transition-colors duration-300"
          style={{ letterSpacing: "0.08em" }}
        >
          {card.title}
        </h3>

        <div className="mt-auto pt-2">
          <a
            href={card.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-lg px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-300"
            style={{ border: "1px solid rgba(217,119,6,0.5)", color: "rgba(251,191,36,0.9)", background: "rgba(217,119,6,0.06)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(217,119,6,0.18)";
              el.style.borderColor = "rgba(251,191,36,0.7)";
              el.style.color = "#fde68a";
              el.style.boxShadow = "0 0 14px rgba(217,119,6,0.25)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(217,119,6,0.06)";
              el.style.borderColor = "rgba(217,119,6,0.5)";
              el.style.color = "rgba(251,191,36,0.9)";
              el.style.boxShadow = "none";
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <InstagramIcon className="h-3.5 w-3.5" />
            VER PUBLICACIÓN
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3 w-3" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function RecentBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-10 text-center"
      >
        <h3
          className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl"
          style={{ letterSpacing: "-0.01em" }}
        >
          ÚLTIMAS{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NOVEDADES
          </span>
        </h3>
        <p
          className="mt-3 text-sm uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.16em" }}
        >
          Lo último publicado por el campeonato.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {RECENT_CARDS.map((card) => (
          <RecentCardItem key={card.id} card={card} />
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Main exported section ──────────────────────────────────────────── */

export function SocialFeedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px 0px" });

  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-60px 0px" });

  return (
    <section
      id="social-feed"
      ref={sectionRef}
      aria-label="Actualidad del RKT"
      className="relative overflow-hidden py-24 md:py-32"
    >


      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Section header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16 text-center md:mb-20"
        >
          {/* Eyebrow */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <div
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(217,119,6,0.7))",
              }}
            />
            <span
              className="text-xs font-bold tracking-[0.3em] uppercase"
              style={{ color: "rgba(217,119,6,0.85)" }}
            >
              RKT · 2026
            </span>
            <div
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(90deg, rgba(217,119,6,0.7), transparent)",
              }}
            />
          </div>

          {/* Main title */}
          <h2
            className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.01em" }}
          >
            ACTUALIDAD{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              DEL RKT
            </span>
          </h2>

          {/* Subtitle */}
          <p
            className="mt-4 text-sm uppercase tracking-widest"
            style={{
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.18em",
            }}
          >
            Información, anuncios y novedades del campeonato.
          </p>

          {/* Decorative diamond divider */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className="h-px w-24"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(217,119,6,0.6), transparent)",
              }}
            />
            <div
              className="h-1.5 w-1.5 rotate-45"
              style={{ background: "rgba(217,119,6,0.7)" }}
            />
            <div
              className="h-px w-24"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(217,119,6,0.6), transparent)",
              }}
            />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            BLOCK 1 – Feature cards (4 columns)
        ══════════════════════════════════════════════════════════════ */}
        <div ref={cardsRef}>
          {/* Block label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={cardsInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: EASE }}
            className="mb-10 flex items-center gap-4"
          >
            <div
              className="h-9 w-[3px] rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #fbbf24 0%, rgba(217,119,6,0.25) 100%)",
              }}
            />
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.28em]"
                style={{ color: "rgba(217,119,6,0.85)" }}
              >
                Información clave
              </p>
              <p
                className="mt-0.5 text-xl font-black uppercase tracking-wider text-white"
                style={{ letterSpacing: "0.06em" }}
              >
                Lo que necesitas saber
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={cardsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            {FEATURE_CARDS.map((card) => (
              <FeatureCardItem
                key={card.id}
                card={card}
                hoverScale={card.id <= 1 ? 1.02 : 1.06}
              />
            ))}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-16 flex items-center gap-6 md:my-20">
          <div
            className="h-px flex-1"
            style={{ background: "linear-gradient(90deg, transparent, rgba(217,119,6,0.25), transparent)" }}
          />
          <div className="h-px w-16" style={{ background: "rgba(217,119,6,0.5)" }} />
          <div
            className="h-px flex-1"
            style={{ background: "linear-gradient(90deg, transparent, rgba(217,119,6,0.25), transparent)" }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BLOCK 2 – Últimas publicaciones (2 large cards)
        ══════════════════════════════════════════════════════════════ */}
        <RecentBlock />

        {/* Instagram follow CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={cardsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <a
            href="https://www.instagram.com/rentalkartingtrophy/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-xs font-bold tracking-[0.22em] uppercase transition-all duration-300"
            style={{
              border: "1px solid rgba(217,119,6,0.4)",
              color: "rgba(251,191,36,0.85)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(217,119,6,0.12)";
              el.style.borderColor = "rgba(251,191,36,0.65)";
              el.style.boxShadow = "0 0 22px rgba(217,119,6,0.22)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "transparent";
              el.style.borderColor = "rgba(217,119,6,0.4)";
              el.style.boxShadow = "none";
            }}
          >
            <InstagramIcon className="h-4 w-4" />
            Seguir en Instagram
          </a>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.22)", letterSpacing: "0.14em" }}
          >
            @rentalkartingtrophy · Mantente al día
          </p>
        </motion.div>
      </div>
    </section>
  );
}