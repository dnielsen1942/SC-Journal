"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  BookOpen,
  Trash2,
  Pencil,
  Pin,
  PinOff,
  Search,
  User,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useJournalStore } from "@/lib/stores/journal-store";
import type { JournalEntry } from "@/lib/types/journal.types";
import { JOURNAL_ENTRY_TYPES, MOODS } from "@/lib/types/journal.types";
import { emptyLocation, formatLocation } from "@/lib/types/common.types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";

const entryTypeColors: Record<string, string> = {
  Thought: "bg-purple-950/50 text-purple-300 border-purple-800/50",
  Event: "bg-cyan-950/50 text-cyan-300 border-cyan-800/50",
  Note: "bg-slate-800/50 text-slate-300 border-slate-700/50",
  Story: "bg-amber-950/50 text-amber-300 border-amber-800/50",
  "Character Log": "bg-emerald-950/50 text-emerald-300 border-emerald-800/50",
  "Mission Debrief": "bg-red-950/50 text-red-300 border-red-800/50",
  Lore: "bg-indigo-950/50 text-indigo-300 border-indigo-800/50",
};

export function Journey() {
  const { entries, loaded, load, add, update, remove, togglePin } =
    useJournalStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let result = entries.filter((e) => {
      if (typeFilter !== "all" && e.entryType !== typeFilter) return false;
      if (
        filter &&
        !e.title.toLowerCase().includes(filter.toLowerCase()) &&
        !e.content.toLowerCase().includes(filter.toLowerCase())
      )
        return false;
      return true;
    });
    // Pinned entries first
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    return result;
  }, [entries, filter, typeFilter]);

  if (!loaded)
    return (
      <div className="text-slate-500 py-8 text-center">Loading...</div>
    );

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search entries..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {JOURNAL_ENTRY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No journal entries yet"
          description="Start recording your Star Citizen journey — missions, thoughts, roleplay moments, and more."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New Entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <Card
              key={entry.id}
              className={`group ${entry.pinned ? "border-amber-800/30" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.pinned && (
                        <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      )}
                      <h3 className="text-sm font-medium text-slate-100">
                        {entry.title}
                      </h3>
                      <Badge
                        className={
                          entryTypeColors[entry.entryType] || entryTypeColors.Note
                        }
                      >
                        {entry.entryType}
                      </Badge>
                      {entry.inCharacter && (
                        <Badge
                          variant="outline"
                          className="gap-1 text-[10px]"
                        >
                          <User className="h-2.5 w-2.5" /> In Character
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap line-clamp-4">
                      {entry.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span title={formatDateTime(entry.createdAt)}>
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                      {entry.location && entry.location.system && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {formatLocation(entry.location)}
                        </span>
                      )}
                      {entry.mood && <span>Mood: {entry.mood}</span>}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex gap-1">
                          {entry.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title={entry.pinned ? "Unpin" : "Pin"}
                      onClick={() => {
                        togglePin(entry.id);
                        toast.success(
                          entry.pinned ? "Entry unpinned" : "Entry pinned"
                        );
                      }}
                    >
                      {entry.pinned ? (
                        <PinOff className="h-3 w-3" />
                      ) : (
                        <Pin className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditing(entry);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-300"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <JournalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={async (data) => {
          if (editing) {
            await update(editing.id, data);
            toast.success("Entry updated");
          } else {
            await add(data);
            toast.success("Entry added");
          }
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Entry"
        description="Are you sure you want to delete this journal entry? This cannot be undone."
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            toast.success("Entry deleted");
          }
        }}
      />
    </div>
  );
}

// --- Form Dialog ---

interface JournalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: JournalEntry | null;
  onSubmit: (
    data: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">
  ) => void;
}

function JournalFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: JournalFormDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("Note");
  const [tagsStr, setTagsStr] = useState("");
  const [mood, setMood] = useState("");
  const [inCharacter, setInCharacter] = useState(false);
  const [location, setLocation] = useState(emptyLocation);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setContent(editing.content);
        setEntryType(editing.entryType);
        setTagsStr(editing.tags?.join(", ") || "");
        setMood(editing.mood || "");
        setInCharacter(editing.inCharacter);
        setLocation(editing.location || emptyLocation);
      } else {
        setTitle("");
        setContent("");
        setEntryType("Note");
        setTagsStr("");
        setMood("");
        setInCharacter(false);
        setLocation(emptyLocation);
      }
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "New"} Journal Entry</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update your journal entry."
              : "Record a thought, event, or story from your journey."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const tags = tagsStr
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            onSubmit({
              title,
              content,
              entryType,
              tags: tags.length > 0 ? tags : undefined,
              mood: mood || undefined,
              inCharacter,
              location: location.system ? location : undefined,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Entry Type</Label>
              <Input
                list="entry-type-list"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                placeholder="Type..."
              />
              <datalist id="entry-type-list">
                {JOURNAL_ENTRY_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Mood</Label>
              <Input
                list="mood-list"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="How are you feeling?"
              />
              <datalist id="mood-list">
                {MOODS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <Label>Content *</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your journal entry..."
              rows={6}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inCharacter"
              checked={inCharacter}
              onChange={(e) => setInCharacter(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
            />
            <Label htmlFor="inCharacter" className="cursor-pointer">
              In-Character / Roleplay Mode
            </Label>
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. combat, trading, exploration"
            />
          </div>
          <div>
            <Label>Location (optional)</Label>
            <LocationSelector value={location} onChange={setLocation} />
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
              {editing ? "Save Changes" : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
