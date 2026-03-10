"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { type DriverComment, type DriverRecord } from "@/lib/rkt-panel";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : "Error de servidor.";
    throw new Error(message);
  }

  return data as T;
}

export function useDriverStore() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await parseResponse<DriverRecord[]>(await fetch("/api/pilots", { cache: "no-store" }));
      setDrivers(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "No se han podido cargar los pilotos.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsertDriver = useCallback(async (driver: DriverRecord) => {
    const exists = drivers.some((item) => item.id === driver.id);
    const response = await fetch(exists ? `/api/pilots/${driver.id}` : "/api/pilots", {
      method: exists ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(driver),
    });

    const savedDriver = await parseResponse<DriverRecord>(response);

    setDrivers((current) => {
      const index = current.findIndex((item) => item.id === savedDriver.id);
      if (index === -1) {
        return [savedDriver, ...current];
      }

      const next = [...current];
      next[index] = savedDriver;
      return next;
    });

    return savedDriver;
  }, [drivers]);

  const addComment = useCallback(async (driverId: string, comment: DriverComment) => {
    const currentDriver = drivers.find((driver) => driver.id === driverId);

    if (!currentDriver) {
      throw new Error("Piloto no encontrado.");
    }

    const updatedDriver: DriverRecord = {
      ...currentDriver,
      comments: [comment, ...currentDriver.comments],
    };

    return upsertDriver(updatedDriver);
  }, [drivers, upsertDriver]);

  const removeDriver = useCallback(async (driverId: string) => {
    const response = await fetch(`/api/pilots/${driverId}`, { method: "DELETE" });
    await parseResponse<{ success: boolean }>(response);
    setDrivers((current) => current.filter((driver) => driver.id !== driverId));
  }, []);

  const getDriverById = useCallback(
    (id: string) => drivers.find((driver) => driver.id === id),
    [drivers],
  );

  return useMemo(
    () => ({
      drivers,
      loaded,
      error,
      refresh,
      upsertDriver,
      addComment,
      removeDriver,
      getDriverById,
    }),
    [addComment, drivers, error, getDriverById, loaded, refresh, removeDriver, upsertDriver],
  );
}
