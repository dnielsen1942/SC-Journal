export interface CommodityInfo {
  name: string;
  category: string;
}

export const COMMODITY_CATEGORIES = [
  "Metals",
  "Minerals",
  "Agricultural",
  "Gas",
  "Scrap",
  "Vice",
  "Medical",
  "Waste",
  "Harvestable",
] as const;

export const COMMODITIES: CommodityInfo[] = [
  // Metals
  { name: "Aluminum", category: "Metals" },
  { name: "Copper", category: "Metals" },
  { name: "Gold", category: "Metals" },
  { name: "Iron", category: "Metals" },
  { name: "Titanium", category: "Metals" },
  { name: "Tungsten", category: "Metals" },

  // Minerals
  { name: "Agricium", category: "Minerals" },
  { name: "Beryl", category: "Minerals" },
  { name: "Bexalite", category: "Minerals" },
  { name: "Borase", category: "Minerals" },
  { name: "Corundum", category: "Minerals" },
  { name: "Diamond", category: "Minerals" },
  { name: "Hephaestanite", category: "Minerals" },
  { name: "Laranite", category: "Minerals" },
  { name: "Quantanium", category: "Minerals" },
  { name: "Quartz", category: "Minerals" },
  { name: "Taranite", category: "Minerals" },

  // Agricultural
  { name: "Agricultural Supplies", category: "Agricultural" },
  { name: "Distilled Spirits", category: "Agricultural" },
  { name: "Processed Food", category: "Agricultural" },
  { name: "Stims", category: "Agricultural" },

  // Gas
  { name: "Hydrogen", category: "Gas" },
  { name: "Fluorine", category: "Gas" },
  { name: "Chlorine", category: "Gas" },

  // Scrap
  { name: "Scrap", category: "Scrap" },
  { name: "Waste", category: "Waste" },

  // Vice
  { name: "Altruciatoxin", category: "Vice" },
  { name: "E'tam", category: "Vice" },
  { name: "Maze", category: "Vice" },
  { name: "Neon", category: "Vice" },
  { name: "Slam", category: "Vice" },
  { name: "WiDoW", category: "Vice" },

  // Medical
  { name: "Medical Supplies", category: "Medical" },
  { name: "Revenant Tree Pollen", category: "Medical" },

  // Harvestable
  { name: "Aphorite", category: "Harvestable" },
  { name: "Dolivine", category: "Harvestable" },
  { name: "Hadanite", category: "Harvestable" },
];

export function getCommodityNames(): string[] {
  return COMMODITIES.map((c) => c.name);
}

export function getCommoditiesByCategory(category: string): CommodityInfo[] {
  return COMMODITIES.filter((c) => c.category === category);
}
