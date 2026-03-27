"use client";

interface LiveTimingReplayControlsProps {
  availableLaps: number[];
  selectedLap: number | null;
  currentLap: number;
  isPlaying: boolean;
  replaySpeed: number;
  isDragging: boolean;
  onChangeLap: (lap: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  onChangeSpeed: (speed: number) => void;
  onTogglePlay: () => void;
  onGoLive: () => void;
}

export function LiveTimingReplayControls({
  availableLaps,
  selectedLap,
  currentLap,
  isPlaying,
  replaySpeed,
  isDragging,
  onChangeLap,
  onScrubStart,
  onScrubEnd,
  onChangeSpeed,
  onTogglePlay,
  onGoLive,
}: LiveTimingReplayControlsProps) {
  const maxLap = availableLaps[availableLaps.length - 1] ?? 0;
  const hasReplayData = maxLap > 0;
  const clampedLap = Math.min(Math.max(currentLap, 1), Math.max(1, maxLap));
  const currentRealLap = Math.max(1, Math.floor(clampedLap));
  const thumbPercent = maxLap <= 1 ? 0 : ((clampedLap - 1) / (maxLap - 1)) * 100;

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!hasReplayData}
          className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <button
          type="button"
          onClick={onGoLive}
          className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-amber-300/35 hover:text-amber-100"
        >
          Live
        </button>

        <div className="relative min-w-[94px]">
          <select
            value={String(replaySpeed)}
            onChange={(event) => onChangeSpeed(Number(event.target.value))}
            className="w-full appearance-none rounded-xl border border-white/15 bg-black/35 px-3 py-2 pr-7 text-xs font-semibold uppercase tracking-[0.08em] text-white/85 outline-none transition hover:border-amber-300/35"
            aria-label="Velocidad del replay"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[10px] text-amber-200/80">▾</span>
        </div>

        <span className="ml-auto text-xs uppercase tracking-[0.16em] text-white/60">
          {selectedLap === null
            ? hasReplayData
              ? `LIVE · Vuelta ${currentRealLap} / ${maxLap}`
              : "LIVE"
            : `Vuelta ${currentRealLap} / ${maxLap}`}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between text-[11px] text-white/55">
          <span>{isDragging ? "Scrub" : "Replay"}</span>
          <span className="font-semibold text-amber-100">Vuelta {currentRealLap}</span>
        </div>
        <div className="relative">
          <div
            className={`pointer-events-none absolute -top-7 z-10 rounded-md border border-amber-300/35 bg-black/80 px-2 py-1 text-[11px] font-semibold text-amber-100 ${
              isDragging ? "transition-none" : "transition-all duration-200 ease-in-out"
            }`}
            style={{
              left: `${thumbPercent}%`,
              transform: "translateX(-50%)",
            }}
          >
            Vuelta {currentRealLap}
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-2 -translate-y-1/2">
            {availableLaps.map((lap) => {
              const markPercent = maxLap <= 1 ? 0 : ((lap - 1) / (maxLap - 1)) * 100;
              return (
                <span
                  key={lap}
                  className="absolute h-2 w-[2px] rounded bg-white/30"
                  style={{ left: `${markPercent}%`, transform: "translateX(-50%)" }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min={1}
            max={Math.max(1, maxLap)}
            step={0.01}
            value={clampedLap}
            onChange={(event) => onChangeLap(Number(event.target.value))}
            onMouseDown={onScrubStart}
            onTouchStart={onScrubStart}
            onMouseUp={onScrubEnd}
            onTouchEnd={onScrubEnd}
            disabled={!hasReplayData}
            className="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/15 accent-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Selector de vuelta replay"
            title={`Vuelta ${currentRealLap}`}
          />
        </div>
        <div className="relative mt-2 h-4 text-[11px] text-white/45">
          {(hasReplayData ? availableLaps : [1]).map((lap) => {
            const markPercent = maxLap <= 1 ? 0 : ((lap - 1) / (maxLap - 1)) * 100;
            return (
              <span
                key={`label-${lap}`}
                className="absolute"
                style={{ left: `${markPercent}%`, transform: "translateX(-50%)" }}
              >
                V{lap}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
