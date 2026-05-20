import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  ensurePilotSeedData,
  ensureTrainingSessionsSeedData,
} from "@/lib/rkt-panel-server";
import { type DriverRecord } from "@/lib/rkt-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await ensurePilotSeedData();
    await ensureTrainingSessionsSeedData();

    const session = await prisma.trainingSession.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        time: true,
        duration: true,
        maxPilots: true,
        assignments: {
          select: {
            pilot: {
              select: {
                id: true,
                name: true,
                age: true,
                dni: true,
                phone: true,
                email: true,
                category: true,
                status: true,
                photo: true,
                internalNotes: true,
                insuranceAccepted: true,
                liabilitySigned: true,
                imageAccepted: true,
                confirmedAt: true,
                confirmedBy: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: session.id,
        name: session.name,
        time: session.time,
        duration: session.duration,
        maxPilots: session.maxPilots,
        pilots: session.assignments.map(({ pilot }) => ({
          id: pilot.id,
          name: pilot.name,
          age: pilot.age,
          dni: pilot.dni,
          phone: pilot.phone,
          email: pilot.email,
          category: pilot.category as DriverRecord["category"],
          status: pilot.status as DriverRecord["status"],
          photo: pilot.photo || "/logos/logo_rkt.png",
          documentation: {
            insuranceAccepted: pilot.insuranceAccepted,
            liabilitySigned: pilot.liabilitySigned,
            imageAccepted: pilot.imageAccepted,
          },
          history: {
            registeredAt: pilot.createdAt.toISOString(),
            confirmedAt: (pilot.confirmedAt ?? pilot.createdAt).toISOString(),
            confirmedBy: pilot.confirmedBy,
          },
          comments: [],
          internalNotes: pilot.internalNotes,
        })),
        laps: [],
        sanctions: [],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido cargar la sesión.", details: String(error) },
      { status: 500 },
    );
  }
}
