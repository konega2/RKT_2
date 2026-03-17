import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ensurePilotSeedData, pilotCreateInputFromRecord, serializePilot } from "@/lib/rkt-panel-server";
import { type DriverRecord } from "@/lib/rkt-panel";

export async function GET() {
  try {
    await ensurePilotSeedData();

    const pilots = await prisma.pilot.findMany({
      include: { comments: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pilots.map(serializePilot));
  } catch (error) {
    return NextResponse.json(
      { error: "No se han podido cargar los pilotos.", details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DriverRecord;
    const record: DriverRecord = {
      ...body,
      status: body.status ?? "PENDING",
    };

    const pilot = await prisma.pilot.create({
      data: {
        ...pilotCreateInputFromRecord(record),
      },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json(serializePilot(pilot), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido crear el piloto.", details: String(error) },
      { status: 500 },
    );
  }
}
