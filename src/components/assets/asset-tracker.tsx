"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Package,
  Ship,
  Trash2,
  Pencil,
  ChevronRight,
  ChevronDown,
  Cpu,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useAssetStore } from "@/lib/stores/asset-store";
import type {
  InventoryItem,
  Ship as ShipType,
  ShipComponent,
} from "@/lib/types/asset.types";
import {
  ITEM_CATEGORIES,
  SHIP_STATUSES,
  COMPONENT_TYPES,
  COMPONENT_GRADES,
} from "@/lib/types/asset.types";
import { emptyLocation, formatLocation } from "@/lib/types/common.types";
import { formatCurrency } from "@/lib/utils/format";
import { getShipModels, getManufacturerForModel } from "@/lib/constants/ships";
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
import { LocationSelector } from "@/components/shared/location-selector";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";

const shipStatusVariant: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
  Active: "success",
  Stored: "secondary",
  Destroyed: "destructive",
  Claimed: "warning",
  "In Transit": "default",
};

export function AssetTracker() {
  const store = useAssetStore();
  const [subTab, setSubTab] = useState("inventory");

  useEffect(() => {
    store.load();
  }, [store.load]);

  if (!store.loaded)
    return <div className="text-slate-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Package className="h-3.5 w-3.5" /> Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {store.items.length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Ship className="h-3.5 w-3.5" /> Ships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {store.ships.length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5" /> Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {store.components.length}
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="inventory">
            <Package className="h-3.5 w-3.5" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="ships">
            <Ship className="h-3.5 w-3.5" /> Ships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <InventoryPanel />
        </TabsContent>

        <TabsContent value="ships">
          <ShipPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===================== INVENTORY PANEL =====================

function InventoryPanel() {
  const { items, ships, addItem, updateItem, removeItem } = useAssetStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (catFilter !== "all" && i.category !== catFilter) return false;
      if (filter && !i.name.toLowerCase().includes(filter.toLowerCase())) return false;
      return true;
    });
  }, [items, filter, catFilter]);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        <Input placeholder="Search items..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ITEM_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No items tracked" description="Add items to track your inventory across locations and ships."
          action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Item</Button>} />
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_100px_100px_1fr_80px] gap-2 px-3 py-2 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-700/30">
            <div>Name</div><div>Category</div><div className="text-right">Qty</div><div>Location</div><div />
          </div>
          {filtered.map((item) => {
            const shipName = item.shipId ? ships.find((s) => s.id === item.shipId)?.name : null;
            return (
              <div key={item.id} className="grid grid-cols-[1fr_100px_100px_1fr_80px] gap-2 px-3 py-2.5 rounded-md hover:bg-slate-800/30 items-center group">
                <div className="text-sm text-slate-200 truncate">{item.name}</div>
                <Badge variant="secondary" className="text-[10px] w-fit">{item.category}</Badge>
                <div className="text-right text-sm font-mono text-slate-300">{item.quantity}</div>
                <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                  <Globe className="h-3 w-3 shrink-0" />
                  {formatLocation(item.location)}
                  {shipName && <Badge variant="default" className="text-[10px] ml-1">{shipName}</Badge>}
                </div>
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(item); setFormOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ItemFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} ships={ships}
        onSubmit={async (data) => {
          if (editing) { await updateItem(editing.id, data); toast.success("Item updated"); }
          else { await addItem(data); toast.success("Item added"); }
          setFormOpen(false);
        }} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Item" description="Delete this inventory item?"
        onConfirm={async () => { if (deleteId) { await removeItem(deleteId); toast.success("Item deleted"); } }} />
    </div>
  );
}

// ===================== SHIP PANEL =====================

function ShipPanel() {
  const { ships, components, addShip, updateShip, removeShip, addComponent, updateComponent, removeComponent } = useAssetStore();
  const [formOpen, setFormOpen] = useState(false);
  const [compFormOpen, setCompFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCompId, setDeleteCompId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ShipType | null>(null);
  const [editingComp, setEditingComp] = useState<ShipComponent | null>(null);
  const [expandedShip, setExpandedShip] = useState<string | null>(null);
  const [compShipId, setCompShipId] = useState<string | null>(null);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="flex-1" />
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Ship
        </Button>
      </div>

      {ships.length === 0 ? (
        <EmptyState icon={Ship} title="No ships registered" description="Add your ships to track their locations, status, and components."
          action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Ship</Button>} />
      ) : (
        <div className="space-y-2">
          {ships.map((ship) => {
            const shipComps = components.filter((c) => c.shipId === ship.id);
            const isExpanded = expandedShip === ship.id;
            return (
              <Card key={ship.id} className="group">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 mt-0.5"
                      onClick={() => setExpandedShip(isExpanded ? null : ship.id)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-slate-100">{ship.name || ship.model}</h3>
                        {ship.name && <span className="text-xs text-slate-500">{ship.model}</span>}
                        <Badge variant={shipStatusVariant[ship.status] || "secondary"}>{ship.status}</Badge>
                        <span className="text-xs text-slate-500">{ship.manufacturer}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {formatLocation(ship.location)}</span>
                        {ship.purchasePrice && <span>{formatCurrency(ship.purchasePrice)}</span>}
                        <span>{shipComps.length} component{shipComps.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(ship); setFormOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleteId(ship.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 ml-10 border-t border-slate-700/30 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs uppercase tracking-wider text-slate-500">Components</h4>
                        <Button variant="outline" size="sm" onClick={() => { setEditingComp(null); setCompShipId(ship.id); setCompFormOpen(true); }}>
                          <Plus className="h-3 w-3" /> Add Component
                        </Button>
                      </div>
                      {shipComps.length === 0 ? (
                        <p className="text-xs text-slate-500 py-2">No components installed.</p>
                      ) : (
                        shipComps.map((comp) => (
                          <div key={comp.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-800/30 group/comp">
                            <Cpu className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="text-sm text-slate-200 flex-1">{comp.name}</span>
                            <Badge variant="secondary" className="text-[10px]">{comp.type}</Badge>
                            <span className="text-xs text-slate-400">Size {comp.size}</span>
                            <Badge variant="outline" className="text-[10px]">Grade {comp.grade}</Badge>
                            <div className="flex gap-1 opacity-0 group-hover/comp:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingComp(comp); setCompShipId(ship.id); setCompFormOpen(true); }}><Pencil className="h-2.5 w-2.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setDeleteCompId(comp.id)}><Trash2 className="h-2.5 w-2.5" /></Button>
                            </div>
                          </div>
                        ))
                      )}
                      {ship.notes && <p className="text-xs text-slate-500 mt-2">Notes: {ship.notes}</p>}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ShipFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing}
        onSubmit={async (data) => {
          if (editing) { await updateShip(editing.id, data); toast.success("Ship updated"); }
          else { await addShip(data); toast.success("Ship added"); }
          setFormOpen(false);
        }} />
      <ComponentFormDialog open={compFormOpen} onOpenChange={setCompFormOpen} editing={editingComp} shipId={compShipId || ""}
        onSubmit={async (data) => {
          if (editingComp) { await updateComponent(editingComp.id, data); toast.success("Component updated"); }
          else { await addComponent(data); toast.success("Component added"); }
          setCompFormOpen(false);
        }} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Ship" description="Delete this ship and all its components?"
        onConfirm={async () => { if (deleteId) { await removeShip(deleteId); toast.success("Ship deleted"); } }} />
      <ConfirmDialog open={!!deleteCompId} onOpenChange={() => setDeleteCompId(null)} title="Delete Component" description="Remove this component?"
        onConfirm={async () => { if (deleteCompId) { await removeComponent(deleteCompId); toast.success("Component deleted"); } }} />
    </div>
  );
}

// ===================== FORM DIALOGS =====================

function ItemFormDialog({ open, onOpenChange, editing, ships, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; editing: InventoryItem | null;
  ships: ShipType[]; onSubmit: (d: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState(emptyLocation);
  const [shipId, setShipId] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name); setCategory(editing.category); setQuantity(String(editing.quantity));
        setLocation(editing.location); setShipId(editing.shipId || ""); setValue(editing.value ? String(editing.value) : ""); setNotes(editing.notes || "");
      } else {
        setName(""); setCategory(""); setQuantity("1"); setLocation(emptyLocation); setShipId(""); setValue(""); setNotes("");
      }
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Item</DialogTitle>
          <DialogDescription>Track an item in your inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({
          name, category, quantity: Number(quantity) || 1, location,
          shipId: shipId || undefined, value: value ? Number(value) : undefined, notes: notes || undefined,
        }); }} className="space-y-4">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label>
              <Input list="item-cat-list" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category..." />
              <datalist id="item-cat-list">{ITEM_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div><Label>Quantity</Label><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
          </div>
          <div><Label>Location</Label><LocationSelector value={location} onChange={setLocation} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>On Ship</Label>
              <Select value={shipId || "none"} onValueChange={(v) => setShipId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not on a ship</SelectItem>
                  {ships.map((s) => <SelectItem key={s.id} value={s.id}>{s.name || s.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Value (aUEC)</Label><Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save" : "Add Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ShipFormDialog({ open, onOpenChange, editing, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; editing: ShipType | null;
  onSubmit: (d: Omit<ShipType, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [status, setStatus] = useState("Active");
  const [location, setLocation] = useState(emptyLocation);
  const [insurance, setInsurance] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name); setModel(editing.model); setManufacturer(editing.manufacturer);
        setStatus(editing.status); setLocation(editing.location); setInsurance(editing.insurance || "");
        setPurchasePrice(editing.purchasePrice ? String(editing.purchasePrice) : ""); setNotes(editing.notes || "");
      } else {
        setName(""); setModel(""); setManufacturer(""); setStatus("Active"); setLocation(emptyLocation);
        setInsurance(""); setPurchasePrice(""); setNotes("");
      }
    }
  }, [open, editing]);

  const handleModelChange = (val: string) => {
    setModel(val);
    const mfr = getManufacturerForModel(val);
    if (mfr) setManufacturer(mfr);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Ship</DialogTitle>
          <DialogDescription>Register a ship in your fleet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({
          name, model, manufacturer, status, location, insurance: insurance || undefined,
          purchasePrice: purchasePrice ? Number(purchasePrice) : undefined, notes: notes || undefined,
        }); }} className="space-y-4">
          <div><Label>Ship Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name for this ship" /></div>
          <div><Label>Model *</Label>
            <Input list="ship-model-list" value={model} onChange={(e) => handleModelChange(e.target.value)} placeholder="Ship model..." required />
            <datalist id="ship-model-list">{getShipModels().map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Manufacturer</Label><Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="Manufacturer" /></div>
            <div><Label>Status</Label>
              <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SHIP_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Location</Label><LocationSelector value={location} onChange={setLocation} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Insurance</Label><Input value={insurance} onChange={(e) => setInsurance(e.target.value)} placeholder="e.g. 6 months" /></div>
            <div><Label>Purchase Price</Label><Input type="number" min="0" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="aUEC" /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save" : "Add Ship"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ComponentFormDialog({ open, onOpenChange, editing, shipId, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; editing: ShipComponent | null; shipId: string;
  onSubmit: (d: Omit<ShipComponent, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("1");
  const [grade, setGrade] = useState("A");
  const [manufacturer, setManufacturer] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name); setType(editing.type); setSize(String(editing.size));
        setGrade(editing.grade); setManufacturer(editing.manufacturer || ""); setNotes(editing.notes || "");
      } else {
        setName(""); setType(""); setSize("1"); setGrade("A"); setManufacturer(""); setNotes("");
      }
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Component</DialogTitle>
          <DialogDescription>Manage ship components.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({
          shipId, name, type, size: Number(size) || 1, grade, manufacturer: manufacturer || undefined, notes: notes || undefined,
        }); }} className="space-y-4">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Component name" required /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Type</Label>
              <Input list="comp-type-list" value={type} onChange={(e) => setType(e.target.value)} placeholder="Type..." />
              <datalist id="comp-type-list">{COMPONENT_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
            </div>
            <div><Label>Size</Label><Input type="number" min="1" max="5" value={size} onChange={(e) => setSize(e.target.value)} /></div>
            <div><Label>Grade</Label>
              <Select value={grade} onValueChange={setGrade}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COMPONENT_GRADES.map((g) => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Manufacturer</Label><Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="Component manufacturer" /></div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save" : "Add Component"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
