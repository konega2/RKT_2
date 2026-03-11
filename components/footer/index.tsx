import Image from "next/image";

const currentYear = new Date().getFullYear();

export function FooterSection() {
  return (
    <footer id="footer" aria-label="Footer del evento" className="relative overflow-hidden py-0">

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: "radial-gradient(ellipse at center bottom, rgba(245,158,11,0.22) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full bg-black/30 px-6 pt-3 pb-8 backdrop-blur-sm sm:px-8 sm:pt-4 sm:pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <Image
                src="/logos/logo_rkt.png"
                alt="Rental Karting Trophy"
                width={170}
                height={58}
                className="h-auto w-[130px] sm:w-[160px]"
              />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
                Evento oficial de karting de alquiler con igualdad en pista, formato competitivo y ambiente de alto nivel.
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.26em] text-amber-300/90">Evento</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>3–4 julio 2026</li>
                <li>Kartódromo Internacional Lucas Guerrero</li>
                <li>Chiva · Valencia · España</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.26em] text-amber-300/90">Enlaces</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>
                  <a href="#event-info" className="transition hover:text-amber-200">
                    Información del evento
                  </a>
                </li>
                <li>
                  <a href="#final-cta" className="transition hover:text-amber-200">
                    Reserva tu plaza
                  </a>
                </li>
                <li>
                  <a
                    href="https://kartodromovalencia.com/pre-inscripcion/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-amber-200"
                  >
                    Pre-inscripción
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 text-center text-xs uppercase tracking-[0.18em] text-white/60 sm:flex-row sm:text-left">
            <p>© {currentYear} Rental Karting Trophy</p>
            <p>RKT · All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
