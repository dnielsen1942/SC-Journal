import { db } from "../db";

interface ExportData {
  version: 1 | 2;
  exportedAt: string;
  data: {
    inventoryItems: unknown[];
    ships: unknown[];
    shipComponents: unknown[];
    journalEntries: unknown[];
    contracts: unknown[];
    transactions: unknown[];
    commodityTrades: unknown[];
    haulingContracts: unknown[];
    cargoCrates: unknown[];
    flightPlans?: unknown[];
  };
}

export async function exportAllData(): Promise<void> {
  const [
    inventoryItems,
    ships,
    shipComponents,
    journalEntries,
    contracts,
    transactions,
    commodityTrades,
    haulingContracts,
    cargoCrates,
    flightPlans,
  ] = await Promise.all([
    db.inventoryItems.toArray(),
    db.ships.toArray(),
    db.shipComponents.toArray(),
    db.journalEntries.toArray(),
    db.contracts.toArray(),
    db.transactions.toArray(),
    db.commodityTrades.toArray(),
    db.haulingContracts.toArray(),
    db.cargoCrates.toArray(),
    db.flightPlans.toArray(),
  ]);

  const exportData: ExportData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      inventoryItems,
      ships,
      shipComponents,
      journalEntries,
      contracts,
      transactions,
      commodityTrades,
      haulingContracts,
      cargoCrates,
      flightPlans,
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sc-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importAllData(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as ExportData;

  if (parsed.version !== 1 && parsed.version !== 2) {
    throw new Error("Unsupported backup version");
  }

  await db.transaction(
    "rw",
    [
      db.inventoryItems,
      db.ships,
      db.shipComponents,
      db.journalEntries,
      db.contracts,
      db.transactions,
      db.commodityTrades,
      db.haulingContracts,
      db.cargoCrates,
      db.flightPlans,
    ],
    async () => {
      await Promise.all([
        db.inventoryItems.clear(),
        db.ships.clear(),
        db.shipComponents.clear(),
        db.journalEntries.clear(),
        db.contracts.clear(),
        db.transactions.clear(),
        db.commodityTrades.clear(),
        db.haulingContracts.clear(),
        db.cargoCrates.clear(),
        db.flightPlans.clear(),
      ]);

      const d = parsed.data;
      await Promise.all([
        d.inventoryItems.length > 0 && db.inventoryItems.bulkAdd(d.inventoryItems as never[]),
        d.ships.length > 0 && db.ships.bulkAdd(d.ships as never[]),
        d.shipComponents.length > 0 && db.shipComponents.bulkAdd(d.shipComponents as never[]),
        d.journalEntries.length > 0 && db.journalEntries.bulkAdd(d.journalEntries as never[]),
        d.contracts.length > 0 && db.contracts.bulkAdd(d.contracts as never[]),
        d.transactions.length > 0 && db.transactions.bulkAdd(d.transactions as never[]),
        d.commodityTrades.length > 0 && db.commodityTrades.bulkAdd(d.commodityTrades as never[]),
        d.haulingContracts.length > 0 && db.haulingContracts.bulkAdd(d.haulingContracts as never[]),
        d.cargoCrates.length > 0 && db.cargoCrates.bulkAdd(d.cargoCrates as never[]),
        d.flightPlans && d.flightPlans.length > 0 && db.flightPlans.bulkAdd(d.flightPlans as never[]),
      ]);
    }
  );
}
