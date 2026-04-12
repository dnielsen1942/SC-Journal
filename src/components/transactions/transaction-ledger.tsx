"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Wallet, TrendingUp, TrendingDown, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import type { Transaction } from "@/lib/types/transaction.types";
import { TRANSACTION_CATEGORIES } from "@/lib/types/transaction.types";
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

export function TransactionLedger() {
  const { transactions, loaded, load, add, update, remove } = useTransactionStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (filter && !t.description.toLowerCase().includes(filter.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filter, typeFilter]);

  const totalBalance = useMemo(() => {
    return transactions.reduce(
      (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
      0
    );
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  // Running balance for display
  const withRunningBalance = useMemo(() => {
    // transactions are newest-first, compute balance from oldest
    const sorted = [...filtered].reverse();
    let running = 0;
    const result = sorted.map((t) => {
      running += t.type === "income" ? t.amount : -t.amount;
      return { ...t, runningBalance: running };
    });
    return result.reverse();
  }, [filtered]);

  if (!loaded) return <div className="text-slate-500 py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5" /> Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={totalBalance} className="text-lg font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={totalIncome} className="text-lg font-bold text-emerald-400" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" /> Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={totalExpenses} className="text-lg font-bold text-red-400" />
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search transactions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No transactions yet"
          description="Start tracking your aUEC income and expenses by adding your first transaction."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          }
        />
      ) : (
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_120px_120px_120px_80px] gap-2 px-3 py-2 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-700/30">
            <div>Description</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Balance</div>
            <div className="text-right">Date</div>
            <div />
          </div>
          {withRunningBalance.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-[1fr_120px_120px_120px_80px] gap-2 px-3 py-2.5 rounded-md hover:bg-slate-800/30 items-center group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant={t.type === "income" ? "success" : "destructive"} className="text-[10px] shrink-0">
                  {t.type === "income" ? "IN" : "OUT"}
                </Badge>
                <span className="text-sm text-slate-200 truncate">{t.description}</span>
                {t.category && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {t.category}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <CurrencyDisplay
                  amount={t.amount}
                  showSign
                  className={t.type === "income" ? "text-emerald-400" : "text-red-400"}
                />
              </div>
              <div className="text-right">
                <CurrencyDisplay amount={t.runningBalance} />
              </div>
              <div className="text-right text-xs text-slate-400">
                {formatDateTime(t.createdAt)}
              </div>
              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditing(t);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-400 hover:text-red-300"
                  onClick={() => setDeleteId(t.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={async (data) => {
          if (editing) {
            await update(editing.id, data);
            toast.success("Transaction updated");
          } else {
            await add(data);
            toast.success("Transaction added");
          }
          setFormOpen(false);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This cannot be undone."
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            toast.success("Transaction deleted");
          }
        }}
      />
    </div>
  );
}

// --- Form Dialog ---

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Transaction | null;
  onSubmit: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
}

function TransactionFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: TransactionFormDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(emptyLocation);

  useEffect(() => {
    if (open) {
      if (editing) {
        setDescription(editing.description);
        setAmount(String(editing.amount));
        setType(editing.type);
        setCategory(editing.category);
        setNotes(editing.notes || "");
        setLocation(editing.location || emptyLocation);
      } else {
        setDescription("");
        setAmount("");
        setType("income");
        setCategory("");
        setNotes("");
        setLocation(emptyLocation);
      }
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Transaction</DialogTitle>
          <DialogDescription>
            {editing ? "Update this transaction's details." : "Record a new income or expense."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              description,
              amount: Math.abs(Number(amount)),
              type,
              category,
              notes: notes || undefined,
              location: location.system ? location : undefined,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Description *</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this transaction for?"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (aUEC) *</Label>
              <Input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Input
              list="tx-category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Select or type a category..."
            />
            <datalist id="tx-category-list">
              {TRANSACTION_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Location (optional)</Label>
            <LocationSelector value={location} onChange={setLocation} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Transaction"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
