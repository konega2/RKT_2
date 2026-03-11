import { prisma } from "@/lib/prisma";
import { DEFAULT_DRIVERS, DEFAULT_TRAINING_SESSIONS } from "@/lib/rkt-panel";
import { ensureTrainingSessionsSeedData } from "@/lib/rkt-panel-server";

export interface LandingTrainingPilot {
  id: string;
  name: string;
  photo: string;
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

function getFallbackLandingData(): LandingData {
  return {
    confirmedPilots: DEFAULT_DRIVERS.filter((driver) => driver.status === "CONFIRMED").length,
    sessions: DEFAULT_TRAINING_SESSIONS.map((session) => ({
      id: `fallback-${session.time}`,
      time: session.time,
      name: session.name,
      maxPilots: 24,
      pilots: [],
    })),
  };
}

export async function getLandingData(): Promise<LandingData> {
  try {
    await ensureTrainingSessionsSeedData();

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
                  photo: true,
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
          photo: assignment.pilot.photo || "/logos/logo_rkt.png",
        })),
      })),
    };
  } catch (error) {
    console.error("Fallo al cargar landing desde DB, usando fallback local.", error);
    return getFallbackLandingData();
  }
}