import { prisma } from "@/lib/prisma";
import {
  type AddTrainingSanctionInput,
  type AddLapInput,
  type LiveClassificationEntry,
  type TrainingLapRecord,
  type TrainingSanctionRecord,
} from "@/lib/rkt-panel";

type AppliedSanctionsResult = {
  laps: TrainingLapRecord[];
  deletedLapNumbersByPilot: Map<string, Set<number>>;
  penalizedLapNumbersByPilot: Map<string, Set<number>>;
  timePenaltySecondsByPilot: Map<string, number>;
};

type UpdateLapInput = {
  tiempo?: number;
  kart?: string;
  lapNumber?: number;
};

function normalizeLapTime(value: number) {
  return Math.round(value * 1000) / 1000;
}

function randomLapTime(min: number, max: number) {
  return normalizeLapTime(Math.random() * (max - min) + min);
}

function randomKart() {
  return String(Math.floor(Math.random() * 24) + 1);
}

function normalizeLapNumberList(values: number[]) {
  const normalized = values
    .filter((value) => Number.isFinite(value) && value >= 1)
    .map((value) => Math.floor(value));

  return Array.from(new Set(normalized)).sort((first, second) => first - second);
}

function mapSetToRecord(input: Map<string, Set<number>>) {
  const output: Record<string, number[]> = {};

  input.forEach((values, pilotId) => {
    const numericValues: number[] = [];
    values.forEach((value) => {
      numericValues.push(value);
    });

    output[pilotId] = numericValues.sort((first, second) => first - second);
  });

  return output;
}

function mapNumberToRecord(input: Map<string, number>) {
  const output: Record<string, number> = {};

  input.forEach((value, pilotId) => {
    output[pilotId] = value;
  });

  return output;
}

function resolveAffectedLaps(
  pilotLaps: TrainingLapRecord[],
  sanctionLaps: number[],
) {
  const normalized = normalizeLapNumberList(sanctionLaps);

  if (normalized.length > 0) {
    return normalized;
  }

  const latestLapNumber = pilotLaps[pilotLaps.length - 1]?.lapNumber;
  return typeof latestLapNumber === "number" ? [latestLapNumber] : [];
}

function dbLapToRecord(lap: {
  id: string;
  pilotId: string;
  pilotName: string;
  kart: string;
  tiempo: number;
  lapNumber: number;
  createdAt: Date;
}): TrainingLapRecord {
  return {
    id: lap.id,
    pilotoId: lap.pilotId,
    pilotoNombre: lap.pilotName,
    kart: lap.kart,
    tiempo: normalizeLapTime(lap.tiempo),
    lapNumber: lap.lapNumber,
    createdAt: lap.createdAt.getTime(),
  };
}

function dbSanctionToRecord(sanction: {
  id: string;
  pilotId: string;
  tipo: "time_penalty" | "lap_deleted";
  valor: number;
  vueltas: number[];
  motivo: string;
  createdAt: Date;
}): TrainingSanctionRecord {
  return {
    id: sanction.id,
    pilotoId: sanction.pilotId,
    tipo: sanction.tipo,
    valor: sanction.valor,
    vueltas: sanction.vueltas,
    motivo: sanction.motivo,
    createdAt: sanction.createdAt.getTime(),
  };
}

export async function getTrainingLaps(trainingId: string): Promise<TrainingLapRecord[]> {
  const laps = await prisma.trainingLap.findMany({
    where: { sessionId: trainingId },
    orderBy: { createdAt: "asc" },
  });

  return laps.map(dbLapToRecord);
}

export async function getTrainingSanctions(trainingId: string): Promise<TrainingSanctionRecord[]> {
  const sanctions = await prisma.trainingSanction.findMany({
    where: { sessionId: trainingId },
    orderBy: { createdAt: "asc" },
  });

  return sanctions.map(dbSanctionToRecord);
}

export async function addLap(trainingId: string, lapData: AddLapInput): Promise<TrainingLapRecord> {
  const pilotLapsCount = await prisma.trainingLap.count({
    where: {
      sessionId: trainingId,
      pilotId: lapData.pilotoId,
    },
  });

  const lap = await prisma.trainingLap.create({
    data: {
      sessionId: trainingId,
      pilotId: lapData.pilotoId,
      pilotName: lapData.pilotoNombre,
      kart: lapData.kart,
      tiempo: normalizeLapTime(lapData.tiempo),
      lapNumber: pilotLapsCount + 1,
    },
  });

  return dbLapToRecord(lap);
}

export async function addTrainingSanction(
  trainingId: string,
  sanctionData: AddTrainingSanctionInput,
): Promise<TrainingSanctionRecord> {
  const normalizedLaps = normalizeLapNumberList(sanctionData.vueltas);
  const normalizedValue = sanctionData.tipo === "time_penalty" ? Math.max(0, Number(sanctionData.valor ?? 0)) : 0;
  const normalizedReason = sanctionData.motivo.trim();

  const potentialDuplicates = await prisma.trainingSanction.findMany({
    where: {
      sessionId: trainingId,
      pilotId: sanctionData.pilotoId,
      tipo: sanctionData.tipo,
      valor: normalizedValue,
      motivo: normalizedReason,
    },
  });

  const duplicated = potentialDuplicates.find((sanction) =>
    sanction.vueltas.length === normalizedLaps.length
    && sanction.vueltas.every((lapNumber, index) => lapNumber === normalizedLaps[index]),
  );

  if (duplicated) {
    return dbSanctionToRecord(duplicated);
  }

  const sanction = await prisma.trainingSanction.create({
    data: {
      sessionId: trainingId,
      pilotId: sanctionData.pilotoId,
      tipo: sanctionData.tipo,
      valor: normalizedValue,
      vueltas: normalizedLaps,
      motivo: normalizedReason,
    },
  });

  return dbSanctionToRecord(sanction);
}

export function applySanctions(
  laps: TrainingLapRecord[],
  sanctions: TrainingSanctionRecord[],
): AppliedSanctionsResult {
  const deletedLapNumbersByPilot = new Map<string, Set<number>>();
  const penalizedLapNumbersByPilot = new Map<string, Set<number>>();
  const timePenaltySecondsByPilot = new Map<string, number>();

  for (const sanction of sanctions) {
    const pilotLaps = laps
      .filter((lap) => lap.pilotoId === sanction.pilotoId)
      .sort((first, second) => first.lapNumber - second.lapNumber);

    if (pilotLaps.length === 0) {
      continue;
    }

    const affectedLapNumbers = resolveAffectedLaps(pilotLaps, sanction.vueltas);

    if (affectedLapNumbers.length === 0) {
      continue;
    }

    if (sanction.tipo === "lap_deleted") {
      const deletedSet = deletedLapNumbersByPilot.get(sanction.pilotoId) ?? new Set<number>();
      affectedLapNumbers.forEach((lapNumber) => deletedSet.add(lapNumber));
      deletedLapNumbersByPilot.set(sanction.pilotoId, deletedSet);
      continue;
    }

    const penalizedSet = penalizedLapNumbersByPilot.get(sanction.pilotoId) ?? new Set<number>();
    affectedLapNumbers.forEach((lapNumber) => penalizedSet.add(lapNumber));
    penalizedLapNumbersByPilot.set(sanction.pilotoId, penalizedSet);

    const previousPenalty = timePenaltySecondsByPilot.get(sanction.pilotoId) ?? 0;
    timePenaltySecondsByPilot.set(sanction.pilotoId, previousPenalty + Math.max(0, sanction.valor));
  }

  const sanitizedLaps = laps.filter((lap) => {
    const deletedLaps = deletedLapNumbersByPilot.get(lap.pilotoId);
    return !deletedLaps?.has(lap.lapNumber);
  });

  return {
    laps: sanitizedLaps,
    deletedLapNumbersByPilot,
    penalizedLapNumbersByPilot,
    timePenaltySecondsByPilot,
  };
}

function buildClassificationFromLaps(
  laps: TrainingLapRecord[],
  sanctions: TrainingSanctionRecord[],
): LiveClassificationEntry[] {
  const applied = applySanctions(laps, sanctions);
  const byPilot = new Map<
    string,
    {
      pilotoId: string;
      pilotoNombre: string;
      kart: string;
      ultimaVuelta: number;
      mejorVuelta: number;
      totalVueltas: number;
    }
  >();

  for (const lap of applied.laps) {
    const current = byPilot.get(lap.pilotoId);

    if (!current) {
      byPilot.set(lap.pilotoId, {
        pilotoId: lap.pilotoId,
        pilotoNombre: lap.pilotoNombre,
        kart: lap.kart,
        ultimaVuelta: lap.tiempo,
        mejorVuelta: lap.tiempo,
        totalVueltas: 1,
      });
      continue;
    }

    current.pilotoNombre = lap.pilotoNombre;
    current.kart = lap.kart;
    current.ultimaVuelta = lap.tiempo;
    current.totalVueltas += 1;

    if (lap.tiempo < current.mejorVuelta) {
      current.mejorVuelta = lap.tiempo;
    }
  }

  const pilotEntries = Array.from(byPilot.values());
  const withPenalty = pilotEntries.map((entry) => {
    const timePenaltySeconds = applied.timePenaltySecondsByPilot.get(entry.pilotoId) ?? 0;
    const hasDeletedLaps = (applied.deletedLapNumbersByPilot.get(entry.pilotoId)?.size ?? 0) > 0;
    return {
      ...entry,
      mejorVuelta: entry.mejorVuelta + timePenaltySeconds,
      hasSanction: hasDeletedLaps || timePenaltySeconds > 0,
      timePenaltySeconds,
    };
  });

  const globalBestLap = withPenalty.reduce(
    (best, entry) => (entry.mejorVuelta < best ? entry.mejorVuelta : best),
    Number.POSITIVE_INFINITY,
  );

  return withPenalty
    .map<LiveClassificationEntry>((entry) => ({
      ...entry,
      isPersonalBest: true,
      isBestOverall: entry.mejorVuelta === globalBestLap,
    }))
    .sort((first, second) => first.mejorVuelta - second.mejorVuelta);
}

export async function getLiveClassification(trainingId: string): Promise<LiveClassificationEntry[]> {
  const [laps, sanctions] = await Promise.all([
    getTrainingLaps(trainingId),
    getTrainingSanctions(trainingId),
  ]);

  return buildClassificationFromLaps(laps, sanctions);
}

export async function getClassificationAtLap(
  trainingId: string,
  lapNumber: number,
): Promise<LiveClassificationEntry[]> {
  if (!Number.isFinite(lapNumber) || lapNumber < 1) {
    return [];
  }

  const [laps, sanctions] = await Promise.all([
    getTrainingLaps(trainingId),
    getTrainingSanctions(trainingId),
  ]);

  const filteredLaps = laps.filter((lap) => lap.lapNumber <= lapNumber);
  const filteredSanctions = sanctions.filter((sanction) =>
    sanction.vueltas.some((value) => value <= lapNumber),
  );

  return buildClassificationFromLaps(filteredLaps, filteredSanctions);
}

export async function getAvailableLaps(trainingId: string): Promise<number[]> {
  const laps = await getTrainingLaps(trainingId);
  const uniqueLapNumbers = new Set<number>();

  for (const lap of laps) {
    uniqueLapNumbers.add(lap.lapNumber);
  }

  return Array.from(uniqueLapNumbers).sort((first, second) => first - second);
}

async function cleanupSanctionsForPilotLapNumber(
  trainingId: string,
  pilotId: string,
  removedLapNumber: number,
) {
  const sanctions = await prisma.trainingSanction.findMany({
    where: {
      sessionId: trainingId,
      pilotId,
    },
  });

  for (const sanction of sanctions) {
    const filteredLaps = sanction.vueltas.filter((lap) => lap !== removedLapNumber);

    if (filteredLaps.length === 0) {
      await prisma.trainingSanction.delete({ where: { id: sanction.id } });
      continue;
    }

    await prisma.trainingSanction.update({
      where: { id: sanction.id },
      data: { vueltas: filteredLaps },
    });
  }
}

async function remapSanctionsForPilotLapNumber(
  trainingId: string,
  pilotId: string,
  previousLapNumber: number,
  nextLapNumber: number,
) {
  if (previousLapNumber === nextLapNumber) {
    return;
  }

  const sanctions = await prisma.trainingSanction.findMany({
    where: {
      sessionId: trainingId,
      pilotId,
    },
  });

  for (const sanction of sanctions) {
    const remapped = sanction.vueltas.map((lapNumber) =>
      lapNumber === previousLapNumber ? nextLapNumber : lapNumber,
    );

    const normalized = Array.from(new Set(remapped)).sort((first, second) => first - second);
    await prisma.trainingSanction.update({
      where: { id: sanction.id },
      data: { vueltas: normalized },
    });
  }
}

export async function updateLap(
  trainingId: string,
  lapId: string,
  updatedData: UpdateLapInput,
): Promise<TrainingLapRecord | null> {
  const previousLap = await prisma.trainingLap.findFirst({
    where: {
      id: lapId,
      sessionId: trainingId,
    },
  });

  if (!previousLap) {
    return null;
  }

  if (typeof updatedData.tiempo === "number") {
    if (!Number.isFinite(updatedData.tiempo) || updatedData.tiempo <= 0) {
      throw new Error("El tiempo debe ser mayor que 0.");
    }
  }

  if (typeof updatedData.lapNumber === "number") {
    if (!Number.isFinite(updatedData.lapNumber) || updatedData.lapNumber < 1) {
      throw new Error("lapNumber debe ser un número mayor o igual a 1.");
    }
  }

  const normalizedLapNumber =
    typeof updatedData.lapNumber === "number" ? Math.floor(updatedData.lapNumber) : previousLap.lapNumber;

  const updatedLap = await prisma.trainingLap.update({
    where: { id: lapId },
    data: {
      tiempo:
        typeof updatedData.tiempo === "number"
          ? normalizeLapTime(updatedData.tiempo)
          : previousLap.tiempo,
      kart:
        typeof updatedData.kart === "string" && updatedData.kart.trim()
          ? updatedData.kart.trim()
          : previousLap.kart,
      lapNumber: normalizedLapNumber,
    },
  });

  await remapSanctionsForPilotLapNumber(
    trainingId,
    updatedLap.pilotId,
    previousLap.lapNumber,
    updatedLap.lapNumber,
  );

  return dbLapToRecord(updatedLap);
}

export async function deleteLap(trainingId: string, lapId: string): Promise<TrainingLapRecord | null> {
  const lap = await prisma.trainingLap.findFirst({
    where: {
      id: lapId,
      sessionId: trainingId,
    },
  });

  if (!lap) {
    return null;
  }

  const removedLap = await prisma.trainingLap.delete({
    where: { id: lap.id },
  });

  await cleanupSanctionsForPilotLapNumber(trainingId, removedLap.pilotId, removedLap.lapNumber);

  return dbLapToRecord(removedLap);
}

export async function getSanctionsImpact(trainingId: string) {
  const [laps, sanctions] = await Promise.all([
    getTrainingLaps(trainingId),
    getTrainingSanctions(trainingId),
  ]);

  const applied = applySanctions(laps, sanctions);

  return {
    deletedLapNumbersByPilot: mapSetToRecord(applied.deletedLapNumbersByPilot),
    penalizedLapNumbersByPilot: mapSetToRecord(applied.penalizedLapNumbersByPilot),
    timePenaltySecondsByPilot: mapNumberToRecord(applied.timePenaltySecondsByPilot),
  };
}

export async function addMockLap(trainingId: string): Promise<TrainingLapRecord | null> {
  const session = await prisma.trainingSession.findUnique({
    where: { id: trainingId },
    include: {
      assignments: {
        include: {
          pilot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!session || session.assignments.length === 0) {
    return null;
  }

  const randomAssignment = session.assignments[Math.floor(Math.random() * session.assignments.length)];

  return addLap(trainingId, {
    pilotoId: randomAssignment.pilot.id,
    pilotoNombre: randomAssignment.pilot.name,
    kart: randomKart(),
    tiempo: randomLapTime(49.2, 57.8),
  });
}
