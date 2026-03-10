import type { Comment, Pilot } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { DEFAULT_DRIVERS, type DriverComment, type DriverRecord } from "@/lib/rkt-panel";

type PilotWithComments = Pilot & { comments: Comment[] };

export function serializePilot(pilot: PilotWithComments): DriverRecord {
  return {
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
    comments: pilot.comments
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map<DriverComment>((comment) => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      })),
    internalNotes: pilot.internalNotes,
  };
}

export function pilotCreateInputFromRecord(record: DriverRecord) {
  return {
    name: record.name,
    age: record.age,
    dni: record.dni,
    phone: record.phone,
    email: record.email,
    category: record.category,
    status: record.status,
    photo: record.photo,
    internalNotes: record.internalNotes,
    insuranceAccepted: record.documentation.insuranceAccepted,
    liabilitySigned: record.documentation.liabilitySigned,
    imageAccepted: record.documentation.imageAccepted,
    confirmedAt: new Date(record.history.confirmedAt),
    confirmedBy: record.history.confirmedBy,
    createdAt: new Date(record.history.registeredAt),
    comments: {
      create: record.comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        createdAt: new Date(comment.createdAt),
      })),
    },
  };
}

export async function ensurePilotSeedData() {
  const existing = await prisma.pilot.count();

  if (existing > 0) {
    return;
  }

  for (const driver of DEFAULT_DRIVERS) {
    await prisma.pilot.create({
      data: {
        id: driver.id,
        ...pilotCreateInputFromRecord(driver),
      },
    });
  }
}
