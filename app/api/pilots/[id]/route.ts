import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { serializePilot } from "@/lib/rkt-panel-server";
import { type DriverRecord } from "@/lib/rkt-panel";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const pilot = await prisma.pilot.findUnique({
      where: { id: params.id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });

    if (!pilot) {
      return NextResponse.json({ error: "Piloto no encontrado." }, { status: 404 });
    }

    return NextResponse.json(serializePilot(pilot));
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido cargar el piloto.", details: String(error) },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as DriverRecord;

    const pilot = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.comment.deleteMany({ where: { pilotId: params.id } });

      const isConfirmed = body.status === "CONFIRMED";

      return tx.pilot.update({
        where: { id: params.id },
        data: {
          name: body.name,
          age: body.age,
          dni: body.dni,
          phone: body.phone,
          email: body.email,
          category: body.category,
          status: body.status,
          photo: body.photo,
          internalNotes: body.internalNotes,
          insuranceAccepted: body.documentation.insuranceAccepted,
          liabilitySigned: body.documentation.liabilitySigned,
          imageAccepted: body.documentation.imageAccepted,
          confirmedAt: isConfirmed ? new Date(body.history.confirmedAt) : null,
          confirmedBy: isConfirmed ? body.history.confirmedBy : "Pendiente",
          comments: {
            create: body.comments.map((comment) => ({
              id: comment.id,
              text: comment.text,
              createdAt: new Date(comment.createdAt),
            })),
          },
        },
        include: { comments: { orderBy: { createdAt: "desc" } } },
      });
    });

    return NextResponse.json(serializePilot(pilot));
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido actualizar el piloto.", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.pilot.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido eliminar el piloto.", details: String(error) },
      { status: 500 },
    );
  }
}
