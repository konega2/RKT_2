import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  ensurePilotSeedData,
  ensureTrainingSessionsSeedData,
} from "@/lib/rkt-panel-server";
import type { TrainingSessionSummaryRecord } from "@/lib/rkt-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await ensurePilotSeedData();
    await ensureTrainingSessionsSeedData();

    const sessions = await prisma.trainingSession.findMany({
      select: {
        id: true,
        name: true,
        time: true,
        maxPilots: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: { time: "asc" },
    });

    const payload: TrainingSessionSummaryRecord[] = sessions.map((session) => ({
      id: session.id,
      name: session.name,
      time: session.time,
      maxPilots: session.maxPilots,
      assignedPilots: session._count.assignments,
    }));

    return NextResponse.json(payload, {
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
