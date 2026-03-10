import { prisma } from "@/lib/prisma";

export interface LandingTrainingPilot {
  id: string;
  name: string;
}

export interface LandingTrainingSession {
  id: string;
  time: string;
  name: string;
  maxPilots: number;
  pilots: LandingTrainingPilot[];
}

export interface LandingData {
  confirmedPilots: number;
  sessions: LandingTrainingSession[];
}

export async function getLandingData(): Promise<LandingData> {
  const [confirmedPilots, sessions] = await Promise.all([
    prisma.pilot.count({
      where: { status: "CONFIRMED" },
    }),
    prisma.trainingSession.findMany({
      orderBy: { time: "asc" },
      select: {
        id: true,
        time: true,
        name: true,
        maxPilots: true,
        assignments: {
          select: {
            pilot: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    confirmedPilots,
    sessions: sessions.map((session) => ({
      id: session.id,
      time: session.time,
      name: session.name,
      maxPilots: session.maxPilots,
      pilots: session.assignments.map((assignment) => ({
        id: assignment.pilot.id,
        name: assignment.pilot.name,
      })),
    })),
  };
}