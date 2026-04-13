"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  BarChart3,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Truck,
  PackageOpen,
  Globe,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCommodityStore } from "@/lib/stores/commodity-store";
import type {
  CommodityTrade,
  HaulingContract,
  HaulingCargo,
  CargoCrate,
} from "@/lib/types/commodity.types";
import { HAULING_STATUSES, CRATE_STATUSES } from "@/lib/types/commodity.types";
import { emptyLocation, formatLocation } from "@/lib/types/common.types";
import type { Location } from "@/lib/types/common.types";
import { getCommodityNames } from "@/lib/constants/commodities";
import { formatDateTime, formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { LocationSelector } from "@/components/shared/location-selector";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";

export function CommodityLedger() {
  const store = useCommodityStore();
  const [subTab, setSubTab] = useState("trades");

  useEffect(() => {
    store.load();
  }, [store.load]);

  const totalBought = useMemo(
    () =>
      store.trades
        .filter((t) => t.action === "buy")
        .reduce((a, t) => a + t.totalPrice, 0),
    [store.trades]
  );
  const totalSold = useMemo(
    () =>
      store.trades
        .filter((t) => t.action === "sell")
        .reduce((a, t) => a + t.totalPrice, 0),
    [store.trades]
  );
  const profit = totalSold - totalBought;

  if (!store.loaded)
    return <div className="text-slate-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingDown className="h-3.5 w-3.5" /> Total Bought
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay
              amount={totalBought}
              className="text-lg font-bold text-red-400"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Total Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay
              amount={totalSold}
              className="text-lg font-bold text-emerald-400"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5" /> Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay
              amount={profit}
              showSign
              className="text-lg font-bold"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="trades">
            <BarChart3 className="h-3.5 w-3.5" /> Trades
          </TabsTrigger>
          <TabsTrigger value="hauling">
            <Truck className="h-3.5 w-3.5" /> Hauling
          </TabsTrigger>
          <TabsTrigger value="cargo">
            <PackageOpen className="h-3.5 w-3.5" /> Cargo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trades">
          <TradesPanel />
        </TabsContent>
        <TabsContent value="hauling">
          <HaulingPanel />
        </TabsContent>
        <TabsContent value="cargo">
          <CargoPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===================== TRADES PANEL =====================

function TradesPanel() {
  const { trades, addTrade, updateTrade, removeTrade } = useCommodityStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CommodityTrade | null>(null);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    return trades.filter(
      (t) =>
        !filter || t.commodity.toLowerCase().includes(filter.toLowerCase())
    );
  }, [trades, filter]);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search commodities..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex-1" />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Trade
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No trades recorded"
          description="Track your commodity buys and sells to calculate profit and loss."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Trade
            </Button>
          }
        />
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_80px_80px_100px_120px_120px_60px] gap-2 px-3 py-2 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-700/30">
            <div>Commodity</div>
            <div>Action</div>
            <div className="text-right">SCU</div>
            <div className="text-right">Price/Unit</div>
            <div className="text-right">Total</div>
            <div className="text-right">Date</div>
            <div />
          </div>
          {filtered.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-[1fr_80px_80px_100px_120px_120px_60px] gap-2 px-3 py-2.5 rounded-md hover:bg-slate-800/30 items-center group"
            >
              <div className="text-sm text-slate-200 truncate">
                {trade.commodity}
              </div>
              <Badge
                variant={trade.action === "buy" ? "destructive" : "success"}
                className="w-fit"
              >
                {trade.action === "buy" ? "BUY" : "SELL"}
              </Badge>
              <div className="text-right text-sm font-mono text-slate-300">
                {trade.quantity}
              </div>
              <div className="text-right">
                <CurrencyDisplay amount={trade.pricePerUnit} />
              </div>
              <div className="text-right">
                <CurrencyDisplay
                  amount={trade.totalPrice}
                  className={
                    trade.action === "sell"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                />
              </div>
              <div className="text-right text-xs text-slate-400">
                {formatDateTime(trade.createdAt)}
              </div>
              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditing(trade);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-400"
                  onClick={() => setDeleteId(trade.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TradeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={async (data) => {
          if (editing) {
            await updateTrade(editing.id, data);
            toast.success("Trade updated");
          } else {
            await addTrade(data);
            toast.success("Trade recorded");
          }
          setFormOpen(false);
        }}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Trade"
        description="Delete this trade record?"
        onConfirm={async () => {
          if (deleteId) {
            await removeTrade(deleteId);
            toast.success("Trade deleted");
          }
        }}
      />
    </div>
  );
}

// ===================== HAULING PANEL =====================

function HaulingPanel() {
  const { hauling, addHauling, updateHauling, removeHauling, completeHauling, abandonHauling } =
    useCommodityStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<HaulingContract | null>(null);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Hauling Contract
        </Button>
      </div>

      {hauling.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No hauling contracts"
          description="Track your cargo hauling jobs with origin, destination, and pay."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Hauling Contract
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {hauling.map((h) => (
            <Card key={h.id} className="group">
              <div className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-200">
                      {h.title}
                    </h3>
                    <Badge
                      variant={
                        h.status === "Completed"
                          ? "success"
                          : h.status === "Failed"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {h.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Globe className="h-3 w-3" />
                    <span>{formatLocation(h.origin)}</span>
                    <span className="text-slate-600">→</span>
                    <span>{formatLocation(h.destination)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span>Cargo: {Array.isArray(h.cargo) ? h.cargo.map(c => `${c.commodity} (${c.scu} SCU)`).join(", ") : String(h.cargo)}</span>
                    <span>{Array.isArray(h.cargo) ? h.cargo.reduce((sum, c) => sum + c.scu, 0) : 0} SCU total</span>
                    <span>
                      Pay: <CurrencyDisplay amount={h.pay} />
                    </span>
                    {h.fee ? (
                      <span>
                        Fee: <CurrencyDisplay amount={h.fee} />
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {(h.status === "Active" || h.status === "In Transit") && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        onClick={async () => {
                          await completeHauling(h.id);
                          toast.success("Hauling completed — pay added to ledger");
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-red-400 hover:text-red-300"
                        onClick={async () => {
                          await abandonHauling(h.id);
                          toast.success("Hauling contract abandoned");
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Abandon
                      </Button>
                    </>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditing(h);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400"
                      onClick={() => setDeleteId(h.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <HaulingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={async (data) => {
          if (editing) {
            await updateHauling(editing.id, data);
            toast.success("Hauling contract updated");
          } else {
            await addHauling(data);
            toast.success("Hauling contract added");
          }
          setFormOpen(false);
        }}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Hauling Contract"
        description="Delete this hauling contract?"
        onConfirm={async () => {
          if (deleteId) {
            await removeHauling(deleteId);
            toast.success("Hauling contract deleted");
          }
        }}
      />
    </div>
  );
}

// ===================== CARGO PANEL =====================

function CargoPanel() {
  const { crates, addCrate, updateCrate, removeCrate } = useCommodityStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CargoCrate | null>(null);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Cargo Crate
        </Button>
      </div>

      {crates.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No cargo crates tracked"
          description="Track your cargo crates with contents, location, and status."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Cargo Crate
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {crates.map((crate) => (
            <Card key={crate.id} className="group">
              <div className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-200">
                      {crate.name}
                    </h3>
                    <Badge
                      variant={
                        crate.status === "Delivered"
                          ? "success"
                          : crate.status === "Lost"
                          ? "destructive"
                          : crate.status === "In Transit"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {crate.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Globe className="h-3 w-3" />
                    {formatLocation(crate.location)}
                  </div>
                  {crate.contents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {crate.contents.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          {c.commodity}: {c.quantity} SCU
                          {c.purchasePrice
                            ? ` (${formatCurrency(c.purchasePrice)})`
                            : ""}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditing(crate);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400"
                    onClick={() => setDeleteId(crate.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CrateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={async (data) => {
          if (editing) {
            await updateCrate(editing.id, data);
            toast.success("Cargo crate updated");
          } else {
            await addCrate(data);
            toast.success("Cargo crate added");
          }
          setFormOpen(false);
        }}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Crate"
        description="Delete this cargo crate?"
        onConfirm={async () => {
          if (deleteId) {
            await removeCrate(deleteId);
            toast.success("Cargo crate deleted");
          }
        }}
      />
    </div>
  );
}

// ===================== FORM DIALOGS =====================

function TradeFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: CommodityTrade | null;
  onSubmit: (
    d: Omit<CommodityTrade, "id" | "createdAt" | "updatedAt">
  ) => void;
}) {
  const [commodity, setCommodity] = useState("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [location, setLocation] = useState(emptyLocation);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setCommodity(editing.commodity);
        setAction(editing.action);
        setQuantity(String(editing.quantity));
        setPricePerUnit(String(editing.pricePerUnit));
        setLocation(editing.location);
        setNotes(editing.notes || "");
      } else {
        setCommodity("");
        setAction("buy");
        setQuantity("");
        setPricePerUnit("");
        setLocation(emptyLocation);
        setNotes("");
      }
    }
  }, [open, editing]);

  const total = (Number(quantity) || 0) * (Number(pricePerUnit) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Record"} Trade</DialogTitle>
          <DialogDescription>
            Record a commodity buy or sell transaction.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              commodity,
              action,
              quantity: Number(quantity) || 0,
              pricePerUnit: Number(pricePerUnit) || 0,
              totalPrice: total,
              location,
              notes: notes || undefined,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Commodity *</Label>
            <Input
              list="commodity-list"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder="Commodity name..."
              required
            />
            <datalist id="commodity-list">
              {getCommodityNames().map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Action</Label>
              <Select
                value={action}
                onValueChange={(v) => setAction(v as "buy" | "sell")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity (SCU) *</Label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Price/Unit *</Label>
              <Input
                type="number"
                min="0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
              />
            </div>
          </div>
          {total > 0 && (
            <div className="text-sm text-slate-400">
              Total: <CurrencyDisplay amount={total} />
            </div>
          )}
          <div>
            <Label>Location</Label>
            <LocationSelector value={location} onChange={setLocation} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Save" : "Record Trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HaulingFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: HaulingContract | null;
  onSubmit: (
    d: Omit<HaulingContract, "id" | "createdAt" | "updatedAt">
  ) => void;
}) {
  const commodityNames = getCommodityNames();
  const [title, setTitle] = useState("");
  const [origin, setOrigin] = useState<Location>(emptyLocation);
  const [destination, setDestination] = useState<Location>(emptyLocation);
  const [cargoItems, setCargoItems] = useState<HaulingCargo[]>([{ commodity: "", scu: 0 }]);
  const [pay, setPay] = useState("");
  const [fee, setFee] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setOrigin(editing.origin);
        setDestination(editing.destination);
        setCargoItems(
          Array.isArray(editing.cargo) && editing.cargo.length > 0
            ? editing.cargo
            : [{ commodity: "", scu: 0 }]
        );
        setPay(String(editing.pay));
        setFee(editing.fee ? String(editing.fee) : "");
        setStatus(editing.status);
        setNotes(editing.notes || "");
      } else {
        setTitle("");
        setOrigin(emptyLocation);
        setDestination(emptyLocation);
        setCargoItems([{ commodity: "", scu: 0 }]);
        setPay("");
        setFee("");
        setStatus("Active");
        setNotes("");
      }
    }
  }, [open, editing]);

  const updateCargoItem = (index: number, field: keyof HaulingCargo, value: string | number) => {
    setCargoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addCargoItem = () => {
    setCargoItems((prev) => [...prev, { commodity: "", scu: 0 }]);
  };

  const removeCargoItem = (index: number) => {
    if (cargoItems.length <= 1) return;
    setCargoItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit" : "Add"} Hauling Contract
          </DialogTitle>
          <DialogDescription>
            Track a cargo hauling job.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              title,
              origin,
              destination,
              cargo: cargoItems.filter((c) => c.commodity.trim()),
              pay: Number(pay) || 0,
              fee: fee ? Number(fee) : undefined,
              status,
              notes: notes || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hauling job name"
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HAULING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Cargo items */}
          <div>
            <Label>Cargo *</Label>
            <div className="space-y-2 mt-1">
              {cargoItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    list="hauling-commodities"
                    value={item.commodity}
                    onChange={(e) => updateCargoItem(i, "commodity", e.target.value)}
                    placeholder="Commodity..."
                    className="flex-1"
                    required={i === 0}
                  />
                  <Input
                    type="number"
                    min="0"
                    value={item.scu || ""}
                    onChange={(e) => updateCargoItem(i, "scu", Number(e.target.value) || 0)}
                    placeholder="SCU"
                    className="w-24"
                  />
                  {cargoItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-red-400 hover:text-red-300"
                      onClick={() => removeCargoItem(i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <datalist id="hauling-commodities">
                {commodityNames.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={addCargoItem}
              >
                <Plus className="h-3 w-3" /> Add Cargo
              </Button>
            </div>
          </div>
          <div>
            <Label>Origin</Label>
            <LocationSelector value={origin} onChange={setOrigin} />
          </div>
          <div>
            <Label>Destination</Label>
            <LocationSelector
              value={destination}
              onChange={setDestination}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pay (aUEC) *</Label>
              <Input
                type="number"
                min="0"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Fee/Collateral</Label>
              <Input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Save" : "Add Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CrateFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: CargoCrate | null;
  onSubmit: (
    d: Omit<CargoCrate, "id" | "createdAt" | "updatedAt">
  ) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState(emptyLocation);
  const [status, setStatus] = useState("Stored");
  const [contentsStr, setContentsStr] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        setLocation(editing.location);
        setStatus(editing.status);
        setContentsStr(
          editing.contents
            .map(
              (c) =>
                `${c.commodity}:${c.quantity}${c.purchasePrice ? ":" + c.purchasePrice : ""}`
            )
            .join(", ")
        );
        setNotes(editing.notes || "");
      } else {
        setName("");
        setLocation(emptyLocation);
        setStatus("Stored");
        setContentsStr("");
        setNotes("");
      }
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Cargo Crate</DialogTitle>
          <DialogDescription>
            Track a cargo crate and its contents.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const contents = contentsStr
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => {
                const [commodity, qty, price] = s.split(":");
                return {
                  commodity: commodity?.trim() || "",
                  quantity: Number(qty?.trim()) || 0,
                  purchasePrice: price ? Number(price.trim()) : undefined,
                };
              })
              .filter((c) => c.commodity);
            onSubmit({
              name,
              contents,
              location,
              status,
              notes: notes || undefined,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Crate Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Label for this crate"
              required
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRATE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <LocationSelector value={location} onChange={setLocation} />
          </div>
          <div>
            <Label>Contents (commodity:SCU:price, comma-separated)</Label>
            <Textarea
              value={contentsStr}
              onChange={(e) => setContentsStr(e.target.value)}
              placeholder="e.g. Laranite:10:3000, Titanium:20"
              rows={3}
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Format: CommodityName:Quantity:PurchasePrice (price optional)
            </p>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Save" : "Add Crate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
