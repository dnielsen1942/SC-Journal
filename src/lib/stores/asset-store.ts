import { create } from "zustand";
import { db } from "../db";
import type { InventoryItem, Ship, ShipComponent } from "../types/asset.types";
import { createTimestamps, updateTimestamp } from "../types/common.types";

interface AssetStore {
  items: InventoryItem[];
  ships: Ship[];
  components: ShipComponent[];
  loaded: boolean;
  load: () => Promise<void>;
  addItem: (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateItem: (id: string, data: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  addShip: (data: Omit<Ship, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateShip: (id: string, data: Partial<Omit<Ship, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  removeShip: (id: string) => Promise<void>;
  addComponent: (data: Omit<ShipComponent, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateComponent: (id: string, data: Partial<Omit<ShipComponent, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  removeComponent: (id: string) => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  items: [],
  ships: [],
  components: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const [items, ships, components] = await Promise.all([
      db.inventoryItems.orderBy("createdAt").reverse().toArray(),
      db.ships.orderBy("createdAt").reverse().toArray(),
      db.shipComponents.toArray(),
    ]);
    set({ items, ships, components, loaded: true });
  },

  addItem: async (data) => {
    const entry: InventoryItem = { ...data, ...createTimestamps() };
    await db.inventoryItems.add(entry);
    set((s) => ({ items: [entry, ...s.items] }));
  },
  updateItem: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.inventoryItems.update(id, updates);
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));
  },
  removeItem: async (id) => {
    await db.inventoryItems.delete(id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },

  addShip: async (data) => {
    const entry: Ship = { ...data, ...createTimestamps() };
    await db.ships.add(entry);
    set((s) => ({ ships: [entry, ...s.ships] }));
  },
  updateShip: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.ships.update(id, updates);
    set((s) => ({
      ships: s.ships.map((sh) => (sh.id === id ? { ...sh, ...updates } : sh)),
    }));
  },
  removeShip: async (id) => {
    await db.ships.delete(id);
    // Also remove associated components
    await db.shipComponents.where("shipId").equals(id).delete();
    set((s) => ({
      ships: s.ships.filter((sh) => sh.id !== id),
      components: s.components.filter((c) => c.shipId !== id),
    }));
  },

  addComponent: async (data) => {
    const entry: ShipComponent = { ...data, ...createTimestamps() };
    await db.shipComponents.add(entry);
    set((s) => ({ components: [...s.components, entry] }));
  },
  updateComponent: async (id, data) => {
    const updates = { ...data, ...updateTimestamp() };
    await db.shipComponents.update(id, updates);
    set((s) => ({
      components: s.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
  removeComponent: async (id) => {
    await db.shipComponents.delete(id);
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
    }));
  },
}));
