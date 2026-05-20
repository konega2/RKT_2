import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const trainingSessionsTotal = await prisma.trainingSession.count();

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