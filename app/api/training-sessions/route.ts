import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  ensurePilotSeedData,
  ensureTrainingSessionsSeedData,
  serializeTrainingSession,
} from "@/lib/rkt-panel-server";

export async function GET() {
  try {
    await ensurePilotSeedData();
    await ensureTrainingSessionsSeedData();

    const sessions = await prisma.trainingSession.findMany({
      include: {
        assignments: {
          include: {
            pilot: {
              include: { comments: true },
            },
          },
        },
      },
      orderBy: { time: "asc" },
    });

    return NextResponse.json(sessions.map(serializeTrainingSession));
  } catch (error) {
    return NextResponse.json(
      { error: "No se han podido cargar las sesiones.", details: String(error) },
      { status: 500 },
    );
  }
}
