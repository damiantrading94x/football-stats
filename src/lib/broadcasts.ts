// Static broadcast mapping: league ID → channels per country
// Broadcast rights for the 2025/26 season

export interface BroadcastInfo {
  poland: string[];
  uk: string[];
  usa: string[];
}

export const BROADCAST_MAP: Record<number, BroadcastInfo> = {
  // European Cups
  42:  { poland: ["Canal+"],                     uk: ["TNT Sports"],                          usa: ["CBS Sports", "Paramount+"] },       // Champions League
  73:  { poland: ["Polsat Sport"],               uk: ["TNT Sports"],                          usa: ["CBS Sports", "Paramount+"] },       // Europa League
  10216:{ poland: ["Polsat Sport"],              uk: ["TNT Sports"],                          usa: ["CBS Sports", "Paramount+"] },       // Conference League

  // England
  47:  { poland: ["Viaplay", "Canal+"],          uk: ["Sky Sports", "TNT Sports"],            usa: ["NBC", "Peacock", "USA Network"] },  // Premier League
  132: { poland: ["Viaplay"],                    uk: ["ITV", "BBC"],                          usa: ["ESPN+"] },                          // FA Cup
  133: { poland: ["Viaplay"],                    uk: ["Sky Sports"],                          usa: ["Paramount+"] },                     // EFL Cup

  // Spain
  87:  { poland: ["Eleven Sports"],              uk: ["Premier Sports"],                      usa: ["ESPN+"] },                          // LaLiga
  138: { poland: ["Eleven Sports"],              uk: ["Premier Sports"],                      usa: ["ESPN+"] },                          // Copa del Rey

  // Italy
  55:  { poland: ["Eleven Sports"],              uk: ["TNT Sports"],                          usa: ["CBS Sports", "Paramount+"] },       // Serie A
  141: { poland: ["Eleven Sports"],              uk: [],                                      usa: ["CBS Sports", "Paramount+"] },       // Coppa Italia

  // Germany
  54:  { poland: ["Viaplay"],                    uk: ["Sky Sports"],                          usa: ["ESPN+"] },                          // Bundesliga
  209: { poland: ["Viaplay"],                    uk: [],                                      usa: ["ESPN+"] },                          // DFB Pokal

  // France
  53:  { poland: ["Eleven Sports"],              uk: ["beIN Sports"],                         usa: ["beIN Sports"] },                    // Ligue 1

  // Other European
  61:  { poland: ["Eleven Sports"],              uk: [],                                      usa: ["GolTV"] },                          // Liga Portugal
  57:  { poland: ["Viaplay"],                    uk: ["Viaplay"],                             usa: ["ESPN+"] },                          // Eredivisie
  71:  { poland: [],                             uk: ["beIN Sports"],                         usa: ["beIN Sports"] },                    // Süper Lig
  40:  { poland: [],                             uk: [],                                      usa: [] },                                 // Belgium First Div A
  64:  { poland: ["Viaplay"],                    uk: ["Sky Sports"],                          usa: ["CBS Sports"] },                     // Scottish Premiership

  // Middle East
  536: { poland: ["DAZN"],                       uk: ["DAZN"],                                usa: ["DAZN"] },                           // Saudi Pro League

  // North America
  130: { poland: ["Apple TV"],                   uk: ["Apple TV", "Sky Sports"],              usa: ["Apple TV", "MLS Season Pass"] },    // MLS

  // South America
  268: { poland: [],                             uk: [],                                      usa: ["Paramount+"] },                     // Brazil Serie A
  112: { poland: [],                             uk: [],                                      usa: ["Paramount+"] },                     // Liga Profesional

  // Poland
  196: { poland: ["Canal+"],                     uk: [],                                      usa: [] },                                 // Ekstraklasa
  197: { poland: ["Polsat Sport"],               uk: [],                                      usa: [] },                                 // 1. Liga
};

export function getBroadcastForLeague(leagueId: number): BroadcastInfo {
  return BROADCAST_MAP[leagueId] || { poland: [], uk: [], usa: [] };
}
