// Static broadcast mapping: league ID → channels per country
// Broadcast rights for the 2025/26 season

export interface BroadcastInfo {
  poland: string[];
  uk: string[];
  usa: string[];
}

export const BROADCAST_MAP: Record<number, BroadcastInfo> = {
  // European Cups
  42:  { // Champions League
    poland: ["Canal+ Premium"],
    uk: ["TNT Sports"],
    usa: ["Paramount+"],
  },
  73:  { // Europa League
    poland: ["Polsat Sport Premium"],
    uk: ["TNT Sports"],
    usa: ["Paramount+"],
  },
  10216: { // Conference League
    poland: ["Polsat Sport Premium"],
    uk: ["TNT Sports"],
    usa: ["Paramount+"],
  },

  // England
  47:  { // Premier League
    poland: ["Canal+"],
    uk: ["Sky Sports", "TNT Sports"],
    usa: ["Peacock", "NBC"],
  },
  132: { // FA Cup
    poland: ["Viaplay"],
    uk: ["ITV", "BBC"],
    usa: ["ESPN+"],
  },
  133: { // EFL Cup
    poland: ["Viaplay"],
    uk: ["Sky Sports"],
    usa: ["Paramount+"],
  },

  // Spain
  87:  { // LaLiga
    poland: ["Eleven Sports"],
    uk: ["Premier Sports", "LaLigaTV"],
    usa: ["ESPN+"],
  },
  138: { // Copa del Rey
    poland: ["Eleven Sports"],
    uk: ["ITV", "Premier Sports"],
    usa: ["ESPN+"],
  },

  // Italy
  55:  { // Serie A
    poland: ["Eleven Sports"],
    uk: ["TNT Sports"],
    usa: ["Paramount+"],
  },
  141: { // Coppa Italia
    poland: ["Eleven Sports"],
    uk: [],
    usa: ["Paramount+"],
  },

  // Germany
  54:  { // Bundesliga
    poland: ["Viaplay"],
    uk: ["Sky Sports"],
    usa: ["ESPN+"],
  },
  209: { // DFB Pokal
    poland: ["Viaplay"],
    uk: [],
    usa: ["ESPN+"],
  },

  // France
  53:  { // Ligue 1
    poland: ["Eleven Sports"],
    uk: ["beIN Sports"],
    usa: ["beIN Sports"],
  },

  // Other European
  61:  { // Liga Portugal
    poland: ["Eleven Sports"],
    uk: [],
    usa: ["GolTV"],
  },
  57:  { // Eredivisie
    poland: ["Viaplay"],
    uk: ["Viaplay"],
    usa: ["ESPN+"],
  },
  71:  { // Süper Lig
    poland: [],
    uk: ["beIN Sports"],
    usa: ["beIN Sports"],
  },
  40:  { // Belgium First Div A
    poland: [],
    uk: ["DAZN"],
    usa: [],
  },
  64:  { // Scottish Premiership
    poland: ["Viaplay"],
    uk: ["Sky Sports"],
    usa: ["Paramount+"],
  },

  // Middle East
  536: { // Saudi Pro League
    poland: ["DAZN"],
    uk: ["DAZN"],
    usa: ["DAZN"],
  },

  // North America
  130: { // MLS
    poland: ["Apple TV"],
    uk: ["Apple TV"],
    usa: ["Apple TV (MLS Season Pass)"],
  },

  // South America
  268: { // Brazil Serie A
    poland: [],
    uk: ["Premier Sports"],
    usa: ["Paramount+"],
  },
  112: { // Liga Profesional Argentina
    poland: [],
    uk: [],
    usa: ["Paramount+"],
  },

  // Poland
  196: { // Ekstraklasa
    poland: ["Canal+"],
    uk: [],
    usa: [],
  },
  197: { // 1. Liga
    poland: ["Polsat Sport"],
    uk: [],
    usa: [],
  },
};

export function getBroadcastForLeague(leagueId: number): BroadcastInfo {
  return BROADCAST_MAP[leagueId] || { poland: [], uk: [], usa: [] };
}
