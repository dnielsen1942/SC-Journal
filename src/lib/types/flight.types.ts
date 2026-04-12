import type { Currency, Location, Timestamped, UUID } from "./common.types";

export interface FlightPlan extends Timestamped {
  name: string;
  shipId: UUID;
  origin: Location;
  destination: Location;
  waypoints?: FlightWaypoint[];
  status: string;
  purpose: string;
  // Linked entities from other tabs
  linkedContractIds?: UUID[];
  linkedHaulingIds?: UUID[];
  // Flight details
  estimatedDuration?: string; // e.g. "15 min", "2 hr"
  fuelEstimate?: string;
  cargoScu?: number;
  crewSize?: number;
  threatLevel?: string;
  // Timing
  departedAt?: string; // ISO 8601
  arrivedAt?: string;  // ISO 8601
  // Log entries recorded during the flight
  logEntries?: FlightLogEntry[];
  notes?: string;
}

export interface FlightWaypoint {
  location: Location;
  purpose?: string; // "Refuel", "Pickup", "Dropoff", "Restock", etc.
  order: number;
  reached?: boolean;
}

export interface FlightLogEntry {
  timestamp: string; // ISO 8601
  message: string;
  type: string; // "info", "warning", "danger", "milestone"
}

export const FLIGHT_STATUSES = [
  "Planned",
  "Pre-Flight",
  "In Progress",
  "Completed",
  "Aborted",
  "Diverted",
] as const;

export const FLIGHT_PURPOSES = [
  "Contract Run",
  "Hauling",
  "Trading",
  "Exploration",
  "Combat Sortie",
  "Mining Expedition",
  "Salvage Run",
  "Patrol",
  "Escort",
  "Sightseeing",
  "Relocation",
  "Resupply",
  "Other",
] as const;

export const THREAT_LEVELS = [
  "None",
  "Low",
  "Medium",
  "High",
  "Extreme",
] as const;

export const WAYPOINT_PURPOSES = [
  "Refuel",
  "Pickup",
  "Dropoff",
  "Restock",
  "Rendezvous",
  "Rest Stop",
  "Quantum Calibration",
  "Scouting",
  "Other",
] as const;

export const LOG_ENTRY_TYPES = [
  "Info",
  "Warning",
  "Danger",
  "Milestone",
] as const;
