import type { Currency, Location, Timestamped, UUID } from "./common.types";

export interface InventoryItem extends Timestamped {
  name: string;
  category: string;
  quantity: number;
  location: Location;
  shipId?: UUID;
  notes?: string;
  value?: Currency;
}

export const ITEM_CATEGORIES = [
  "Weapon",
  "Armor",
  "Helmet",
  "Undersuit",
  "Backpack",
  "Medical",
  "Consumable",
  "Tool",
  "Component",
  "Ammunition",
  "FPS Attachment",
  "Clothing",
  "Miscellaneous",
] as const;

export interface Ship extends Timestamped {
  name: string;
  model: string;
  manufacturer: string;
  location: Location;
  status: string;
  insurance?: string;
  loanedOut?: boolean;
  loanedTo?: string;
  purchasePrice?: Currency;
  notes?: string;
}

export const SHIP_STATUSES = [
  "Active",
  "Stored",
  "Destroyed",
  "Claimed",
  "In Transit",
] as const;

export interface ShipComponent extends Timestamped {
  shipId: UUID;
  name: string;
  type: string;
  size: number;
  grade: string;
  manufacturer?: string;
  notes?: string;
}

export const COMPONENT_TYPES = [
  "Quantum Drive",
  "Shield Generator",
  "Power Plant",
  "Cooler",
  "Weapon Hardpoint",
  "Missile Rack",
  "Radar",
  "Avionics",
  "Thruster",
  "Other",
] as const;

export const COMPONENT_GRADES = ["A", "B", "C", "D"] as const;
