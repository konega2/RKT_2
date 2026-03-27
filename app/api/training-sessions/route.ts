import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  ensurePilotSeedData,
  ensureTrainingSessionsSeedData,
  serializeTrainingSession,
} from "@/lib/rkt-panel-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await ensurePilotSeedData();
    await ensureTrainingSessionsSeedData();

    const sessions = await prisma.trainingSession.findMany({
      include: {
        laps: true,
        sanctions: true,
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

    return NextResponse.json(sessions.map(serializeTrainingSession), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se han podido cargar las sesiones.", details: String(error) },
      { status: 500 },
    );
  }
}
