import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const confirmedPilots = await prisma.pilot.count({
      where: { status: "Activo" },
    });

    return NextResponse.json(
      { confirmedPilots },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "No se ha podido obtener el recuento.", details: String(error) },
      { status: 500 },
    );
  }
}
