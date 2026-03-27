import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeTrainingSession } from "@/lib/rkt-panel-server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as { pilotId?: string };

    if (!body.pilotId) {
      return NextResponse.json({ error: "pilotId es obligatorio." }, { status: 400 });
    }

    const session = await prisma.trainingSession.findUnique({
      where: { id: params.id },
      include: { assignments: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    const pilot = await prisma.pilot.findUnique({
      where: { id: body.pilotId },
      select: { id: true, status: true },
    });

    if (!pilot) {
      return NextResponse.json({ error: "Piloto no encontrado." }, { status: 404 });
    }

    if (pilot.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Solo se pueden asignar pilotos confirmados." }, { status: 409 });
    }

    const alreadyAssigned = session.assignments.some((assignment) => assignment.pilotId === body.pilotId);

    if (alreadyAssigned) {
      return NextResponse.json({ error: "El piloto ya está asignado a esta sesión." }, { status: 409 });
    }

    if (session.assignments.length >= session.maxPilots) {
      return NextResponse.json({ error: "Sesión completa." }, { status: 409 });
    }

    await prisma.trainingAssignment.create({
      data: {
        pilotId: body.pilotId,
        sessionId: params.id,
      },
    });

    const updatedSession = await prisma.trainingSession.findUnique({
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

    if (!updatedSession) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    return NextResponse.json(serializeTrainingSession(updatedSession), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido asignar el piloto.", details: String(error) },
      { status: 500 },
    );
  }
}
