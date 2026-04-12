export interface ShipInfo {
  model: string;
  manufacturer: string;
}

export const MANUFACTURERS = [
  "Aegis Dynamics",
  "Anvil Aerospace",
  "Aopoa",
  "Argo Astronautics",
  "Banu",
  "CNOU (Consolidated Outland)",
  "Crusader Industries",
  "Drake Interplanetary",
  "Esperia",
  "Gatac",
  "Greycat Industrial",
  "Kruger Intergalactic",
  "MISC (Musashi Industrial)",
  "Origin Jumpworks",
  "RSI (Roberts Space Industries)",
  "Tumbril",
  "Vanduul",
] as const;

export const SHIPS: ShipInfo[] = [
  // Aegis
  { model: "Avenger Stalker", manufacturer: "Aegis Dynamics" },
  { model: "Avenger Titan", manufacturer: "Aegis Dynamics" },
  { model: "Avenger Warlock", manufacturer: "Aegis Dynamics" },
  { model: "Eclipse", manufacturer: "Aegis Dynamics" },
  { model: "Gladius", manufacturer: "Aegis Dynamics" },
  { model: "Hammerhead", manufacturer: "Aegis Dynamics" },
  { model: "Idris-M", manufacturer: "Aegis Dynamics" },
  { model: "Reclaimer", manufacturer: "Aegis Dynamics" },
  { model: "Redeemer", manufacturer: "Aegis Dynamics" },
  { model: "Retaliator Bomber", manufacturer: "Aegis Dynamics" },
  { model: "Sabre", manufacturer: "Aegis Dynamics" },
  { model: "Vanguard Harbinger", manufacturer: "Aegis Dynamics" },
  { model: "Vanguard Sentinel", manufacturer: "Aegis Dynamics" },
  { model: "Vanguard Warden", manufacturer: "Aegis Dynamics" },
  { model: "Vulcan", manufacturer: "Aegis Dynamics" },

  // Anvil
  { model: "Arrow", manufacturer: "Anvil Aerospace" },
  { model: "C8X Pisces Expedition", manufacturer: "Anvil Aerospace" },
  { model: "Carrack", manufacturer: "Anvil Aerospace" },
  { model: "F7C Hornet", manufacturer: "Anvil Aerospace" },
  { model: "F7C-M Super Hornet", manufacturer: "Anvil Aerospace" },
  { model: "Gladiator", manufacturer: "Anvil Aerospace" },
  { model: "Hurricane", manufacturer: "Anvil Aerospace" },
  { model: "Terrapin", manufacturer: "Anvil Aerospace" },
  { model: "Valkyrie", manufacturer: "Anvil Aerospace" },

  // Argo
  { model: "MPUV Cargo", manufacturer: "Argo Astronautics" },
  { model: "MPUV Personnel", manufacturer: "Argo Astronautics" },
  { model: "RAFT", manufacturer: "Argo Astronautics" },

  // CNOU
  { model: "Mustang Alpha", manufacturer: "CNOU (Consolidated Outland)" },
  { model: "Mustang Delta", manufacturer: "CNOU (Consolidated Outland)" },
  { model: "Nomad", manufacturer: "CNOU (Consolidated Outland)" },
  { model: "Pioneer", manufacturer: "CNOU (Consolidated Outland)" },

  // Crusader
  { model: "A2 Hercules", manufacturer: "Crusader Industries" },
  { model: "C2 Hercules", manufacturer: "Crusader Industries" },
  { model: "M2 Hercules", manufacturer: "Crusader Industries" },
  { model: "Mercury Star Runner", manufacturer: "Crusader Industries" },
  { model: "Ares Starfighter Inferno", manufacturer: "Crusader Industries" },
  { model: "Ares Starfighter Ion", manufacturer: "Crusader Industries" },
  { model: "Spirit A1", manufacturer: "Crusader Industries" },
  { model: "Spirit C1", manufacturer: "Crusader Industries" },
  { model: "Spirit E1", manufacturer: "Crusader Industries" },

  // Drake
  { model: "Buccaneer", manufacturer: "Drake Interplanetary" },
  { model: "Caterpillar", manufacturer: "Drake Interplanetary" },
  { model: "Corsair", manufacturer: "Drake Interplanetary" },
  { model: "Cutlass Black", manufacturer: "Drake Interplanetary" },
  { model: "Cutlass Blue", manufacturer: "Drake Interplanetary" },
  { model: "Cutlass Red", manufacturer: "Drake Interplanetary" },
  { model: "Cutlass Steel", manufacturer: "Drake Interplanetary" },
  { model: "Dragonfly", manufacturer: "Drake Interplanetary" },
  { model: "Herald", manufacturer: "Drake Interplanetary" },
  { model: "Vulture", manufacturer: "Drake Interplanetary" },

  // Esperia
  { model: "Blade", manufacturer: "Esperia" },
  { model: "Prowler", manufacturer: "Esperia" },
  { model: "Talon", manufacturer: "Esperia" },

  // Gatac
  { model: "Railen", manufacturer: "Gatac" },
  { model: "Syulen", manufacturer: "Gatac" },

  // Greycat
  { model: "ROC", manufacturer: "Greycat Industrial" },
  { model: "ROC-DS", manufacturer: "Greycat Industrial" },
  { model: "STV", manufacturer: "Greycat Industrial" },

  // Kruger
  { model: "P-52 Merlin", manufacturer: "Kruger Intergalactic" },
  { model: "P-72 Archimedes", manufacturer: "Kruger Intergalactic" },

  // MISC
  { model: "Freelancer", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Freelancer DUR", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Freelancer MAX", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Freelancer MIS", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Hull A", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Hull B", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Hull C", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Prospector", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Razor", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Reliant Kore", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Reliant Mako", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Reliant Sen", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Reliant Tana", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Starfarer", manufacturer: "MISC (Musashi Industrial)" },
  { model: "Starfarer Gemini", manufacturer: "MISC (Musashi Industrial)" },

  // Origin
  { model: "100i", manufacturer: "Origin Jumpworks" },
  { model: "125a", manufacturer: "Origin Jumpworks" },
  { model: "135c", manufacturer: "Origin Jumpworks" },
  { model: "300i", manufacturer: "Origin Jumpworks" },
  { model: "315p", manufacturer: "Origin Jumpworks" },
  { model: "325a", manufacturer: "Origin Jumpworks" },
  { model: "350r", manufacturer: "Origin Jumpworks" },
  { model: "400i", manufacturer: "Origin Jumpworks" },
  { model: "600i Explorer", manufacturer: "Origin Jumpworks" },
  { model: "600i Touring", manufacturer: "Origin Jumpworks" },
  { model: "890 Jump", manufacturer: "Origin Jumpworks" },

  // RSI
  { model: "Aurora CL", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Aurora ES", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Aurora LN", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Aurora MR", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Constellation Andromeda", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Constellation Aquila", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Constellation Phoenix", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Constellation Taurus", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Mantis", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Scorpius", manufacturer: "RSI (Roberts Space Industries)" },
  { model: "Polaris", manufacturer: "RSI (Roberts Space Industries)" },

  // Tumbril
  { model: "Cyclone", manufacturer: "Tumbril" },
  { model: "Cyclone AA", manufacturer: "Tumbril" },
  { model: "Cyclone MT", manufacturer: "Tumbril" },
  { model: "Cyclone RC", manufacturer: "Tumbril" },
  { model: "Cyclone TR", manufacturer: "Tumbril" },
  { model: "Nova Tank", manufacturer: "Tumbril" },
  { model: "Storm", manufacturer: "Tumbril" },
  { model: "Storm AA", manufacturer: "Tumbril" },
];

export function getShipModels(): string[] {
  return SHIPS.map((s) => s.model);
}

export function getManufacturerForModel(model: string): string | undefined {
  return SHIPS.find((s) => s.model === model)?.manufacturer;
}
