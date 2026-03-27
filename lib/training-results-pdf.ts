"use client";

import jsPDF from "jspdf";

import { type LiveClassificationEntry, type TrainingSanctionRecord } from "@/lib/rkt-panel";

type GenerateTrainingResultsPdfInput = {
  eventName: string;
  trainingName: string;
  generatedAt: Date;
  classification: LiveClassificationEntry[];
  sanctions: TrainingSanctionRecord[];
  logoPath?: string;
};

function formatLapTime(value: number) {
  return `${value.toFixed(3)}s`;
}

function formatGap(value: number) {
  if (value <= 0) {
    return "—";
  }

  return `+${value.toFixed(3)}`;
}

function formatPilotSanctions(
  pilotId: string,
  sanctions: TrainingSanctionRecord[],
  timePenaltySeconds: number,
) {
  const pilotSanctions = sanctions.filter((sanction) => sanction.pilotoId === pilotId);

  if (pilotSanctions.length === 0) {
    return "—";
  }

  const chunks: string[] = [];

  if (timePenaltySeconds > 0) {
    chunks.push(`+${timePenaltySeconds.toFixed(1)}s`);
  }

  pilotSanctions
    .filter((sanction) => sanction.tipo === "lap_deleted")
    .forEach((sanction) => {
      const laps = sanction.vueltas.length > 0 ? sanction.vueltas.join(",") : "última";
      chunks.push(`DEL V${laps}`);
    });

  return chunks.length > 0 ? chunks.join(" | ") : "⚠️";
}

async function loadImageDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateTrainingResultsPdf({
  eventName,
  trainingName,
  generatedAt,
  classification,
  sanctions,
  logoPath = "/logos/logo_rkt.png",
}: GenerateTrainingResultsPdfInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const left = 12;
  const right = 198;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  const logoDataUrl = await loadImageDataUrl(logoPath);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", left, 10, 20, 20);
  }

  doc.setTextColor(15, 15, 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("RESULTADOS OFICIALES", logoDataUrl ? 36 : left, 18);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(eventName, logoDataUrl ? 36 : left, 24);
  doc.text(`Entrenamiento: ${trainingName}`, logoDataUrl ? 36 : left, 29);

  const formattedDate = generatedAt.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  doc.text(`Fecha: ${formattedDate}`, right, 20, { align: "right" });

  const columns = [
    { title: "POS", width: 14 },
    { title: "PILOTO", width: 48 },
    { title: "KART", width: 16 },
    { title: "MEJOR VUELTA", width: 30 },
    { title: "GAP", width: 18 },
    { title: "SANCIONES", width: 60 },
  ] as const;

  function drawHeader(y: number) {
    let x = left;

    doc.setFillColor(245, 191, 36);
    doc.rect(left, y, 186, 8, "F");

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.2);

    columns.forEach((column) => {
      doc.text(column.title, x + 1.5, y + 5.4);
      x += column.width;
    });
  }

  let cursorY = 38;
  drawHeader(cursorY);
  cursorY += 8;

  const leaderBest = classification[0]?.mejorVuelta ?? null;

  classification.forEach((entry, index) => {
    const position = index + 1;
    const gap = leaderBest === null ? 0 : entry.mejorVuelta - leaderBest;
    const sanctionsText = formatPilotSanctions(entry.pilotoId, sanctions, entry.timePenaltySeconds);

    const rowCells = [
      `P${position}`,
      entry.pilotoNombre,
      `K${entry.kart}`,
      formatLapTime(entry.mejorVuelta),
      formatGap(gap),
      sanctionsText,
    ];

    const wrappedCells = rowCells.map((text, cellIndex) => doc.splitTextToSize(text, columns[cellIndex].width - 2));
    const maxLines = wrappedCells.reduce((best, lines) => Math.max(best, lines.length), 1);
    const rowHeight = Math.max(8, maxLines * 4.8 + 2.2);

    if (cursorY + rowHeight > 278) {
      doc.addPage();
      cursorY = 14;
      drawHeader(cursorY);
      cursorY += 8;
    }

    doc.setFillColor(index % 2 === 0 ? 248 : 241, index % 2 === 0 ? 248 : 241, index % 2 === 0 ? 248 : 241);
    doc.rect(left, cursorY, 186, rowHeight, "F");

    let x = left;
    doc.setTextColor(20, 20, 20);

    wrappedCells.forEach((lines, cellIndex) => {
      if (cellIndex === 0 && position === 1) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.2);
      } else if (cellIndex === 3 && entry.isBestOverall) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(9.5);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 20, 20);
        doc.setFontSize(9.2);
      }

      doc.text(lines, x + 1.5, cursorY + 4.8);
      x += columns[cellIndex].width;
    });

    cursorY += rowHeight;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text("Generated by RKT System", pageWidth / 2, 289, { align: "center" });

  const safeTrainingName = trainingName.replace(/\s+/g, "-").toLowerCase();
  doc.save(`resultados-oficiales-${safeTrainingName}.pdf`);
}
