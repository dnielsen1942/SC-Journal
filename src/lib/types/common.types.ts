export type UUID = string;

export interface Location {
  system: string;
  body: string;
  sublocation: string;
  detail?: string;
}

export type Currency = number; // aUEC stored as integer

export interface Timestamped {
  id: UUID;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export function createTimestamps(): Pick<Timestamped, "id" | "createdAt" | "updatedAt"> {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTimestamp(): Pick<Timestamped, "updatedAt"> {
  return { updatedAt: new Date().toISOString() };
}

export function formatLocation(loc: Location): string {
  const parts = [loc.system, loc.body, loc.sublocation];
  if (loc.detail) parts.push(loc.detail);
  return parts.filter(Boolean).join(" > ");
}

export const emptyLocation: Location = {
  system: "",
  body: "",
  sublocation: "",
};
