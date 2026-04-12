import type { Location, Timestamped } from "./common.types";

export interface JournalEntry extends Timestamped {
  title: string;
  content: string;
  entryType: string;
  tags?: string[];
  location?: Location;
  mood?: string;
  inCharacter: boolean;
  pinned?: boolean;
}

export const JOURNAL_ENTRY_TYPES = [
  "Thought",
  "Event",
  "Note",
  "Story",
  "Character Log",
  "Mission Debrief",
  "Lore",
] as const;

export const MOODS = [
  "Confident",
  "Cautious",
  "Excited",
  "Frustrated",
  "Peaceful",
  "Determined",
  "Desperate",
  "Victorious",
] as const;
