import { create } from "zustand";
import { db } from "../db";
import type { Transaction } from "../types/transaction.types";
import { createTimestamps, updateTimestamp } from "../types/common.types";

interface TransactionStore {
  transactions: Transaction[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  update: (id: string, data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const transactions = await db.transactions.orderBy("createdAt").reverse().toArray();
    set({ transactions, loaded: true });
  },

  add: async (data) => {
    const entry: Transaction = { ...data, ...createTimestamps() };
    await db.transactions.add(entry);
    set((s) => ({ transactions: [entry, ...s.transactions] }));
  },

  update: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.transactions.update(id, updates);
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  remove: async (id) => {
    await db.transactions.delete(id);
    set((s) => ({
      transactions: s.transactions.filter((t) => t.id !== id),
    }));
  },
}));
