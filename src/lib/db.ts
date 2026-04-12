import Dexie, { type EntityTable } from "dexie";
import type { InventoryItem, Ship, ShipComponent } from "./types/asset.types";
import type { JournalEntry } from "./types/journal.types";
import type { Contract } from "./types/contract.types";
import type { Transaction } from "./types/transaction.types";
import type {
  CommodityTrade,
  HaulingContract,
  CargoCrate,
} from "./types/commodity.types";
import type { FlightPlan } from "./types/flight.types";

const db = new Dexie("sc-journal") as Dexie & {
  inventoryItems: EntityTable<InventoryItem, "id">;
  ships: EntityTable<Ship, "id">;
  shipComponents: EntityTable<ShipComponent, "id">;
  journalEntries: EntityTable<JournalEntry, "id">;
  contracts: EntityTable<Contract, "id">;
  transactions: EntityTable<Transaction, "id">;
  commodityTrades: EntityTable<CommodityTrade, "id">;
  haulingContracts: EntityTable<HaulingContract, "id">;
  cargoCrates: EntityTable<CargoCrate, "id">;
  flightPlans: EntityTable<FlightPlan, "id">;
};

db.version(1).stores({
  inventoryItems: "id, category, shipId, createdAt",
  ships: "id, model, status, createdAt",
  shipComponents: "id, shipId, type",
  journalEntries: "id, entryType, createdAt, pinned",
  contracts: "id, type, status, createdAt",
  transactions: "id, type, category, createdAt",
  commodityTrades: "id, commodity, action, crateId, createdAt",
  haulingContracts: "id, status, createdAt",
  cargoCrates: "id, shipId, status",
});

db.version(2).stores({
  inventoryItems: "id, category, shipId, createdAt",
  ships: "id, model, status, createdAt",
  shipComponents: "id, shipId, type",
  journalEntries: "id, entryType, createdAt, pinned",
  contracts: "id, type, status, createdAt",
  transactions: "id, type, category, createdAt",
  commodityTrades: "id, commodity, action, crateId, createdAt",
  haulingContracts: "id, status, createdAt",
  cargoCrates: "id, shipId, status",
  flightPlans: "id, shipId, status, createdAt",
});

export { db };
