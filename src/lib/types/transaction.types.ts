import type { Currency, Location, Timestamped, UUID } from "./common.types";

export interface Transaction extends Timestamped {
  description: string;
  amount: Currency;
  type: "income" | "expense";
  category: string;
  location?: Location;
  relatedEntityId?: UUID;
  relatedEntityType?: "contract" | "trade" | "hauling";
  notes?: string;
}

export const TRANSACTION_CATEGORIES = [
  "Contract Pay",
  "Trading Profit",
  "Trading Loss",
  "Ship Purchase",
  "Ship Sale",
  "Component Purchase",
  "Equipment Purchase",
  "Refuel",
  "Repair",
  "Rearm",
  "Insurance",
  "Fine",
  "Bounty Collected",
  "Gift",
  "Hauling",
  "Rental",
  "Other Income",
  "Other Expense",
] as const;
