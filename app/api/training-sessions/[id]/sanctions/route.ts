import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import type { AddTrainingSanctionInput } from "@/lib/rkt-panel";
import {
  addTrainingSanction,
  getAvailableLaps,
  getLiveClassification,
  getSanctionsImpact,
  getTrainingLaps,
  getTrainingSanctions,
} from "@/lib/training-laps";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const trainingId = params.id;
  const [sanctions, sanctionsImpact] = await Promise.all([
    getTrainingSanctions(trainingId),
    getSanctionsImpact(trainingId),
  ]);

  return NextResponse.json({
    trainingId,
    sanctions,
    sanctionsImpact,
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const trainingId = params.id;
    const body = (await request.json()) as Partial<AddTrainingSanctionInput>;

    if (!body.pilotoId || !body.tipo || !body.motivo?.trim()) {
      return NextResponse.json(
        { error: "pilotoId, tipo y motivo son obligatorios." },
        { status: 400 },
      );
    }

    if (body.tipo !== "time_penalty" && body.tipo !== "lap_deleted") {
      return NextResponse.json({ error: "Tipo de sanción inválido." }, { status: 400 });
    }

    const session = await prisma.trainingSession.findUnique({
      where: { id: trainingId },
      include: {
        assignments: {
          select: {
            pilotId: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    const isAssigned = session.assignments.some((assignment) => assignment.pilotId === body.pilotoId);

    if (!isAssigned) {
      return NextResponse.json(
        { error: "El piloto no está asignado a este entrenamiento." },
        { status: 409 },
      );
    }

    const laps = await getTrainingLaps(trainingId);
    const lapsOfPilot = laps.filter((lap) => lap.pilotoId === body.pilotoId);

    if (lapsOfPilot.length === 0) {
      return NextResponse.json(
        { error: "El piloto no tiene vueltas en esta sesión." },
        { status: 409 },
      );
    }

    const normalizedLaps = Array.isArray(body.vueltas)
      ? body.vueltas
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value >= 1)
          .map((value) => Math.floor(value))
      : [];

    if (body.tipo === "lap_deleted" && normalizedLaps.length === 0) {
      return NextResponse.json(
        { error: "Selecciona al menos una vuelta para eliminar." },
        { status: 400 },
      );
    }

    if (body.tipo === "time_penalty" && (!body.valor || Number(body.valor) <= 0)) {
      return NextResponse.json(
        { error: "Indica segundos de penalización mayores que 0." },
        { status: 400 },
      );
    }

    const sanction = await addTrainingSanction(trainingId, {
      pilotoId: body.pilotoId,
      tipo: body.tipo,
      valor: body.tipo === "time_penalty" ? Number(body.valor) : 0,
      vueltas: normalizedLaps,
      motivo: body.motivo,
    });

    const [sanctions, sanctionsImpact, updatedLaps, classification, availableLaps] = await Promise.all([
      getTrainingSanctions(trainingId),
      getSanctionsImpact(trainingId),
      getTrainingLaps(trainingId),
      getLiveClassification(trainingId),
      getAvailableLaps(trainingId),
    ]);

    return NextResponse.json(
      {
        sanction,
        sanctions,
        sanctionsImpact,
        laps: updatedLaps,
        classification,
        availableLaps,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido aplicar la sanción.", details: String(error) },
      { status: 500 },
    );
  }
}
