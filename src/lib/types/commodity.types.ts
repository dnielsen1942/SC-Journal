import type { Currency, Location, Timestamped, UUID } from "./common.types";

export interface CommodityTrade extends Timestamped {
  commodity: string;
  action: "buy" | "sell";
  quantity: number; // SCU
  pricePerUnit: Currency;
  totalPrice: Currency;
  location: Location;
  linkedTradeId?: UUID;
  crateId?: UUID;
  notes?: string;
}

export interface HaulingContract extends Timestamped {
  title: string;
  origin: Location;
  destination: Location;
  cargo: string;
  scu: number;
  pay: Currency;
  fee?: Currency;
  status: string;
  shipId?: UUID;
  completedAt?: string;
  linkedTransactionId?: UUID;
  notes?: string;
}

export interface CargoCrate extends Timestamped {
  name: string;
  contents: CrateContent[];
  location: Location;
  shipId?: UUID;
  status: string;
  notes?: string;
}

export interface CrateContent {
  commodity: string;
  quantity: number;
  purchasePrice?: Currency;
}

export const HAULING_STATUSES = [
  "Available",
  "Active",
  "In Transit",
  "Completed",
  "Failed",
  "Abandoned",
] as const;

export const CRATE_STATUSES = [
  "In Transit",
  "Stored",
  "Delivered",
  "Lost",
] as const;
