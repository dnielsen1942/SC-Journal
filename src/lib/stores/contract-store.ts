import { create } from "zustand";
import { db } from "../db";
import type { Contract } from "../types/contract.types";
import { createTimestamps, updateTimestamp } from "../types/common.types";
import { useTransactionStore } from "./transaction-store";

interface ContractStore {
  contracts: Contract[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (data: Omit<Contract, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  update: (id: string, data: Partial<Omit<Contract, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  abandon: (id: string) => Promise<void>;
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

    // If contract has a fee, auto-add expense to ledger
    if (data.fee && data.fee > 0) {
      const txStore = useTransactionStore.getState();
      await txStore.load();
      await txStore.add({
        description: `Fee for contract: ${data.title}`,
        amount: data.fee,
        type: "expense",
        category: "Contract Pay",
        relatedEntityId: entry.id,
        relatedEntityType: "contract",
      });
    }
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

  complete: async (id) => {
    const contract = get().contracts.find((c) => c.id === id);
    if (!contract) return;

    const now = new Date().toISOString();
    const updates = { status: "Completed", completedAt: now, ...updateTimestamp() };
    await db.contracts.update(id, updates);
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));

    // Auto-add pay as income to ledger
    const txStore = useTransactionStore.getState();
    await txStore.load();
    await txStore.add({
      description: `Contract completed: ${contract.title}`,
      amount: contract.pay,
      type: "income",
      category: "Contract Pay",
      relatedEntityId: id,
      relatedEntityType: "contract",
    });
  },

  abandon: async (id) => {
    const updates = { status: "Abandoned", ...updateTimestamp() };
    await db.contracts.update(id, updates);
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
}));
