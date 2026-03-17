"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { type DriverComment, type DriverRecord } from "@/lib/rkt-panel";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : "Error de servidor.";
    throw new Error(message);
  }

  return data as T;
}

type DriverStoreSnapshot = {
  drivers: DriverRecord[];
  loaded: boolean;
  error: string | null;
};

let snapshot: DriverStoreSnapshot = {
  drivers: [],
  loaded: false,
  error: null,
};

const listeners = new Set<() => void>();
let inFlightRefresh: Promise<void> | null = null;
let hasStartedInitialLoad = false;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: DriverStoreSnapshot) {
  snapshot = next;
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

async function loadDrivers(force = false) {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  if (!force && snapshot.loaded) {
    return;
  }

  inFlightRefresh = (async () => {
    const shouldShowLoading = snapshot.drivers.length === 0;

    if (shouldShowLoading) {
      setSnapshot({ ...snapshot, loaded: false, error: null });
    } else if (snapshot.error) {
      setSnapshot({ ...snapshot, error: null });
    }

    try {
      const data = await parseResponse<DriverRecord[]>(await fetch("/api/pilots", { cache: "no-store" }));
      setSnapshot({ drivers: data, loaded: true, error: null });
    } catch (fetchError) {
      setSnapshot({
        ...snapshot,
        loaded: true,
        error: fetchError instanceof Error ? fetchError.message : "No se han podido cargar los pilotos.",
      });
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

export function useDriverStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const refresh = useCallback(async () => {
    await loadDrivers(true);
  }, []);

  useEffect(() => {
    if (hasStartedInitialLoad) {
      return;
    }

    hasStartedInitialLoad = true;
    void loadDrivers();
  }, []);

  const upsertDriver = useCallback(async (driver: DriverRecord) => {
    const exists = snapshot.drivers.some((item) => item.id === driver.id);
    const response = await fetch(exists ? `/api/pilots/${driver.id}` : "/api/pilots", {
      method: exists ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(driver),
    });

    const savedDriver = await parseResponse<DriverRecord>(response);

    const index = snapshot.drivers.findIndex((item) => item.id === savedDriver.id);
    if (index === -1) {
      setSnapshot({ ...snapshot, drivers: [savedDriver, ...snapshot.drivers], error: null, loaded: true });
    } else {
      const next = [...snapshot.drivers];
      next[index] = savedDriver;
      setSnapshot({ ...snapshot, drivers: next, error: null, loaded: true });
    }

    return savedDriver;
  }, []);

  const addComment = useCallback(async (driverId: string, comment: DriverComment) => {
    const currentDriver = snapshot.drivers.find((driver) => driver.id === driverId);

    if (!currentDriver) {
      throw new Error("Piloto no encontrado.");
    }

    const updatedDriver: DriverRecord = {
      ...currentDriver,
      comments: [comment, ...currentDriver.comments],
    };

    return upsertDriver(updatedDriver);
  }, [upsertDriver]);

  const removeDriver = useCallback(async (driverId: string) => {
    const response = await fetch(`/api/pilots/${driverId}`, { method: "DELETE" });
    await parseResponse<{ success: boolean }>(response);
    setSnapshot({ ...snapshot, drivers: snapshot.drivers.filter((driver) => driver.id !== driverId), error: null, loaded: true });
  }, []);

  const getDriverById = useCallback(
    (id: string) => snapshot.drivers.find((driver) => driver.id === id),
    [],
  );

  return useMemo(
    () => ({
      drivers: state.drivers,
      loaded: state.loaded,
      error: state.error,
      refresh,
      upsertDriver,
      addComment,
      removeDriver,
      getDriverById,
    }),
    [addComment, getDriverById, refresh, removeDriver, state.drivers, state.error, state.loaded, upsertDriver],
  );
}
