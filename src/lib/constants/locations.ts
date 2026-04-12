export interface LocationData {
  bodies: {
    [body: string]: {
      sublocations: string[];
    };
  };
}

export const SYSTEMS: Record<string, LocationData> = {
  Stanton: {
    bodies: {
      "Hurston": {
        sublocations: [
          "Lorville",
          "Everus Harbor",
          "HDMS-Oparei",
          "HDMS-Hadley",
          "HDMS-Edmond",
          "HDMS-Stanhope",
          "HDMS-Thedus",
          "HDMS-Pinewood",
        ],
      },
      "Crusader": {
        sublocations: [
          "Orison",
          "Port Olisar",
          "Seraphim Station",
          "Grim HEX",
        ],
      },
      "ArcCorp": {
        sublocations: [
          "Area 18",
          "Baijini Point",
          "HDMS-Lathan",
          "HDMS-Shubin",
        ],
      },
      "microTech": {
        sublocations: [
          "New Babbage",
          "Port Tressler",
          "HDMS-Stormwal",
          "HDMS-Crevasse",
        ],
      },
      "Cellin": {
        sublocations: [
          "Security Post Kareah",
          "HDMS-Shiro",
          "HDMS-Brecken",
        ],
      },
      "Daymar": {
        sublocations: [
          "Shubin Mining SCD-1",
          "Bountiful Harvest Hydroponics",
          "Kudre Ore",
          "ArcCorp Mining Area 141",
        ],
      },
      "Yela": {
        sublocations: [
          "Deakins Research",
          "ArcCorp Mining Area 157",
          "Benson Mining Outpost",
        ],
      },
      "Aberdeen": {
        sublocations: [
          "HDMS-Anderson",
          "HDMS-Norgaard",
        ],
      },
      "Arial": {
        sublocations: [
          "HDMS-Bezdek",
          "HDMS-Lazar",
        ],
      },
      "Ita": {
        sublocations: [],
      },
      "Magda": {
        sublocations: [
          "HDMS-Hahn",
          "HDMS-Perlman",
        ],
      },
      "Clio": {
        sublocations: [
          "Rayari Deltana Research Outpost",
          "Rayari Anvik Research Outpost",
        ],
      },
      "Calliope": {
        sublocations: [
          "Rayari Kaltag Research Outpost",
          "Rayari McGrath Research Outpost",
        ],
      },
      "Euterpe": {
        sublocations: [],
      },
    },
  },
  Pyro: {
    bodies: {
      "Pyro I": { sublocations: [] },
      "Pyro II": { sublocations: ["Ruin Station"] },
      "Pyro III": { sublocations: [] },
      "Pyro IV": { sublocations: [] },
      "Pyro V": { sublocations: [] },
      "Pyro VI": { sublocations: [] },
      "Bloom": { sublocations: [] },
      "Ignis": { sublocations: [] },
      "Vatra": { sublocations: [] },
      "Fairo": { sublocations: [] },
      "Terminus": { sublocations: [] },
    },
  },
};

export function getSystemNames(): string[] {
  return Object.keys(SYSTEMS);
}

export function getBodyNames(system: string): string[] {
  return Object.keys(SYSTEMS[system]?.bodies ?? {});
}

export function getSublocationNames(system: string, body: string): string[] {
  return SYSTEMS[system]?.bodies[body]?.sublocations ?? [];
}
