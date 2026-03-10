import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeTrainingSession } from "@/lib/rkt-panel-server";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; pilotId: string } },
) {
  try {
    await prisma.trainingAssignment.deleteMany({
      where: {
        sessionId: params.id,
        pilotId: params.pilotId,
      },
    });

    const updatedSession = await prisma.trainingSession.findUnique({
      where: { id: params.id },
      include: {
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

    return NextResponse.json(serializeTrainingSession(updatedSession));
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido eliminar la asignación.", details: String(error) },
      { status: 500 },
    );
  }
}
