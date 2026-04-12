import type { Currency, Location, Timestamped, UUID } from "./common.types";

export interface Contract extends Timestamped {
  title: string;
  type: string;
  issuer?: string;
  description?: string;
  requirements: string;
  pay: Currency;
  fee?: Currency;
  rewards?: ContractReward[];
  status: string;
  location?: Location;
  deadline?: string;
  completedAt?: string;
  linkedTransactionId?: UUID;
  notes?: string;
}

export interface ContractReward {
  type: string;
  description: string;
  value?: Currency;
}

export const CONTRACT_TYPES = [
  "Bounty",
  "Delivery",
  "Mining",
  "Salvage",
  "Investigation",
  "Mercenary",
  "Escort",
  "Racing",
  "Smuggling",
  "Personal",
  "Other",
] as const;

export const CONTRACT_STATUSES = [
  "Available",
  "Active",
  "Completed",
  "Failed",
  "Abandoned",
] as const;

export const REWARD_TYPES = [
  "Item",
  "Reputation",
  "Access",
  "Currency",
  "Other",
] as const;
