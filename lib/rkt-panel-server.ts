import { prisma } from "@/lib/prisma";
import {
  DEFAULT_DRIVERS,
  DEFAULT_TRAINING_SESSIONS,
  type DriverComment,
  type DriverRecord,
  type TrainingSessionRecord,
} from "@/lib/rkt-panel";

type PilotWithComments = {
  id: string;
  name: string;
  age: number;
  dni: string;
  phone: string;
  email: string;
  category: string;
  status: string;
  photo: string | null;
  internalNotes: string;
  insuranceAccepted: boolean;
  liabilitySigned: boolean;
  imageAccepted: boolean;
  confirmedAt: Date | null;
  confirmedBy: string;
  createdAt: Date;
  comments: Array<{
    id: string;
    text: string;
    createdAt: Date;
    pilotId: string;
  }>;
};

type TrainingSessionWithAssignments = {
  id: string;
  name: string;
  time: string;
  duration: number;
  maxPilots: number;
  assignments: Array<{
    id: string;
    pilot: PilotWithComments;
  }>;
};

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
      .sort(
        (a: PilotWithComments["comments"][number], b: PilotWithComments["comments"][number]) =>
          b.createdAt.getTime() - a.createdAt.getTime(),
      )
      .map<DriverComment>((comment: PilotWithComments["comments"][number]) => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      })),
    internalNotes: pilot.internalNotes,
  };
}

export function pilotCreateInputFromRecord(record: DriverRecord) {
  const isConfirmed = record.status === "CONFIRMED";

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
    confirmedAt: isConfirmed ? new Date(record.history.confirmedAt) : null,
    confirmedBy: isConfirmed ? record.history.confirmedBy : "Pendiente",
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

export function serializeTrainingSession(session: TrainingSessionWithAssignments): TrainingSessionRecord {
  return {
    id: session.id,
    name: session.name,
    time: session.time,
    duration: session.duration,
    maxPilots: session.maxPilots,
    pilots: session.assignments.map((assignment) => serializePilot(assignment.pilot)),
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

export async function ensureTrainingSessionsSeedData() {
  const existing = await prisma.trainingSession.count();

  if (existing > 0) {
    await prisma.trainingSession.updateMany({
      data: { maxPilots: 24 },
    });
    return;
  }

  await prisma.trainingSession.createMany({
    data: DEFAULT_TRAINING_SESSIONS.map((session) => ({
      name: session.name,
      time: session.time,
      duration: 10,
      maxPilots: 24,
    })),
  });
}
