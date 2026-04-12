import { create } from "zustand";
import { db } from "../db";
import type { Contract } from "../types/contract.types";
import { createTimestamps, updateTimestamp } from "../types/common.types";

interface ContractStore {
  contracts: Contract[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (data: Omit<Contract, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  update: (id: string, data: Partial<Omit<Contract, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useContractStore = create<ContractStore>((set, get) => ({
  contracts: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const contracts = await db.contracts.orderBy("createdAt").reverse().toArray();
    set({ contracts, loaded: true });
  },

  add: async (data) => {
    const entry: Contract = { ...data, ...createTimestamps() };
    await db.contracts.add(entry);
    set((s) => ({ contracts: [entry, ...s.contracts] }));
  },

  update: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.contracts.update(id, updates);
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  remove: async (id) => {
    await db.contracts.delete(id);
    set((s) => ({
      contracts: s.contracts.filter((c) => c.id !== id),
    }));
  },
}));
