"use client";

import { useState } from "react";
import {
  Package,
  BookOpen,
  FileText,
  Wallet,
  BarChart3,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportImportDialog } from "@/components/shared/export-import-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AssetTracker } from "@/components/assets/asset-tracker";
import { Journey } from "@/components/journal/journey";
import { ContractLog } from "@/components/contracts/contract-log";
import { TransactionLedger } from "@/components/transactions/transaction-ledger";
import { CommodityLedger } from "@/components/commodities/commodity-ledger";

const tabs = [
  { id: "assets", label: "Assets", icon: Package },
  { id: "journey", label: "Journey", icon: BookOpen },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "ledger", label: "Ledger", icon: Wallet },
  { id: "commodities", label: "Commodities", icon: BarChart3 },
] as const;

export function TabShell() {
  const [activeTab, setActiveTab] = useState("assets");
  const [dataDialogOpen, setDataDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700/30 bg-slate-950/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-sm font-[Orbitron,sans-serif]">SC</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-100 font-[Orbitron,sans-serif] tracking-wider">
              SC JOURNAL
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              STAR CITIZEN TRACKER
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDataDialogOpen(true)} title="Data Management">
              <Database className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="assets">
            <AssetTracker />
          </TabsContent>

          <TabsContent value="journey">
            <Journey />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractLog />
          </TabsContent>

          <TabsContent value="ledger">
            <TransactionLedger />
          </TabsContent>

          <TabsContent value="commodities">
            <CommodityLedger />
          </TabsContent>
        </Tabs>
      </main>

      <ExportImportDialog open={dataDialogOpen} onOpenChange={setDataDialogOpen} />
    </div>
  );
}
