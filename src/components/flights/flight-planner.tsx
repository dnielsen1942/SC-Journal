"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Navigation,
  Trash2,
  Pencil,
  Plane,
  MapPin,
  Clock,
  Shield,
  Package,
  FileText,
  Truck,
  PlayCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Send,
  Globe,
  AlertTriangle,
  Info,
  Milestone,
  Ship,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useFlightStore } from "@/lib/stores/flight-store";
import { useAssetStore } from "@/lib/stores/asset-store";
import { useContractStore } from "@/lib/stores/contract-store";
import { useCommodityStore } from "@/lib/stores/commodity-store";
import type { FlightPlan, FlightWaypoint } from "@/lib/types/flight.types";
import {
  FLIGHT_STATUSES,
  FLIGHT_PURPOSES,
  THREAT_LEVELS,
  WAYPOINT_PURPOSES,
  LOG_ENTRY_TYPES,
} from "@/lib/types/flight.types";
import { emptyLocation, formatLocation } from "@/lib/types/common.types";
import type { Location } from "@/lib/types/common.types";
import { formatDateTime, formatRelativeTime, formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";

const statusConfig: Record<
  string,
  {
    icon: React.ElementType;
    variant: "default" | "success" | "destructive" | "warning" | "secondary";
    color: string;
  }
> = {
  Planned: { icon: Clock, variant: "secondary", color: "text-slate-400" },
  "Pre-Flight": { icon: Navigation, variant: "default", color: "text-cyan-400" },
  "In Progress": { icon: Plane, variant: "warning", color: "text-amber-400" },
  Completed: { icon: CheckCircle2, variant: "success", color: "text-emerald-400" },
  Aborted: { icon: XCircle, variant: "destructive", color: "text-red-400" },
  Diverted: { icon: AlertTriangle, variant: "warning", color: "text-orange-400" },
};

const logTypeIcons: Record<string, React.ElementType> = {
  Info: Info,
  Warning: AlertTriangle,
  Danger: XCircle,
  Milestone: Milestone,
};

export function FlightPlanner() {
  const flightStore = useFlightStore();
  const assetStore = useAssetStore();
  const contractStore = useContractStore();
  const commodityStore = useCommodityStore();

  const [formOpen, setFormOpen] = useState(false);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FlightPlan | null>(null);
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [logFlightId, setLogFlightId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    flightStore.load();
    assetStore.load();
    contractStore.load();
    commodityStore.load();
  }, [flightStore.load, assetStore.load, contractStore.load, commodityStore.load]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return flightStore.flights;
    return flightStore.flights.filter((f) => f.status === statusFilter);
  }, [flightStore.flights, statusFilter]);

  const inProgress = flightStore.flights.filter((f) => f.status === "In Progress").length;
  const planned = flightStore.flights.filter((f) => f.status === "Planned" || f.status === "Pre-Flight").length;
  const completed = flightStore.flights.filter((f) => f.status === "Completed").length;

  if (!flightStore.loaded)
    return <div className="text-slate-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Plane className="h-3.5 w-3.5 text-amber-500" /> In Flight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-amber-400 font-mono">{inProgress}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-cyan-500" /> Planned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-cyan-400 font-mono">{planned}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{completed}</span>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flights</SelectItem>
            {FLIGHT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Plan Flight
        </Button>
      </div>

      {/* Flight List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Navigation}
          title="No flight plans"
          description="Plan your flights to coordinate ships, contracts, hauling, and navigation across the verse."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Plan Flight
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((flight) => {
            const cfg = statusConfig[flight.status] || statusConfig.Planned;
            const StatusIcon = cfg.icon;
            const ship = assetStore.ships.find((s) => s.id === flight.shipId);
            const linkedContracts = (flight.linkedContractIds || [])
              .map((cid) => contractStore.contracts.find((c) => c.id === cid))
              .filter(Boolean);
            const linkedHauling = (flight.linkedHaulingIds || [])
              .map((hid) => commodityStore.hauling.find((h) => h.id === hid))
              .filter(Boolean);
            const isExpanded = expandedFlight === flight.id;
            const isActive = flight.status === "In Progress";
            const canDepart = flight.status === "Planned" || flight.status === "Pre-Flight";
            const canComplete = flight.status === "In Progress";

            return (
              <Card key={flight.id} className={`group ${isActive ? "border-amber-800/40" : ""}`}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 mt-0.5"
                      onClick={() => setExpandedFlight(isExpanded ? null : flight.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-slate-100">{flight.name}</h3>
                        <Badge variant={cfg.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" /> {flight.status}
                        </Badge>
                        <Badge variant="secondary">{flight.purpose}</Badge>
                        {flight.threatLevel && flight.threatLevel !== "None" && (
                          <Badge variant={flight.threatLevel === "High" || flight.threatLevel === "Extreme" ? "destructive" : "warning"} className="gap-1">
                            <Shield className="h-3 w-3" /> {flight.threatLevel}
                          </Badge>
                        )}
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="h-3 w-3 shrink-0 text-cyan-500" />
                        <span>{formatLocation(flight.origin)}</span>
                        {flight.waypoints && flight.waypoints.length > 0 && (
                          <span className="text-slate-600">({flight.waypoints.length} stop{flight.waypoints.length > 1 ? "s" : ""})</span>
                        )}
                        <span className="text-slate-600">→</span>
                        <MapPin className="h-3 w-3 shrink-0 text-emerald-500" />
                        <span>{formatLocation(flight.destination)}</span>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        {ship && (
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" /> {ship.name || ship.model}
                          </span>
                        )}
                        {flight.estimatedDuration && <span>Est: {flight.estimatedDuration}</span>}
                        {flight.cargoScu != null && flight.cargoScu > 0 && (
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {flight.cargoScu} SCU</span>
                        )}
                        {linkedContracts.length > 0 && (
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {linkedContracts.length} contract{linkedContracts.length > 1 ? "s" : ""}</span>
                        )}
                        {linkedHauling.length > 0 && (
                          <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {linkedHauling.length} hauling</span>
                        )}
                        <span>{formatRelativeTime(flight.createdAt)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1 shrink-0">
                      {canDepart && (
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1"
                          onClick={async () => {
                            await flightStore.depart(flight.id);
                            toast.success("Flight departed! Ship set to In Transit.");
                          }}
                        >
                          <PlayCircle className="h-3.5 w-3.5" /> Depart
                        </Button>
                      )}
                      {canComplete && (
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          onClick={async () => {
                            await flightStore.complete(flight.id);
                            toast.success("Flight completed! Ship location updated.");
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      {isActive && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => { setLogFlightId(flight.id); setLogFormOpen(true); }}
                          >
                            <Send className="h-3.5 w-3.5" /> Log
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-red-400 hover:text-red-300"
                            onClick={async () => {
                              await flightStore.abort(flight.id);
                              toast.success("Flight aborted.");
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Abort
                          </Button>
                        </>
                      )}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(flight); setFormOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleteId(flight.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-4 ml-10 border-t border-slate-700/30 pt-3 space-y-4">
                      {/* Waypoints */}
                      {flight.waypoints && flight.waypoints.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Route Waypoints</h4>
                          <div className="space-y-1">
                            {flight.waypoints
                              .sort((a, b) => a.order - b.order)
                              .map((wp, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-slate-800/30">
                                  <span className="text-slate-500 font-mono w-5">{wp.order}.</span>
                                  <Globe className="h-3 w-3 text-slate-400" />
                                  <span className="text-slate-300">{formatLocation(wp.location)}</span>
                                  {wp.purpose && <Badge variant="secondary" className="text-[10px]">{wp.purpose}</Badge>}
                                  {wp.reached && <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-auto" />}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Linked Contracts */}
                      {linkedContracts.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Linked Contracts</h4>
                          <div className="space-y-1">
                            {linkedContracts.map((c) => c && (
                              <div key={c.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-slate-800/30">
                                <FileText className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-300">{c.title}</span>
                                <Badge variant="secondary" className="text-[10px]">{c.type}</Badge>
                                <span className="text-slate-500 ml-auto">Pay: <CurrencyDisplay amount={c.pay} /></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Linked Hauling */}
                      {linkedHauling.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Linked Hauling Contracts</h4>
                          <div className="space-y-1">
                            {linkedHauling.map((h) => h && (
                              <div key={h.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-slate-800/30">
                                <Truck className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-300">{h.title}</span>
                                <span className="text-slate-500">{Array.isArray(h.cargo) ? h.cargo.map(c => c.commodity).join(", ") : String(h.cargo)} - {Array.isArray(h.cargo) ? h.cargo.reduce((sum, c) => sum + c.scu, 0) : 0} SCU</span>
                                <span className="text-slate-500 ml-auto">Pay: <CurrencyDisplay amount={h.pay} /></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Flight details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {flight.estimatedDuration && (
                          <div><span className="text-slate-500">Est. Duration:</span><br /><span className="text-slate-300">{flight.estimatedDuration}</span></div>
                        )}
                        {flight.fuelEstimate && (
                          <div><span className="text-slate-500">Fuel Estimate:</span><br /><span className="text-slate-300">{flight.fuelEstimate}</span></div>
                        )}
                        {flight.crewSize != null && flight.crewSize > 0 && (
                          <div><span className="text-slate-500">Crew Size:</span><br /><span className="text-slate-300">{flight.crewSize}</span></div>
                        )}
                        {flight.departedAt && (
                          <div><span className="text-slate-500">Departed:</span><br /><span className="text-slate-300">{formatDateTime(flight.departedAt)}</span></div>
                        )}
                        {flight.arrivedAt && (
                          <div><span className="text-slate-500">Arrived:</span><br /><span className="text-slate-300">{formatDateTime(flight.arrivedAt)}</span></div>
                        )}
                      </div>

                      {/* Flight Log */}
                      {flight.logEntries && flight.logEntries.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Flight Log</h4>
                          <div className="space-y-1">
                            {flight.logEntries.map((entry, i) => {
                              const LogIcon = logTypeIcons[entry.type] || Info;
                              return (
                                <div key={i} className="flex items-start gap-2 text-xs py-1.5 px-2 rounded bg-slate-800/30">
                                  <LogIcon className={`h-3 w-3 shrink-0 mt-0.5 ${
                                    entry.type === "Danger" ? "text-red-400" :
                                    entry.type === "Warning" ? "text-amber-400" :
                                    entry.type === "Milestone" ? "text-emerald-400" :
                                    "text-slate-400"
                                  }`} />
                                  <span className="text-slate-300 flex-1">{entry.message}</span>
                                  <span className="text-slate-600 shrink-0">{formatDateTime(entry.timestamp)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {flight.notes && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Notes</h4>
                          <p className="text-xs text-slate-400 whitespace-pre-wrap">{flight.notes}</p>
                        </div>
                      )}

                      {isActive && (
                        <Button variant="outline" size="sm" onClick={() => { setLogFlightId(flight.id); setLogFormOpen(true); }}>
                          <Send className="h-3.5 w-3.5" /> Add Log Entry
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialogs */}
      <FlightFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        ships={assetStore.ships}
        contracts={contractStore.contracts.filter((c) => c.status === "Active" || c.status === "Available")}
        haulingContracts={commodityStore.hauling.filter((h) => h.status === "Active" || h.status === "Available")}
        onSubmit={async (data) => {
          if (editing) {
            await flightStore.update(editing.id, data);
            toast.success("Flight plan updated");
          } else {
            await flightStore.add(data);
            toast.success("Flight plan created");
          }
          setFormOpen(false);
        }}
      />

      <LogEntryDialog
        open={logFormOpen}
        onOpenChange={setLogFormOpen}
        onSubmit={async (entry) => {
          if (logFlightId) {
            await flightStore.addLogEntry(logFlightId, entry);
            toast.success("Log entry added");
          }
          setLogFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Flight Plan"
        description="Are you sure you want to delete this flight plan and its log?"
        onConfirm={async () => {
          if (deleteId) {
            await flightStore.remove(deleteId);
            toast.success("Flight plan deleted");
          }
        }}
      />
    </div>
  );
}

// ===================== FLIGHT FORM DIALOG =====================

import type { Ship as ShipType } from "@/lib/types/asset.types";
import type { Contract } from "@/lib/types/contract.types";
import type { HaulingContract } from "@/lib/types/commodity.types";

interface FlightFormDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: FlightPlan | null;
  ships: ShipType[];
  contracts: Contract[];
  haulingContracts: HaulingContract[];
  onSubmit: (data: Omit<FlightPlan, "id" | "createdAt" | "updatedAt">) => void;
}

function FlightFormDialog({
  open,
  onOpenChange,
  editing,
  ships,
  contracts,
  haulingContracts,
  onSubmit,
}: FlightFormDialogProps) {
  const [name, setName] = useState("");
  const [shipId, setShipId] = useState("");
  const [origin, setOrigin] = useState<Location>(emptyLocation);
  const [destination, setDestination] = useState<Location>(emptyLocation);
  const [purpose, setPurpose] = useState("Other");
  const [status, setStatus] = useState("Planned");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [fuelEstimate, setFuelEstimate] = useState("");
  const [cargoScu, setCargoScu] = useState("");
  const [crewSize, setCrewSize] = useState("");
  const [threatLevel, setThreatLevel] = useState("None");
  const [notes, setNotes] = useState("");
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [selectedHauling, setSelectedHauling] = useState<string[]>([]);
  const [waypoints, setWaypoints] = useState<{ location: Location; purpose: string }[]>([]);

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        setShipId(editing.shipId);
        setOrigin(editing.origin);
        setDestination(editing.destination);
        setPurpose(editing.purpose);
        setStatus(editing.status);
        setEstimatedDuration(editing.estimatedDuration || "");
        setFuelEstimate(editing.fuelEstimate || "");
        setCargoScu(editing.cargoScu != null ? String(editing.cargoScu) : "");
        setCrewSize(editing.crewSize != null ? String(editing.crewSize) : "");
        setThreatLevel(editing.threatLevel || "None");
        setNotes(editing.notes || "");
        setSelectedContracts(editing.linkedContractIds || []);
        setSelectedHauling(editing.linkedHaulingIds || []);
        setWaypoints(
          (editing.waypoints || [])
            .sort((a, b) => a.order - b.order)
            .map((wp) => ({ location: wp.location, purpose: wp.purpose || "" }))
        );
      } else {
        setName("");
        setShipId("");
        setOrigin(emptyLocation);
        setDestination(emptyLocation);
        setPurpose("Other");
        setStatus("Planned");
        setEstimatedDuration("");
        setFuelEstimate("");
        setCargoScu("");
        setCrewSize("");
        setThreatLevel("None");
        setNotes("");
        setSelectedContracts([]);
        setSelectedHauling([]);
        setWaypoints([]);
      }
    }
  }, [open, editing]);

  // Auto-fill origin from selected ship's current location
  const handleShipChange = (id: string) => {
    setShipId(id);
    const ship = ships.find((s) => s.id === id);
    if (ship && !origin.system) {
      setOrigin(ship.location);
    }
  };

  // Auto-fill from hauling contract
  const toggleHauling = (hid: string) => {
    setSelectedHauling((prev) => {
      const next = prev.includes(hid) ? prev.filter((id) => id !== hid) : [...prev, hid];
      // If adding, suggest origin/destination
      if (!prev.includes(hid)) {
        const h = haulingContracts.find((hc) => hc.id === hid);
        if (h) {
          if (!origin.system) setOrigin(h.origin);
          if (!destination.system) setDestination(h.destination);
          if (!cargoScu) setCargoScu(String(Array.isArray(h.cargo) ? h.cargo.reduce((sum, c) => sum + c.scu, 0) : 0));
          if (purpose === "Other") setPurpose("Hauling");
        }
      }
      return next;
    });
  };

  const toggleContract = (cid: string) => {
    setSelectedContracts((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Plan"} Flight</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update your flight plan."
              : "Plan a new flight. Link contracts and hauling jobs, and the system will track your ship."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Build waypoints from structured state
            const builtWaypoints: FlightWaypoint[] = waypoints
              .filter((wp) => wp.location.system || wp.location.body || wp.location.sublocation)
              .map((wp, i) => ({
                location: wp.location,
                purpose: wp.purpose || undefined,
                order: i + 1,
              }));

            onSubmit({
              name,
              shipId,
              origin,
              destination,
              waypoints: builtWaypoints.length > 0 ? builtWaypoints : undefined,
              status,
              purpose,
              linkedContractIds: selectedContracts.length > 0 ? selectedContracts : undefined,
              linkedHaulingIds: selectedHauling.length > 0 ? selectedHauling : undefined,
              estimatedDuration: estimatedDuration || undefined,
              fuelEstimate: fuelEstimate || undefined,
              cargoScu: cargoScu ? Number(cargoScu) : undefined,
              crewSize: crewSize ? Number(crewSize) : undefined,
              threatLevel: threatLevel !== "None" ? threatLevel : undefined,
              notes: notes || undefined,
              logEntries: editing?.logEntries,
              departedAt: editing?.departedAt,
              arrivedAt: editing?.arrivedAt,
            });
          }}
          className="space-y-4"
        >
          {/* Name & Ship */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Flight Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lorville → New Babbage Run" required />
            </div>
            <div>
              <Label>Ship *</Label>
              <Select value={shipId} onValueChange={handleShipChange}>
                <SelectTrigger><SelectValue placeholder="Select ship..." /></SelectTrigger>
                <SelectContent>
                  {ships.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name || s.model} ({s.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purpose, Status, Threat */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Purpose</Label>
              <Input list="purpose-list" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Purpose..." />
              <datalist id="purpose-list">
                {FLIGHT_PURPOSES.map((p) => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FLIGHT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Threat Level</Label>
              <Select value={threatLevel} onValueChange={setThreatLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAT_LEVELS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Origin & Destination */}
          <div>
            <Label>Origin</Label>
            <LocationSelector value={origin} onChange={setOrigin} />
          </div>
          <div>
            <Label>Destination</Label>
            <LocationSelector value={destination} onChange={setDestination} />
          </div>

          {/* Waypoints */}
          <div>
            <Label>Waypoints (intermediate stops)</Label>
            <div className="space-y-3 mt-1">
              {waypoints.map((wp, i) => (
                <div key={i} className="border border-slate-700/30 rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">Stop {i + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300"
                      onClick={() => setWaypoints((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <LocationSelector
                    value={wp.location}
                    onChange={(loc) =>
                      setWaypoints((prev) =>
                        prev.map((w, idx) => (idx === i ? { ...w, location: loc } : w))
                      )
                    }
                  />
                  <div>
                    <Label className="text-xs">Purpose</Label>
                    <Input
                      list="wp-purposes"
                      value={wp.purpose}
                      onChange={(e) =>
                        setWaypoints((prev) =>
                          prev.map((w, idx) => (idx === i ? { ...w, purpose: e.target.value } : w))
                        )
                      }
                      placeholder="Purpose of this stop..."
                    />
                  </div>
                </div>
              ))}
              <datalist id="wp-purposes">
                {WAYPOINT_PURPOSES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() =>
                  setWaypoints((prev) => [...prev, { location: { ...emptyLocation }, purpose: "" }])
                }
              >
                <Plus className="h-3 w-3" /> Add Waypoint
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label>Est. Duration</Label>
              <Input value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} placeholder="e.g. 20 min" />
            </div>
            <div>
              <Label>Fuel Estimate</Label>
              <Input value={fuelEstimate} onChange={(e) => setFuelEstimate(e.target.value)} placeholder="e.g. 75%" />
            </div>
            <div>
              <Label>Cargo (SCU)</Label>
              <Input type="number" min="0" value={cargoScu} onChange={(e) => setCargoScu(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Crew Size</Label>
              <Input type="number" min="1" value={crewSize} onChange={(e) => setCrewSize(e.target.value)} placeholder="1" />
            </div>
          </div>

          {/* Link Contracts */}
          {contracts.length > 0 && (
            <div>
              <Label>Link Active Contracts</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-1 border border-slate-700/30 rounded-md p-2">
                {contracts.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-800/30 rounded p-1">
                    <input
                      type="checkbox"
                      checked={selectedContracts.includes(c.id)}
                      onChange={() => toggleContract(c.id)}
                      className="rounded border-slate-600 bg-slate-800 text-cyan-500"
                    />
                    <FileText className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-300 flex-1">{c.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{c.type}</Badge>
                    <span className="text-slate-500">{formatCurrency(c.pay)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Link Hauling */}
          {haulingContracts.length > 0 && (
            <div>
              <Label>Link Hauling Contracts (auto-fills route)</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-1 border border-slate-700/30 rounded-md p-2">
                {haulingContracts.map((h) => (
                  <label key={h.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-800/30 rounded p-1">
                    <input
                      type="checkbox"
                      checked={selectedHauling.includes(h.id)}
                      onChange={() => toggleHauling(h.id)}
                      className="rounded border-slate-600 bg-slate-800 text-cyan-500"
                    />
                    <Truck className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-300 flex-1">{h.title}</span>
                    <span className="text-slate-500">{Array.isArray(h.cargo) ? h.cargo.map(c => c.commodity).join(", ") : String(h.cargo)} - {Array.isArray(h.cargo) ? h.cargo.reduce((sum, c) => sum + c.scu, 0) : 0} SCU</span>
                    <span className="text-slate-500">{formatCurrency(h.pay)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pre-flight notes, risks, reminders..." rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save Changes" : "Create Flight Plan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===================== LOG ENTRY DIALOG =====================

interface LogEntryDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (entry: { message: string; type: string }) => void;
}

function LogEntryDialog({ open, onOpenChange, onSubmit }: LogEntryDialogProps) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Info");

  useEffect(() => {
    if (open) {
      setMessage("");
      setType("Info");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Flight Log Entry</DialogTitle>
          <DialogDescription>Record an event during your flight.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ message, type });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOG_ENTRY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Message *</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What happened? e.g. Encountered pirates near Yela, Refueled at Port Olisar..."
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
