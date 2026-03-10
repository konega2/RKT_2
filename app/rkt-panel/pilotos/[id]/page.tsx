"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { PanelShell } from "@/components/rkt-panel/panel-shell";
import { useDriverStore } from "@/components/rkt-panel/use-driver-store";
import {
  DRIVER_CATEGORIES,
  DRIVER_STATUSES,
  formatPanelDate,
  type DriverCategory,
  type DriverRecord,
  type DriverStatus,
} from "@/lib/rkt-panel";

function DriverPhoto({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill unoptimized className="object-contain p-6" />;
}

export default function RktPanelDriverDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const driverId = params.id;
  const { loaded, getDriverById, upsertDriver, addComment, removeDriver } = useDriverStore();
  const driver = useMemo(() => getDriverById(driverId), [driverId, getDriverById]);
  const [form, setForm] = useState<DriverRecord | null>(null);
  const [commentText, setCommentText] = useState("");
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (driver) {
      setForm({
        ...driver,
        documentation: { ...driver.documentation },
        history: { ...driver.history },
        comments: [...driver.comments],
      });
    }
  }, [driver]);

  function updateField<K extends keyof DriverRecord>(key: K, value: DriverRecord[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
  }

  function updateDocumentation(key: keyof DriverRecord["documentation"], value: boolean) {
    setForm((current) =>
      current
        ? { ...current, documentation: { ...current.documentation, [key]: value } }
        : current,
    );
    setSaved(false);
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const photoData = reader.result;

      if (typeof photoData === "string") {
        setForm((current) => {
          if (!current) {
            return current;
          }

          const next: DriverRecord = { ...current, photo: photoData };

          if (isEditing) {
            setSaved(false);
          } else {
            void upsertDriver(next);
            setSaved(true);
          }

          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleOpenPhotoPicker() {
    const input = photoInputRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  function handleSave() {
    if (!form) {
      return;
    }

    upsertDriver(form);
    setSaved(true);
    setIsEditing(false);
  }

  function handleAddComment() {
    if (!form || !commentText.trim() || !isEditing) {
      return;
    }

    const comment = {
      id: `${form.id}-${Date.now()}`,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    addComment(form.id, comment);
    setForm({ ...form, comments: [comment, ...form.comments] });
    setCommentText("");
    setSaved(false);
  }

  function handleDelete() {
    if (!form) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar a ${form.name} del panel? Esta acción no se puede deshacer.`);

    if (!confirmed) {
      return;
    }

    removeDriver(form.id);
    router.push("/rkt-panel/pilotos");
  }

  if (!loaded) {
    return (
      <PanelShell heading="Ficha de piloto" kicker="Pilotos confirmados">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-white/60">Cargando ficha...</div>
      </PanelShell>
    );
  }

  if (!driver || !form) {
    return (
      <PanelShell heading="Ficha de piloto" kicker="Pilotos confirmados">
        <div className="rounded-[28px] border border-amber-500/10 bg-white/[0.03] p-8 text-white/60">No se ha encontrado el piloto solicitado.</div>
      </PanelShell>
    );
  }

  return (
    <PanelShell heading={form.name} kicker="Ficha de piloto">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setIsEditing((current) => !current);
            setSaved(false);
          }}
          className="rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-500/20"
        >
          {isEditing ? "Cancelar edición" : "Editar"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-red-200 transition hover:border-red-400/50 hover:bg-red-500/18"
        >
          Eliminar
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="overflow-hidden rounded-[28px] border border-amber-500/15 bg-white/[0.03] backdrop-blur-xl">
            <div className="aspect-[0.86] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_45%),linear-gradient(180deg,#090909_0%,#050505_100%)]">
              <DriverPhoto src={form.photo} alt={form.name} />
            </div>
            <div className="border-t border-amber-500/10 p-5">
              <div className="block space-y-2">
                <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">Actualizar foto</span>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenPhotoPicker}
                    className="rounded-2xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-500/18"
                  >
                    Seleccionar archivo
                  </button>
                  <span className="text-sm text-white/45">
                    {form.photo === "/logos/logo_rkt.png"
                      ? "Usando imagen por defecto"
                      : "Imagen personalizada cargada"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">Documentación</p>
            <div className="mt-4 space-y-3">
              {[
                ["Seguro aceptado", "insuranceAccepted"],
                ["Responsabilidad firmada", "liabilitySigned"],
                ["Imagen aceptada", "imageAccepted"],
              ].map(([label, key]) => (
                <label key={key} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-white/75">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    disabled={!isEditing}
                    checked={form.documentation[key as keyof DriverRecord["documentation"]]}
                    onChange={(event) => updateDocumentation(key as keyof DriverRecord["documentation"], event.target.checked)}
                    className="h-4 w-4 accent-amber-400 disabled:cursor-not-allowed disabled:opacity-45"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">Historial admin</p>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                <span className="text-white/35">Fecha inscripción</span>
                <p className="mt-1 text-white">{formatPanelDate(form.history.registeredAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                <span className="text-white/35">Fecha confirmación</span>
                <p className="mt-1 text-white">{formatPanelDate(form.history.confirmedAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                <span className="text-white/35">Confirmado por</span>
                <p className="mt-1 text-white">{form.history.confirmedBy}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="space-y-6"
        >
          <div className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Nombre", value: form.name, onChange: (value: string) => updateField("name", value) },
                { label: "Edad", value: String(form.age), onChange: (value: string) => updateField("age", Number(value || 0)) },
                { label: "DNI", value: form.dni, onChange: (value: string) => updateField("dni", value) },
                { label: "Teléfono", value: form.phone, onChange: (value: string) => updateField("phone", value) },
                { label: "Email", value: form.email, onChange: (value: string) => updateField("email", value) },
              ].map(({ label, value, onChange }) => (
                <label key={label} className="block space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">{label}</span>
                  <input
                    value={value}
                    disabled={!isEditing}
                    onChange={(event) => onChange(event.target.value)}
                    className="w-full rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45 disabled:cursor-not-allowed disabled:opacity-55"
                  />
                </label>
              ))}

              <label className="block space-y-2">
                <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">Categoría</span>
                <select
                  value={form.category}
                  disabled={!isEditing}
                  onChange={(event) => updateField("category", event.target.value as DriverCategory)}
                  className="w-full rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {DRIVER_CATEGORIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">Estado piloto</span>
                <select
                  value={form.status}
                  disabled={!isEditing}
                  onChange={(event) => updateField("status", event.target.value as DriverStatus)}
                  className="w-full rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {DRIVER_STATUSES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">Comentarios internos</p>
            <div className="mt-4 space-y-3">
              <textarea
                value={commentText}
                disabled={!isEditing}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Añadir comentario del equipo..."
                className="min-h-[110px] w-full rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-amber-400/45 disabled:cursor-not-allowed disabled:opacity-55"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!isEditing}
                className="rounded-2xl border border-amber-300/25 bg-amber-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-500/18 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Añadir comentario
              </button>
              <div className="space-y-3">
                {form.comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-white/68">
                    <p>{comment.text}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-amber-300/55">{formatPanelDate(comment.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-500/15 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">Observaciones internas</p>
            <textarea
              value={form.internalNotes}
              disabled={!isEditing}
              onChange={(event) => updateField("internalNotes", event.target.value)}
              className="mt-4 min-h-[160px] w-full rounded-2xl border border-amber-500/15 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/45 disabled:cursor-not-allowed disabled:opacity-55"
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm text-white/45">
                {isEditing
                  ? saved
                    ? "Ficha guardada correctamente."
                    : "Modo edición activo."
                  : "Ficha en modo lectura."}
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isEditing}
                className="rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Guardar ficha
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </PanelShell>
  );
}
