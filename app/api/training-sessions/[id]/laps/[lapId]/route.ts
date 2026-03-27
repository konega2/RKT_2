import { NextResponse } from "next/server";

import {
  deleteLap,
  getAvailableLaps,
  getLiveClassification,
  getSanctionsImpact,
  getTrainingLaps,
  getTrainingSanctions,
  updateLap,
} from "@/lib/training-laps";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type UpdateLapBody = {
  tiempo?: number;
  kart?: string;
  lapNumber?: number;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; lapId: string } },
) {
  try {
    const body = (await request.json()) as UpdateLapBody;

    if (body.tiempo !== undefined && (typeof body.tiempo !== "number" || body.tiempo <= 0)) {
      return NextResponse.json({ error: "El tiempo debe ser mayor que 0." }, { status: 400 });
    }

    const updatedLap = await updateLap(params.id, params.lapId, body);

    if (!updatedLap) {
      return NextResponse.json({ error: "Vuelta no encontrada." }, { status: 404 });
    }

    const [laps, classification, availableLaps, sanctions, sanctionsImpact] = await Promise.all([
      getTrainingLaps(params.id),
      getLiveClassification(params.id),
      getAvailableLaps(params.id),
      getTrainingSanctions(params.id),
      getSanctionsImpact(params.id),
    ]);

    return NextResponse.json({
      lap: updatedLap,
      laps,
      classification,
      availableLaps,
      sanctions,
      sanctionsImpact,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido actualizar la vuelta.", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; lapId: string } },
) {
  try {
    const removedLap = await deleteLap(params.id, params.lapId);

    if (!removedLap) {
      return NextResponse.json({ error: "Vuelta no encontrada." }, { status: 404 });
    }

    const [laps, classification, availableLaps, sanctions, sanctionsImpact] = await Promise.all([
      getTrainingLaps(params.id),
      getLiveClassification(params.id),
      getAvailableLaps(params.id),
      getTrainingSanctions(params.id),
      getSanctionsImpact(params.id),
    ]);

    return NextResponse.json({
      lap: removedLap,
      laps,
      classification,
      availableLaps,
      sanctions,
      sanctionsImpact,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido eliminar la vuelta.", details: String(error) },
      { status: 500 },
    );
  }
}
