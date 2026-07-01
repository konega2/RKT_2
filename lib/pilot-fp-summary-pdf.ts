"use client";

import jsPDF from "jspdf";

import { type DriverCategory, type TrainingPilotSummaryRecord } from "@/lib/rkt-panel";

type GeneratePilotFpSummaryPdfInput = {
  generatedAt: Date;
  pilots: TrainingPilotSummaryRecord[];
  logoPath?: string;
};

function getCategoryBadgeStyle(category: DriverCategory | "Sin categoría") {
  switch (category) {
    case "Junior":
      return { fill: [233, 249, 252] as const, text: [10, 132, 163] as const, border: [167, 234, 246] as const };
    case "Master":
      return { fill: [255, 251, 235] as const, text: [161, 98, 7] as const, border: [253, 230, 138] as const };
    case "Femina":
      return { fill: [253, 242, 248] as const, text: [190, 24, 93] as const, border: [251, 207, 232] as const };
    case "Overall":
      return { fill: [241, 239, 255] as const, text: [91, 33, 182] as const, border: [216, 204, 255] as const };
    default:
      return { fill: [243, 244, 246] as const, text: [75, 85, 99] as const, border: [209, 213, 219] as const };
  }
}

function renderCategoryBadges(doc: jsPDF, categories: DriverCategory[], startX: number, startY: number) {
  const labels: Array<DriverCategory | "Sin categoría"> =
    categories.length > 0 ? [...categories] : ["Sin categoría"];
  const gapX = 1.8;
  const paddingX = 2.4;
  const badgeHeight = 4.8;
  const fontSize = 7.1;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);

  let cursorX = startX;

  labels.forEach((label) => {
    const style = getCategoryBadgeStyle(label);
    const badgeWidth = doc.getTextWidth(label) + paddingX * 2;

    doc.setFillColor(style.fill[0], style.fill[1], style.fill[2]);
    doc.setDrawColor(style.border[0], style.border[1], style.border[2]);
    doc.setTextColor(style.text[0], style.text[1], style.text[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(cursorX, startY, badgeWidth, badgeHeight, 2.4, 2.4, "FD");
    doc.text(String(label).toUpperCase(), cursorX + paddingX, startY + 3.45);

    cursorX += badgeWidth + gapX;
  });

  return badgeHeight;
}

function truncateTextToWidth(doc: jsPDF, text: string, maxWidth: number) {
  if (doc.getTextWidth(text) <= maxWidth) {
    return text;
  }

  let result = text;

  while (result.length > 0 && doc.getTextWidth(`${result}…`) > maxWidth) {
    result = result.slice(0, -1);
  }

  return result.length > 0 ? `${result}…` : "…";
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

export async function generatePilotFpSummaryPdf({
  generatedAt,
  pilots,
  logoPath = "/logos/logo_rkt.png",
}: GeneratePilotFpSummaryPdfInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const left = 12;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  const logoDataUrl = await loadImageDataUrl(logoPath);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", left, 10, 20, 20);
  }

  doc.setTextColor(15, 15, 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("RESUMEN FP", logoDataUrl ? 36 : left, 18);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Pilotos, número de FP y horario asignado", logoDataUrl ? 36 : left, 24);

  const formattedDate = generatedAt.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  doc.text(`Fecha: ${formattedDate}`, 198, 20, { align: "right" });

  const columns = [
    { title: "PILOTO", width: 74 },
    { title: "FP", width: 18 },
    { title: "HORARIOS", width: 94 },
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

  function ensureSpace(cursorY: number, requiredHeight: number) {
    if (cursorY + requiredHeight <= 278) {
      return cursorY;
    }

    doc.addPage();
    const nextCursorY = 14;
    drawHeader(nextCursorY);
    return nextCursorY + 8;
  }

  let cursorY = 38;
  drawHeader(cursorY);
  cursorY += 8;

  const sortedPilots = [...pilots].sort((leftPilot, rightPilot) => {
    return rightPilot.fpCount - leftPilot.fpCount || leftPilot.pilotName.localeCompare(rightPilot.pilotName, "es");
  });

  sortedPilots.forEach((pilot, index) => {
    const scheduleText = pilot.sessions.map((session) => `${session.sessionName} · ${session.time}`).join(" | ");
    const wrappedFp = doc.splitTextToSize(String(pilot.fpCount), columns[1].width - 2);
    const wrappedSchedule = doc.splitTextToSize(scheduleText || "—", columns[2].width - 2);
    const badgeLabels: Array<DriverCategory | "Sin categoría"> =
      pilot.categories.length > 0 ? [...pilot.categories] : ["Sin categoría"];
    const badgeGap = 1.8;
    const badgePaddingX = 2.4;
    const badgeHeight = 4.8;
    const badgeFontSize = 7.1;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(badgeFontSize);

    const badgeWidths = badgeLabels.map((label) => doc.getTextWidth(label.toUpperCase()) + badgePaddingX * 2);
    const badgesTotalWidth = badgeWidths.reduce((sum, width, badgeIndex) => sum + width + (badgeIndex > 0 ? badgeGap : 0), 0);
    const pilotNameMaxWidth = Math.max(18, columns[0].width - 2 - badgesTotalWidth - 2.2);
    const pilotName = truncateTextToWidth(doc, pilot.pilotName, pilotNameMaxWidth);

    const pilotCellHeight = badgeHeight + 3.2;
    const fpCellHeight = wrappedFp.length * 4.6;
    const scheduleCellHeight = wrappedSchedule.length * 4.6;
    const rowHeight = Math.max(11, pilotCellHeight, fpCellHeight, scheduleCellHeight) + 2.4;

    cursorY = ensureSpace(cursorY, rowHeight);

    doc.setFillColor(index % 2 === 0 ? 248 : 241, index % 2 === 0 ? 248 : 241, index % 2 === 0 ? 248 : 241);
    doc.rect(left, cursorY, 186, rowHeight, "F");

    doc.setTextColor(20, 20, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.2);
    const pilotTextY = cursorY + 4.9;
    doc.text(pilotName, left + 1.5, pilotTextY);

    let badgeX = left + 1.5 + doc.getTextWidth(pilotName) + 2.2;
    badgeLabels.forEach((label, badgeIndex) => {
      const style = getCategoryBadgeStyle(label);
      const badgeWidth = badgeWidths[badgeIndex];

      doc.setFillColor(style.fill[0], style.fill[1], style.fill[2]);
      doc.setDrawColor(style.border[0], style.border[1], style.border[2]);
      doc.setTextColor(style.text[0], style.text[1], style.text[2]);
      doc.setLineWidth(0.25);
      doc.roundedRect(badgeX, cursorY + 1.2, badgeWidth, badgeHeight, 2.4, 2.4, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(badgeFontSize);
      doc.text(String(label).toUpperCase(), badgeX + badgePaddingX, cursorY + 4.55);

      badgeX += badgeWidth + badgeGap;
    });

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.2);
    doc.text(wrappedFp, left + columns[0].width + 1.5, cursorY + 4.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    doc.text(wrappedSchedule, left + columns[0].width + columns[1].width + 1.5, cursorY + 4.8);

    cursorY += rowHeight;
  });

  if (pilots.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text("No hay pilotos asignados en este momento.", left, cursorY + 6);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text("Generated by RKT System", pageWidth / 2, 289, { align: "center" });

  const safeDate = generatedAt.toISOString().slice(0, 10);
  doc.save(`resumen-fp-pilotos-${safeDate}.pdf`);
}