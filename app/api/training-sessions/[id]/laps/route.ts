import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  addLap,
  getAvailableLaps,
  getClassificationAtLap,
  getLiveClassification,
  getSanctionsImpact,
  getTrainingLaps,
  getTrainingSanctions,
} from "@/lib/training-laps";
import type { AddLapInput } from "@/lib/rkt-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const trainingId = params.id;
  const searchParams = new URL(request.url).searchParams;
  const rawLap = searchParams.get("lapNumber") ?? searchParams.get("lap");
  const parsedLap = rawLap ? Number(rawLap) : null;
  const selectedLap = parsedLap !== null && Number.isFinite(parsedLap) && parsedLap >= 1
    ? Math.floor(parsedLap)
    : null;

  const [laps, availableLaps, sanctions, sanctionsImpact, classification] = await Promise.all([
    getTrainingLaps(trainingId),
    getAvailableLaps(trainingId),
    getTrainingSanctions(trainingId),
    getSanctionsImpact(trainingId),
    selectedLap === null
      ? getLiveClassification(trainingId)
      : getClassificationAtLap(trainingId, selectedLap),
  ]);

  return NextResponse.json(
    {
      trainingId,
      laps,
      classification,
      availableLaps,
      sanctions,
      sanctionsImpact,
      selectedLap,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const trainingId = params.id;
    const body = (await request.json()) as Partial<AddLapInput>;

    if (!body.pilotoId || !body.kart || typeof body.tiempo !== "number") {
      return NextResponse.json(
        { error: "pilotoId, kart y tiempo son obligatorios." },
        { status: 400 },
      );
    }

    if (body.tiempo <= 0) {
      return NextResponse.json({ error: "El tiempo debe ser mayor que 0." }, { status: 400 });
    }

    const session = await prisma.trainingSession.findUnique({
      where: { id: trainingId },
      include: {
        assignments: {
          include: {
            pilot: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    const assignment = session.assignments.find((item) => item.pilot.id === body.pilotoId);

    if (!assignment) {
      return NextResponse.json(
        { error: "El piloto no está asignado a este entrenamiento." },
        { status: 409 },
      );
    }

    const lap = await addLap(trainingId, {
      pilotoId: body.pilotoId,
      pilotoNombre: body.pilotoNombre?.trim() || assignment.pilot.name,
      kart: body.kart,
      tiempo: body.tiempo,
    });

    const [laps, classification, availableLaps, sanctions, sanctionsImpact] = await Promise.all([
      getTrainingLaps(trainingId),
      getLiveClassification(trainingId),
      getAvailableLaps(trainingId),
      getTrainingSanctions(trainingId),
      getSanctionsImpact(trainingId),
    ]);

    return NextResponse.json(
      {
        lap,
        laps,
        classification,
        availableLaps,
        sanctions,
        sanctionsImpact,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido registrar la vuelta.", details: String(error) },
      { status: 500 },
    );
  }
}
