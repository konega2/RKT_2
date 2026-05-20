import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sessions = await prisma.trainingSession.findMany({
      select: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    const trainingSessionsTotal = sessions.reduce(
      (total, session) => total + session._count.assignments,
      0,
    );

    return NextResponse.json(
      { trainingSessionsTotal },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido obtener el recuento.", details: String(error) },
      { status: 500 },
    );
  }
}