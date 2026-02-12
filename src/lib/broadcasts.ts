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
    poland: ["Canal+ Extra 1", "Canal+ Extra 2", "Canal+ Sport 3", "Canal+ Sport 4"],
    uk: ["TNT Sports 1", "TNT Sports 2", "discovery+"],
    usa: ["CBS Sports Network", "Paramount+", "UniMás", "TUDN"],
  },
  73:  { // Europa League
    poland: ["Polsat Sport 1", "Polsat Sport 2", "Polsat Sport 3", "Polsat Box Go"],
    uk: ["TNT Sports 1", "TNT Sports 2", "discovery+"],
    usa: ["CBS Sports Network", "Paramount+", "UniMás"],
  },
  10216: { // Conference League
    poland: ["Polsat Sport 1", "Polsat Sport 2", "Polsat Box Go"],
    uk: ["TNT Sports 1", "TNT Sports 2", "discovery+"],
    usa: ["CBS Sports Golazo", "Paramount+"],
  },

  // England
  47:  { // Premier League
    poland: ["Canal+ Sport", "Canal+ Sport 2", "Canal+ Extra 1", "Canal+ Extra 2", "Canal+ Extra 3", "Viaplay"],
    uk: ["Sky Sports Main Event", "Sky Sports Premier League", "Sky Sports Ultra", "TNT Sports 1", "TNT Sports 2", "Amazon Prime Video"],
    usa: ["NBC", "USA Network", "Peacock", "Telemundo", "Universo"],
  },
  132: { // FA Cup
    poland: ["Viaplay"],
    uk: ["ITV1", "ITV4", "ITVX", "BBC One", "BBC iPlayer"],
    usa: ["ESPN", "ESPN2", "ESPN+"],
  },
  133: { // EFL Cup
    poland: ["Viaplay"],
    uk: ["Sky Sports Main Event", "Sky Sports Football", "Sky Sports+"],
    usa: ["Paramount+"],
  },

  // Spain
  87:  { // LaLiga
    poland: ["Eleven Sports 1", "Eleven Sports 2", "Eleven Sports 3", "Eleven Sports 4"],
    uk: ["Premier Sports 1", "Premier Sports 2", "LaLigaTV"],
    usa: ["ESPN", "ESPN2", "ESPN+", "ESPN Deportes"],
  },
  138: { // Copa del Rey
    poland: ["Eleven Sports 1", "Eleven Sports 2"],
    uk: ["Premier Sports 1"],
    usa: ["ESPN+", "ESPN Deportes"],
  },

  // Italy
  55:  { // Serie A
    poland: ["Eleven Sports 1", "Eleven Sports 2", "Eleven Sports 3", "Eleven Sports 4"],
    uk: ["TNT Sports 1", "TNT Sports 2", "discovery+"],
    usa: ["CBS Sports Network", "CBS Sports Golazo", "Paramount+"],
  },
  141: { // Coppa Italia
    poland: ["Eleven Sports 1", "Eleven Sports 2"],
    uk: [],
    usa: ["CBS Sports Network", "Paramount+"],
  },

  // Germany
  54:  { // Bundesliga
    poland: ["Viaplay"],
    uk: ["Sky Sports Main Event", "Sky Sports Football", "Sky Sports+"],
    usa: ["ESPN", "ESPN2", "ESPN+"],
  },
  209: { // DFB Pokal
    poland: ["Viaplay"],
    uk: [],
    usa: ["ESPN+"],
  },

  // France
  53:  { // Ligue 1
    poland: ["Eleven Sports 1", "Eleven Sports 2"],
    uk: ["beIN Sports 1", "beIN Sports 2"],
    usa: ["beIN Sports", "beIN Sports en Español", "beIN Sports XTRA"],
  },

  // Other European
  61:  { // Liga Portugal
    poland: ["Eleven Sports 1", "Eleven Sports 2"],
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
    uk: ["beIN Sports 1", "beIN Sports 2"],
    usa: ["beIN Sports", "beIN Sports XTRA"],
  },
  40:  { // Belgium First Div A
    poland: [],
    uk: [],
    usa: [],
  },
  64:  { // Scottish Premiership
    poland: ["Viaplay"],
    uk: ["Sky Sports Main Event", "Sky Sports Football", "Sky Sports+"],
    usa: ["CBS Sports Golazo", "Paramount+"],
  },

  // Middle East
  536: { // Saudi Pro League
    poland: ["DAZN"],
    uk: ["DAZN"],
    usa: ["DAZN"],
  },

  // North America
  130: { // MLS
    poland: ["Apple TV (MLS Season Pass)"],
    uk: ["Apple TV (MLS Season Pass)", "Sky Sports Main Event"],
    usa: ["Apple TV (MLS Season Pass)", "FOX", "FS1", "FS2"],
  },

  // South America
  268: { // Brazil Serie A
    poland: [],
    uk: [],
    usa: ["Paramount+", "beIN Sports XTRA"],
  },
  112: { // Liga Profesional Argentina
    poland: [],
    uk: [],
    usa: ["Paramount+", "TyC Sports Internacional"],
  },

  // Poland
  196: { // Ekstraklasa
    poland: ["Canal+ Sport", "Canal+ Sport 2", "Canal+ Sport 3", "Canal+ Extra 1"],
    uk: [],
    usa: [],
  },
  197: { // 1. Liga
    poland: ["Polsat Sport 1", "Polsat Sport 2", "Polsat Sport Extra", "Polsat Box Go"],
    uk: [],
    usa: [],
  },
};

export function getBroadcastForLeague(leagueId: number): BroadcastInfo {
  return BROADCAST_MAP[leagueId] || { poland: [], uk: [], usa: [] };
}
