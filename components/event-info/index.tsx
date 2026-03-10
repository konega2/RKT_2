"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

interface TimelineNode {
  id: number;
  label: string;
  heading: string;
  body: string;
  detail?: string;
  accentIcon: string;
}

const NODES: TimelineNode[] = [
  {
    id: 0,
    label: "QUÉ ES",
    heading: "El Campeonato",
    body: "96 pilotos compitiendo en el campeonato de karting más premium de la temporada.",
    detail: "Formato de carrera profesional con estructura de campeonato oficial.",
    accentIcon: "01",
  },
  {
    id: 1,
    label: "CUÁNDO",
    heading: "3 – 4 JULIO 2026",
    body: "Viernes entrenamientos · Sábado carrera",
    accentIcon: "02",
  },
  {
    id: 2,
    label: "DÓNDE",
    heading: "Chiva, Valencia, España",
    body: "Kartódromo Internacional Lucas Guerrero",
    detail: "Circuito homologado · Instalaciones profesionales",
    accentIcon: "03",
  },
  {
    id: 3,
    label: "PRECIO",
    heading: "Inversión Oficial",
    body: "225 €",
    detail: "125 € preinscripción por transferencia + 100 € el día del evento",
    accentIcon: "04",
  },
  {
    id: 4,
    label: "INSCRIPCIÓN",
    heading: "Reserva tu plaza",
    body: "Asegura tu posición en la parrilla. Plazas limitadas.",
    detail: "Proceso rápido y seguro. Confirmación inmediata.",
    accentIcon: "05",
  },
];

const SPIKE_STYLES: React.CSSProperties[] = [
  { left: "1.75rem", transform: "translateX(0)" },
  { left: "25%", transform: "translateX(-50%)" },
  { left: "50%", transform: "translateX(-50%)" },
  { left: "75%", transform: "translateX(-50%)" },
  { right: "1.75rem", left: "auto", transform: "translateX(0)" },
];


const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 380, damping: 28 } as const;

function DetailPanel({ node, dotIndex }: { node: TimelineNode; dotIndex: number }) {
  const spikeStyle = SPIKE_STYLES[dotIndex];

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.38, ease: EASE }}
      className="relative w-full"
    >
      <div className="absolute -top-[9px] z-20 h-0 w-0" style={spikeStyle}>
        <span
          className="absolute"
          style={{
            bottom: -1,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderBottom: "10px solid rgba(251,191,36,0.14)",
            filter: "blur(1.5px)",
          }}
        />
        <span
          className="absolute"
          style={{
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "7px solid rgba(251,191,36,0.32)",
          }}
        />
        <span
          className="absolute"
          style={{
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderBottom: "3px solid rgba(253,230,138,0.78)",
          }}
        />
      </div>

      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #0a0600 0%, #110800 40%, #0d0500 100%)",
          border: "1px solid rgba(251,191,36,0.22)",
          boxShadow:
            "0 0 0 1px rgba(251,191,36,0.06), 0 8px 60px rgba(234,179,8,0.14), 0 2px 16px rgba(0,0,0,0.8)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 rounded-full opacity-30"
          style={{
            width: 480,
            height: 240,
            background: "radial-gradient(ellipse, rgba(234,179,8,0.35) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.15) 15%, #F59E0B 35%, #FDE68A 50%, #F59E0B 65%, rgba(251,191,36,0.15) 85%, transparent 100%)",
          }}
        />

        <span className="absolute left-0 top-0 h-8 w-px bg-gradient-to-b from-amber-400/60 to-transparent" />
        <span className="absolute left-0 top-0 h-px w-8 bg-gradient-to-r from-amber-400/60 to-transparent" />
        <span className="absolute right-0 top-0 h-8 w-px bg-gradient-to-b from-amber-400/60 to-transparent" />
        <span className="absolute right-0 top-0 h-px w-8 bg-gradient-to-l from-amber-400/60 to-transparent" />
        <span className="absolute bottom-0 left-0 h-8 w-px bg-gradient-to-t from-amber-400/30 to-transparent" />
        <span className="absolute bottom-0 left-0 h-px w-8 bg-gradient-to-r from-amber-400/30 to-transparent" />
        <span className="absolute bottom-0 right-0 h-8 w-px bg-gradient-to-t from-amber-400/30 to-transparent" />
        <span className="absolute bottom-0 right-0 h-px w-8 bg-gradient-to-l from-amber-400/30 to-transparent" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto]">
          <div className="px-10 py-10">
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: EASE }}
              className="mb-5 flex items-center gap-3"
            >
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] font-black uppercase tracking-[0.3em]"
                style={{
                  background: "linear-gradient(90deg, rgba(120,53,15,0.7), rgba(180,83,9,0.4))",
                  border: "1px solid rgba(251,191,36,0.35)",
                  color: "#FDE68A",
                  boxShadow: "0 0 12px rgba(251,191,36,0.1)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: "#F59E0B", boxShadow: "0 0 6px #F59E0B" }}
                />
                {node.label}
              </span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.4), transparent)" }} />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
              className="mb-4 font-black uppercase leading-none tracking-tight"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                background: "linear-gradient(100deg, #B45309 0%, #F59E0B 30%, #FDE68A 55%, #F59E0B 80%, #D97706 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(251,191,36,0.3))",
              }}
            >
              {node.heading}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
              className="text-base font-medium leading-relaxed md:text-lg"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              {node.body}
            </motion.p>

            {node.detail && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.2, ease: EASE }}
                className="mt-5 flex items-start gap-3"
              >
                <span
                  className="mt-0.5 h-4 w-0.5 shrink-0 rounded-full"
                  style={{ background: "linear-gradient(180deg, #F59E0B, rgba(251,191,36,0.2))" }}
                />
                <p className="text-sm leading-relaxed" style={{ color: "rgba(251,191,36,0.7)" }}>
                  {node.detail}
                </p>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            className="hidden items-center justify-center border-l px-12 py-10 md:flex"
            style={{ borderColor: "rgba(251,191,36,0.1)" }}
          >
            <div className="relative flex flex-col items-center gap-2">
              <span
                className="select-none font-black leading-none"
                style={{
                  fontSize: "6rem",
                  background: "linear-gradient(180deg, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.04) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                {node.accentIcon}
              </span>
              <span className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)" }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(251,191,36,0.35)" }}>
                {node.label}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(234,179,8,0.15) 50%, transparent)" }} />
      </div>
    </motion.div>
  );
}

function TimelineDot({
  node,
  index,
  isActive,
  onClick,
}: {
  node: TimelineNode;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 32, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING, delay: 0.55 + index * 0.1 }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.span
            key="num"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="mb-2 text-[9px] font-black tracking-[0.2em]"
            style={{ color: "#FDE68A" }}
          >
            {node.accentIcon}
          </motion.span>
        )}
      </AnimatePresence>
      {!isActive && <span className="mb-2 h-4" />}

      <motion.button
        onClick={onClick}
        aria-label={`Ver información: ${node.label}`}
        aria-pressed={isActive}
        className="relative flex h-14 w-14 cursor-pointer items-center justify-center focus:outline-none"
        whileTap={{ scale: 0.9 }}
        animate={isActive ? { scale: 1.16 } : { scale: 1 }}
        transition={SPRING}
      >
        <span className="relative flex h-14 w-14 items-center justify-center">
          <AnimatePresence>
            {isActive && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <motion.span
                  key="ripple"
                  initial={{ opacity: 0.65, scale: 0.3 }}
                  animate={{ opacity: 0, scale: 2.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.48, ease: [0.1, 0.6, 0.3, 1] }}
                  className="rounded-full"
                  style={{ width: 26, height: 26, background: "rgba(251,191,36,0.34)" }}
                />
              </span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isActive && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <motion.span
                  key="halo"
                  initial={{ opacity: 0, scale: 0.55 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.35 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="rounded-full"
                  style={{
                    width: 54,
                    height: 54,
                    background: "radial-gradient(circle, rgba(251,191,36,0.36) 0%, rgba(251,191,36,0.1) 52%, transparent 74%)",
                    filter: "blur(5px)",
                  }}
                />
              </span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isActive && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <motion.span
                  key="rotate-ring"
                  initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
                  animate={{ opacity: 1, rotate: 360, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    rotate: { duration: 8, ease: "linear", repeat: Infinity },
                    opacity: { duration: 0.22 },
                    scale: { duration: 0.22 },
                  }}
                  className="rounded-full"
                  style={{ width: 42, height: 42, border: "1.5px dashed rgba(253,230,138,0.42)" }}
                />
              </span>
            )}
          </AnimatePresence>

          {!isActive && (
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <motion.span
                className="rounded-full"
                animate={{ scale: [1, 2], opacity: [0.45, 0] }}
                transition={{ duration: 2.2 + index * 0.25, ease: "easeOut", repeat: Infinity, delay: index * 0.4 }}
                style={{ width: 20, height: 20, background: "rgba(251,191,36,0.38)" }}
              />
            </span>
          )}

          <span
            className="pointer-events-none absolute rounded-full"
            style={{
              width: isActive ? 34 : 30,
              height: isActive ? 34 : 30,
              border: isActive ? "2px solid rgba(253,230,138,0.78)" : "1.5px solid rgba(251,191,36,0.32)",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          />

          <span
            className="relative z-10 flex rounded-full"
            style={{
              width: isActive ? 24 : 20,
              height: isActive ? 24 : 20,
              background: isActive
                ? "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)"
                : "linear-gradient(135deg, #7C3A0A 0%, #C2620A 60%, #E07A10 100%)",
              boxShadow: isActive
                ? "0 0 22px rgba(251,191,36,1), 0 0 44px rgba(251,191,36,0.55), inset 0 1px 0 rgba(255,255,255,0.35)"
                : "0 0 8px rgba(251,191,36,0.5), 0 0 18px rgba(251,191,36,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </span>
      </motion.button>

      <motion.p
        className="mt-3 text-[9px] font-black uppercase tracking-[0.22em]"
        animate={{
          color: isActive ? "#FDE68A" : "rgba(251,191,36,0.65)",
          opacity: isActive ? 1 : 0.65,
          y: isActive ? -1 : 0,
        }}
        transition={{ duration: 0.25 }}
      >
        {node.label}
      </motion.p>
    </motion.div>
  );
}

export function EventInfoSection() {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const selectedNode = NODES.find((node) => node.id === activeNode) ?? null;

  function handleDotClick(id: number) {
    setActiveNode((prev) => (prev === id ? null : id));
  }

  return (
    <section
      ref={sectionRef}
      id="event-info"
      aria-label="Información del Evento"
      className="relative overflow-hidden py-28 md:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(120,53,15,0.18) 0%, transparent 70%)" }}
      />



      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.2) 30%, rgba(253,230,138,0.4) 50%, rgba(251,191,36,0.2) 70%, transparent)" }} />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-20 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={isInView ? { opacity: 1, letterSpacing: "0.28em" } : {}}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-5 inline-block text-[10px] font-bold uppercase tracking-[0.28em] text-amber-500"
          >
            INFORMACION SOBRE RKT
          </motion.span>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.6))" }} />
            <span className="text-[6px] text-amber-400">◆</span>
            <span className="h-px w-16" style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.6), transparent)" }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.18, ease: EASE }}
            className="mb-4 text-4xl font-black uppercase leading-none tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #D97706 0%, #FDE68A 45%, #F59E0B 100%)" }}>
              INFORMACION SOBRE RKT
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            className="max-w-md text-base leading-relaxed text-white/78 md:text-lg"
          >
            Todo lo que necesitas saber sobre el RKT en detalle aquí.
          </motion.p>
        </div>

        <div className="relative flex flex-col items-center gap-6">
          <div className="relative w-full">
            <div className="pointer-events-none absolute left-0 right-0 -translate-y-1/2 rounded-full" style={{ top: "calc(20px + 0.5rem)", height: 3, background: "rgba(120,53,15,0.18)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)" }} />
            <div className="pointer-events-none absolute left-0 right-0 -translate-y-1/2 rounded-full" style={{ top: "calc(20px + 0.5rem)", height: 3, background: "linear-gradient(90deg, rgba(251,191,36,0.04) 0%, rgba(251,191,36,0.1) 50%, rgba(251,191,36,0.04) 100%)" }} />
            <div className="pointer-events-none absolute left-0 right-0 overflow-hidden rounded-full -translate-y-1/2" style={{ top: "calc(20px + 0.5rem)", height: 3 }}>
              <motion.div
                className="absolute inset-y-0 left-0 right-0 rounded-full"
                initial={{ scaleX: 0, originX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.4, delay: 0.38, ease: EASE }}
                style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.12) 0%, rgba(253,230,138,0.65) 50%, rgba(251,191,36,0.12) 100%)", boxShadow: "0 0 8px rgba(253,230,138,0.45), 0 0 2px rgba(253,230,138,0.9)" }}
              />
              <motion.div
                className="absolute inset-y-0 w-32 rounded-full"
                animate={isInView ? { left: ["-15%", "115%"] } : { left: "-15%" }}
                transition={{ duration: 2.2, delay: 1.9, ease: [0.4, 0, 0.6, 1], repeat: Infinity, repeatDelay: 4 }}
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,245,180,0.55), transparent)", filter: "blur(3px)" }}
              />
            </div>

            <div className="relative z-10 flex items-end justify-between px-0">
              {NODES.map((node, index) => (
                <TimelineDot key={node.id} node={node} index={index} isActive={activeNode === node.id} onClick={() => handleDotClick(node.id)} />
              ))}
            </div>
          </div>

          <div className="w-full min-h-[1rem]">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <DetailPanel key={selectedNode.id} node={selectedNode} dotIndex={selectedNode.id} />
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="py-4 text-center text-[10px] uppercase tracking-[0.22em] text-white/20"
                >
                  Selecciona un punto para ver los detalles
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.15) 50%, transparent)" }} />
    </section>
  );
}
