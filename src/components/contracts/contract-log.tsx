"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, FileText, Trash2, Pencil, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useContractStore } from "@/lib/stores/contract-store";
import type { Contract } from "@/lib/types/contract.types";
import { CONTRACT_TYPES, CONTRACT_STATUSES } from "@/lib/types/contract.types";
import { emptyLocation } from "@/lib/types/common.types";
import { formatDateTime } from "@/lib/utils/format";
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
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { LocationSelector } from "@/components/shared/location-selector";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";

const statusConfig: Record<string, { icon: React.ElementType; variant: "default" | "success" | "destructive" | "warning" | "secondary" }> = {
  Available: { icon: Clock, variant: "secondary" },
  Active: { icon: Clock, variant: "default" },
  Completed: { icon: CheckCircle, variant: "success" },
  Failed: { icon: XCircle, variant: "destructive" },
  Abandoned: { icon: AlertTriangle, variant: "warning" },
};

export function ContractLog() {
  const { contracts, loaded, load, add, update, remove } = useContractStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (filter && !c.title.toLowerCase().includes(filter.toLowerCase())) return false;
      return true;
    });
  }, [contracts, filter, statusFilter]);

  const activeCount = contracts.filter((c) => c.status === "Active").length;
  const completedCount = contracts.filter((c) => c.status === "Completed").length;
  const totalEarned = contracts
    .filter((c) => c.status === "Completed")
    .reduce((acc, c) => acc + c.pay - (c.fee || 0), 0);

  if (!loaded) return <div className="text-slate-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-cyan-500" /> Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-cyan-400 font-mono">{activeCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{completedCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={totalEarned} className="text-lg font-bold" />
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search contracts..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {CONTRACT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Contract
        </Button>
      </div>

      {/* Contract List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          description="Start logging your Star Citizen contracts to track progress and earnings."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Contract
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const cfg = statusConfig[c.status] || statusConfig.Active;
            const StatusIcon = cfg.icon;
            return (
              <Card key={c.id} className="group">
                <div className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-slate-200 truncate">{c.title}</h3>
                      <Badge variant={cfg.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {c.status}
                      </Badge>
                      <Badge variant="secondary">{c.type}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{c.requirements}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Pay: <CurrencyDisplay amount={c.pay} /></span>
                      {c.fee ? <span>Fee: <CurrencyDisplay amount={c.fee} /></span> : null}
                      {c.rewards && c.rewards.length > 0 && (
                        <span>+{c.rewards.length} reward{c.rewards.length > 1 ? "s" : ""}</span>
                      )}
                      <span>{formatDateTime(c.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(c); setFormOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <ContractFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={async (data) => {
          if (editing) {
            await update(editing.id, data);
            toast.success("Contract updated");
          } else {
            await add(data);
            toast.success("Contract added");
          }
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Contract"
        description="Are you sure you want to delete this contract?"
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            toast.success("Contract deleted");
          }
        }}
      />
    </div>
  );
}

// --- Form Dialog ---

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Contract | null;
  onSubmit: (data: Omit<Contract, "id" | "createdAt" | "updatedAt">) => void;
}

function ContractFormDialog({ open, onOpenChange, editing, onSubmit }: ContractFormDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [issuer, setIssuer] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [pay, setPay] = useState("");
  const [fee, setFee] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(emptyLocation);
  const [rewardDesc, setRewardDesc] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setType(editing.type);
        setIssuer(editing.issuer || "");
        setDescription(editing.description || "");
        setRequirements(editing.requirements);
        setPay(String(editing.pay));
        setFee(editing.fee ? String(editing.fee) : "");
        setStatus(editing.status);
        setNotes(editing.notes || "");
        setLocation(editing.location || emptyLocation);
        setRewardDesc(editing.rewards?.map((r) => r.description).join(", ") || "");
      } else {
        setTitle("");
        setType("");
        setIssuer("");
        setDescription("");
        setRequirements("");
        setPay("");
        setFee("");
        setStatus("Active");
        setNotes("");
        setLocation(emptyLocation);
        setRewardDesc("");
      }
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Contract</DialogTitle>
          <DialogDescription>
            {editing ? "Update contract details." : "Log a new contract."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const rewards = rewardDesc.trim()
              ? rewardDesc.split(",").map((r) => ({
                  type: "Other" as const,
                  description: r.trim(),
                }))
              : undefined;
            onSubmit({
              title,
              type,
              issuer: issuer || undefined,
              description: description || undefined,
              requirements,
              pay: Number(pay) || 0,
              fee: fee ? Number(fee) : undefined,
              rewards,
              status,
              location: location.system ? location : undefined,
              notes: notes || undefined,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contract name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Input
                list="contract-type-list"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Contract type..."
              />
              <datalist id="contract-type-list">
                {CONTRACT_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTRACT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Issuer</Label>
            <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Who gave the contract?" />
          </div>
          <div>
            <Label>Requirements *</Label>
            <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="What needs to be done?" rows={2} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pay (aUEC) *</Label>
              <Input type="number" min="0" value={pay} onChange={(e) => setPay(e.target.value)} placeholder="0" required />
            </div>
            <div>
              <Label>Fee (aUEC)</Label>
              <Input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <Label>Rewards (comma-separated)</Label>
            <Input value={rewardDesc} onChange={(e) => setRewardDesc(e.target.value)} placeholder="e.g. Reputation boost, Rare item" />
          </div>
          <div>
            <Label>Location (optional)</Label>
            <LocationSelector value={location} onChange={setLocation} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Contract"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
