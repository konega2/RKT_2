import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  ensurePilotSeedData,
  ensureTrainingSessionsSeedData,
} from "@/lib/rkt-panel-server";
import type { DriverCategory, TrainingPilotSummaryRecord } from "@/lib/rkt-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await ensurePilotSeedData();
    await ensureTrainingSessionsSeedData();

    const pilots = await prisma.pilot.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        category: true,
      },
      orderBy: { name: "asc" },
    });

    const sessions = await prisma.trainingSession.findMany({
      select: {
        id: true,
        name: true,
        time: true,
        assignments: {
          select: {
            pilot: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { time: "asc" },
    });

    const byPilot = new Map<string, TrainingPilotSummaryRecord>(
      pilots
        .filter((pilot) => pilot.status === "CONFIRMED")
        .map((pilot) => [pilot.id, {
          pilotId: pilot.id,
          pilotName: pilot.name,
          categories: (Array.isArray(pilot.category) ? pilot.category : []) as DriverCategory[],
          fpCount: 0,
          sessions: [],
        }]),
    );

    sessions.forEach((session) => {
      session.assignments.forEach(({ pilot }) => {
        const current = byPilot.get(pilot.id);

        if (!current) {
          return;
        }

        current.fpCount += 1;
        current.sessions.push({
          sessionId: session.id,
          sessionName: session.name,
          time: session.time,
        });

        byPilot.set(pilot.id, current);
      });
    });

    const payload = Array.from(byPilot.values())
      .map((entry) => ({
        ...entry,
        sessions: [...entry.sessions].sort((left, right) => left.time.localeCompare(right.time)),
      }))
      .sort((left, right) => right.fpCount - left.fpCount || left.pilotName.localeCompare(right.pilotName, "es"));

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido generar el resumen de pilotos.", details: String(error) },
      { status: 500 },
    );
  }
}