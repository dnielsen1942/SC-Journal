import { create } from "zustand";
import { db } from "../db";
import type { FlightPlan, FlightLogEntry } from "../types/flight.types";
import type { Location } from "../types/common.types";
import { createTimestamps, updateTimestamp } from "../types/common.types";
import { useAssetStore } from "./asset-store";
import { useCommodityStore } from "./commodity-store";

interface FlightStore {
  flights: FlightPlan[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (data: Omit<FlightPlan, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  update: (id: string, data: Partial<Omit<FlightPlan, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  // Status progression
  preflight: (id: string) => Promise<void>;
  depart: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  divert: (id: string) => Promise<void>;
  abort: (id: string) => Promise<void>;
  // Flight log
  addLogEntry: (flightId: string, entry: Omit<FlightLogEntry, "timestamp">) => Promise<void>;
}

export const useFlightStore = create<FlightStore>((set, get) => ({
  flights: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const flights = await db.flightPlans.orderBy("createdAt").reverse().toArray();
    set({ flights, loaded: true });
  },

  add: async (data) => {
    const entry: FlightPlan = { ...data, ...createTimestamps() };
    await db.flightPlans.add(entry);
    set((s) => ({ flights: [entry, ...s.flights] }));
  },

  update: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.flightPlans.update(id, updates);
    set((s) => ({
      flights: s.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },

  remove: async (id) => {
    await db.flightPlans.delete(id);
    set((s) => ({ flights: s.flights.filter((f) => f.id !== id) }));
  },

  preflight: async (id) => {
    const flight = get().flights.find((f) => f.id === id);
    if (!flight) return;

    const now = new Date().toISOString();
    const logEntry: FlightLogEntry = {
      timestamp: now,
      message: "Pre-flight checks initiated",
      type: "Milestone",
    };

    const updates = {
      status: "Pre-Flight",
      logEntries: [...(flight.logEntries || []), logEntry],
      ...updateTimestamp(),
    };

    await db.flightPlans.update(id, updates);
    set((s) => ({
      flights: s.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },

  depart: async (id) => {
    const flight = get().flights.find((f) => f.id === id);
    if (!flight) return;

    const now = new Date().toISOString();
    const logEntry: FlightLogEntry = {
      timestamp: now,
      message: `Departed from ${locationLabel(flight.origin)}`,
      type: "Milestone",
    };

    const updates = {
      status: "In Progress",
      departedAt: now,
      logEntries: [...(flight.logEntries || []), logEntry],
      ...updateTimestamp(),
    };

    await db.flightPlans.update(id, updates);
    set((s) => ({
      flights: s.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));

    // Cross-tab: set ship to "In Transit"
    const assetStore = useAssetStore.getState();
    if (flight.shipId) {
      await assetStore.updateShip(flight.shipId, { status: "In Transit" });
    }

    // Cross-tab: set linked hauling contracts to "In Transit" and create cargo crates
    const commodityStore = useCommodityStore.getState();
    await commodityStore.load();
    const linkedHaulingIds = flight.linkedHaulingIds || [];
    for (const hid of linkedHaulingIds) {
      const hauling = commodityStore.hauling.find((h) => h.id === hid);
      if (hauling && hauling.status !== "Completed" && hauling.status !== "Abandoned") {
        await commodityStore.updateHauling(hid, { status: "In Transit" });

        // Create a cargo crate for this hauling contract's cargo
        const cargoContents = Array.isArray(hauling.cargo)
          ? hauling.cargo.map((c) => ({ commodity: c.commodity, quantity: c.scu }))
          : [];
        if (cargoContents.length > 0) {
          await commodityStore.addCrate({
            name: `Hauling: ${hauling.title}`,
            contents: cargoContents,
            location: hauling.origin,
            shipId: flight.shipId,
            status: "In Transit",
          });
        }
      }
    }
  },

  complete: async (id) => {
    const flight = get().flights.find((f) => f.id === id);
    if (!flight) return;

    const now = new Date().toISOString();
    const logEntry: FlightLogEntry = {
      timestamp: now,
      message: `Arrived at ${locationLabel(flight.destination)}`,
      type: "Milestone",
    };

    const updates = {
      status: "Completed",
      arrivedAt: now,
      logEntries: [...(flight.logEntries || []), logEntry],
      ...updateTimestamp(),
    };

    await db.flightPlans.update(id, updates);
    set((s) => ({
      flights: s.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));

    // Cross-tab: update ship to "Active" at destination
    const assetStore = useAssetStore.getState();
    if (flight.shipId) {
      await assetStore.updateShip(flight.shipId, {
        status: "Active",
        location: flight.destination,
      });
    }

    // Cross-tab: update cargo crates on this ship to destination and "Delivered"
    const commodityStore = useCommodityStore.getState();
    await commodityStore.load();
    const shipCrates = commodityStore.crates.filter(
      (c) => c.shipId === flight.shipId && c.status === "In Transit"
    );
    for (const crate of shipCrates) {
      await commodityStore.updateCrate(crate.id, {
        location: flight.destination,
        status: "Delivered",
      });
    }
  },

  divert: async (id) => {
    const flight = get().flights.find((f) => f.id === id);
    if (!flight) return;

    const now = new Date().toISOString();
    const logEntry: FlightLogEntry = {
      timestamp: now,
      message: "Flight diverted from planned route",
      type: "Warning",
    };

    const updates = {
      status: "Diverted",
      logEntries: [...(flight.logEntries || []), logEntry],
      ...updateTimestamp(),
    };

    await db.flightPlans.update(id, updates);
    set((s) => ({
      flights: s.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },

  abort: async (id) => {
    const flight = get().flights.find((f) => f.id === id);
    if (!flight) return;

    const now = new Date().toISOString();
    const logEntry: FlightLogEntry = {
      timestamp: now,
      message: "Flight aborted",
      type: "Warning",
    };

    const updates = {
      status: "Aborted",
      logEntries: [...(flight.logEntries || []), logEntry],
      ...updateTimestamp(),
    };

    await db.flightPlans.update(id, updates);
    set((s) => ({
      flights: s.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));

    // Cross-tab: set ship back to Active
    const assetStore = useAssetStore.getState();
    if (flight.shipId) {
      await assetStore.updateShip(flight.shipId, { status: "Active" });
    }
  },

  addLogEntry: async (flightId, entry) => {
    const flight = get().flights.find((f) => f.id === flightId);
    if (!flight) return;

    const logEntry: FlightLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    const updates = {
      logEntries: [...(flight.logEntries || []), logEntry],
      ...updateTimestamp(),
    };

    await db.flightPlans.update(flightId, updates);
    set((s) => ({
      flights: s.flights.map((f) =>
        f.id === flightId ? { ...f, ...updates } : f
      ),
    }));
  },
}));

function locationLabel(loc: Location): string {
  return [loc.sublocation, loc.body, loc.system].filter(Boolean).join(", ");
}
