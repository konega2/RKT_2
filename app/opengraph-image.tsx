import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rental Karting Trophy (RKT)";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#000000",
          color: "#FFFFFF",
          overflow: "hidden",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 55% 65% at 50% 42%, rgba(245,158,11,0.55) 0%, rgba(245,158,11,0.18) 42%, transparent 78%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(130deg, transparent 0%, transparent 48%, rgba(245,158,11,0.08) 52%, transparent 58%, transparent 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            padding: "56px 72px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.02, letterSpacing: -1.5 }}>
            <div>ARE YOU READY</div>
            <div>TO BE THE FIRST</div>
            <div style={{ color: "#FBBF24" }}>CHAMPION?</div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.92 }}>
            Rental Karting Trophy
          </div>

          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 1.5, color: "#FBBF24" }}>
            3–4 julio 2026 · Chiva, Valencia
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
