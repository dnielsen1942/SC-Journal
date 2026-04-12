import { create } from "zustand";
import { db } from "../db";
import type { JournalEntry } from "../types/journal.types";
import { createTimestamps, updateTimestamp } from "../types/common.types";

interface JournalStore {
  entries: JournalEntry[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (data: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  update: (id: string, data: Partial<Omit<JournalEntry, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const entries = await db.journalEntries.orderBy("createdAt").reverse().toArray();
    set({ entries, loaded: true });
  },

  add: async (data) => {
    const entry: JournalEntry = { ...data, ...createTimestamps() };
    await db.journalEntries.add(entry);
    set((s) => ({ entries: [entry, ...s.entries] }));
  },

  update: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.journalEntries.update(id, updates);
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  remove: async (id) => {
    await db.journalEntries.delete(id);
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== id),
    }));
  },

  togglePin: async (id) => {
    const entry = get().entries.find((e) => e.id === id);
    if (!entry) return;
    const pinned = !entry.pinned;
    await db.journalEntries.update(id, { pinned, ...updateTimestamp() });
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, pinned, ...updateTimestamp() } : e
      ),
    }));
  },
}));
