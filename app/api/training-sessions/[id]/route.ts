import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  ensurePilotSeedData,
  ensureTrainingSessionsSeedData,
  serializeTrainingSession,
} from "@/lib/rkt-panel-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await ensurePilotSeedData();
    await ensureTrainingSessionsSeedData();

    const session = await prisma.trainingSession.findUnique({
      where: { id: params.id },
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
    });

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    return NextResponse.json(serializeTrainingSession(session), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido cargar la sesión.", details: String(error) },
      { status: 500 },
    );
  }
}
