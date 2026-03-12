/**
 * Fondo global fijo que cubre toda la pantalla.
 * z-index: -1 → siempre detrás de cualquier contenido.
 *
 * Visual: negro profundo + rayas diagonales doradas estilo motorsport
 * (misma estética que el hero pero cubriendo todo el scroll).
 * Las rayas se animan con un drift horizontal muy suave.
 */

// Paths inspirados en los streaks del Hero pero con mayor cobertura vertical
// para que rellenen toda la pantalla fija sin huecos.
const STREAKS = [
  {
    id: 0,
    d: "M -420 1080 C 20 780 460 460 900 180 C 1220 -24 1530 -168 1880 -300",
    outer: "#78350F",
    mid: "#D97706",
    core: "#FDE68A",
    outerOp: 0.07,
    midOp: 0.15,
    coreOp: 0.32,
  },
  {
    id: 1,
    d: "M -520 900 C -60 630 420 340 880 80 C 1200 -100 1520 -210 1860 -320",
    outer: "#78350F",
    mid: "#F59E0B",
    core: "#FEF3C7",
    outerOp: 0.05,
    midOp: 0.11,
    coreOp: 0.24,
  },
  {
    id: 2,
    d: "M -340 730 C 100 510 510 250 930 20 C 1230 -140 1540 -248 1880 -350",
    outer: "#78350F",
    mid: "#B45309",
    core: "#FDE68A",
    outerOp: 0.04,
    midOp: 0.09,
    coreOp: 0.18,
  },
  {
    id: 3,
    d: "M -480 1240 C 10 910 520 580 980 270 C 1300 58 1610 -88 1940 -220",
    outer: "#78350F",
    mid: "#D97706",
    core: "#FDE68A",
    outerOp: 0.05,
    midOp: 0.10,
    coreOp: 0.20,
  },
  {
    id: 4,
    d: "M -600 560 C -60 380 400 170 900 -40 C 1220 -190 1550 -290 1900 -390",
    outer: "#92400E",
    mid: "#F59E0B",
    core: "#FEF3C7",
    outerOp: 0.03,
    midOp: 0.07,
    coreOp: 0.14,
  },
  {
    id: 5,
    d: "M -300 1380 C 100 1020 560 660 1010 360 C 1320 148 1620 8 1960 -130",
    outer: "#78350F",
    mid: "#D97706",
    core: "#FDE68A",
    outerOp: 0.03,
    midOp: 0.07,
    coreOp: 0.13,
  },
  {
    id: 6,
    d: "M -700 400 C -120 260 360 80 900 -110 C 1220 -240 1540 -330 1880 -420",
    outer: "#78350F",
    mid: "#B45309",
    core: "#FDE68A",
    outerOp: 0.02,
    midOp: 0.05,
    coreOp: 0.10,
  },
] as const;

export function GlobalBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    >
      {/* Base negro profundo */}
      <div className="absolute inset-0 bg-black" />

      {/* Glow dorado suave centrado en la parte alta (zona hero) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_18%,rgba(212,175,55,0.19)_0%,rgba(212,175,55,0.08)_42%,transparent_74%)]" />

      {/* Glow secundario suave en la parte baja */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(180,83,9,0.1)_0%,transparent_68%)]" />

      {/* Rayas diagonales doradas animadas — drift horizontal muy lento */}
      <svg
        aria-hidden
        className="bg-streaks absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {STREAKS.map((s) => (
          <g key={s.id}>
            {/* Capa exterior — halo difuso */}
            <path
              d={s.d}
              fill="none"
              stroke={s.outer}
              strokeWidth="18"
              opacity={s.outerOp}
              strokeLinecap="round"
            />
            {/* Capa media */}
            <path
              d={s.d}
              fill="none"
              stroke={s.mid}
              strokeWidth="4"
              opacity={s.midOp}
              strokeLinecap="round"
            />
            {/* Núcleo brillante */}
            <path
              d={s.d}
              fill="none"
              stroke={s.core}
              strokeWidth="1.2"
              opacity={s.coreOp}
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      {/* Viñeta perimetral para oscurecer los bordes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_100%_at_50%_50%,transparent_45%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
