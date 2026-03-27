import { NextResponse } from "next/server";

import {
  addMockLap,
  getAvailableLaps,
  getLiveClassification,
  getSanctionsImpact,
  getTrainingLaps,
  getTrainingSanctions,
} from "@/lib/training-laps";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const trainingId = params.id;
    const lap = await addMockLap(trainingId);

    if (!lap) {
      return NextResponse.json(
        { error: "No hay pilotos asignados para simular vueltas." },
        { status: 409 },
      );
    }

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
      { error: "No se ha podido generar una vuelta simulada.", details: String(error) },
      { status: 500 },
    );
  }
}
