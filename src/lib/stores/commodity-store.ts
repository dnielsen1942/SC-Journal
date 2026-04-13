import { create } from "zustand";
import { db } from "../db";
import type {
  CommodityTrade,
  HaulingContract,
  CargoCrate,
} from "../types/commodity.types";
import { createTimestamps, updateTimestamp } from "../types/common.types";
import { useTransactionStore } from "./transaction-store";

interface CommodityStore {
  trades: CommodityTrade[];
  hauling: HaulingContract[];
  crates: CargoCrate[];
  loaded: boolean;
  load: () => Promise<void>;
  addTrade: (data: Omit<CommodityTrade, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTrade: (id: string, data: Partial<Omit<CommodityTrade, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  removeTrade: (id: string) => Promise<void>;
  addHauling: (data: Omit<HaulingContract, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateHauling: (id: string, data: Partial<Omit<HaulingContract, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  removeHauling: (id: string) => Promise<void>;
  completeHauling: (id: string) => Promise<void>;
  abandonHauling: (id: string) => Promise<void>;
  addCrate: (data: Omit<CargoCrate, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateCrate: (id: string, data: Partial<Omit<CargoCrate, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  removeCrate: (id: string) => Promise<void>;
}

export const useCommodityStore = create<CommodityStore>((set, get) => ({
  trades: [],
  hauling: [],
  crates: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const [trades, hauling, crates] = await Promise.all([
      db.commodityTrades.orderBy("createdAt").reverse().toArray(),
      db.haulingContracts.orderBy("createdAt").reverse().toArray(),
      db.cargoCrates.orderBy("createdAt").reverse().toArray(),
    ]);
    set({ trades, hauling, crates, loaded: true });
  },

  addTrade: async (data) => {
    const entry: CommodityTrade = { ...data, ...createTimestamps() };
    await db.commodityTrades.add(entry);
    set((s) => ({ trades: [entry, ...s.trades] }));
  },
  updateTrade: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.commodityTrades.update(id, updates);
    set((s) => ({
      trades: s.trades.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },
  removeTrade: async (id) => {
    await db.commodityTrades.delete(id);
    set((s) => ({ trades: s.trades.filter((t) => t.id !== id) }));
  },

  addHauling: async (data) => {
    const entry: HaulingContract = { ...data, ...createTimestamps() };
    await db.haulingContracts.add(entry);
    set((s) => ({ hauling: [entry, ...s.hauling] }));
  },
  updateHauling: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.haulingContracts.update(id, updates);
    set((s) => ({
      hauling: s.hauling.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },
  removeHauling: async (id) => {
    await db.haulingContracts.delete(id);
    set((s) => ({ hauling: s.hauling.filter((h) => h.id !== id) }));
  },

  completeHauling: async (id) => {
    const hauling = get().hauling.find((h) => h.id === id);
    if (!hauling) return;

    const now = new Date().toISOString();
    const updates = { status: "Completed", completedAt: now, ...updateTimestamp() };
    await db.haulingContracts.update(id, updates);
    set((s) => ({
      hauling: s.hauling.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));

    // Auto-add pay as income to ledger
    const txStore = useTransactionStore.getState();
    await txStore.load();
    await txStore.add({
      description: `Hauling completed: ${hauling.title}`,
      amount: hauling.pay,
      type: "income",
      category: "Contract Pay",
      relatedEntityId: id,
      relatedEntityType: "hauling",
    });
  },

  abandonHauling: async (id) => {
    const updates = { status: "Abandoned", ...updateTimestamp() };
    await db.haulingContracts.update(id, updates);
    set((s) => ({
      hauling: s.hauling.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  addCrate: async (data) => {
    const entry: CargoCrate = { ...data, ...createTimestamps() };
    await db.cargoCrates.add(entry);
    set((s) => ({ crates: [entry, ...s.crates] }));
  },
  updateCrate: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.cargoCrates.update(id, updates);
    set((s) => ({
      crates: s.crates.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },
  removeCrate: async (id) => {
    await db.cargoCrates.delete(id);
    set((s) => ({ crates: s.crates.filter((c) => c.id !== id) }));
  },
}));
