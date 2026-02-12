export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

export interface Player {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  nationality: string;
  photo: string;
}

export interface PlayerStats {
  player: Player;
  statistics: {
    team: {
      id: number;
      name: string;
      logo: string;
    };
    games: {
      appearences: number;
      minutes: number;
      rating: string | null;
    };
    goals: {
      total: number;
      assists: number;
    };
    penalty: {
      scored: number;
      missed: number;
    };
    cards: {
      yellow: number;
      red: number;
    };
  }[];
}

export interface TopScorer {
  rank: number;
  player: Player;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  goals: number;
  assists: number;
  penalties: number;
  penaltyMissed: number;
  appearances: number;
  minutes: number;
  rating: string | null;
  yellowCards: number;
  redCards: number;
}

export interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  form: string;
}

export interface LeagueData {
  league: League;
  topScorers: TopScorer[];
  topAssists: TopScorer[];
  standings: Standing[];
}

export function leagueLogoUrl(leagueId: number): string {
  return `https://images.fotmob.com/image_resources/logo/leaguelogo/dark/${leagueId}.png`;
}

export const LEAGUES = [
  // European Cups
  { id: 42, name: "Champions League", country: "Europe", flag: "🏆" },
  { id: 73, name: "Europa League", country: "Europe", flag: "🏆" },
  { id: 10216, name: "Conference League", country: "Europe", flag: "🏆" },
  // Top European Leagues
  { id: 47, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 87, name: "LaLiga", country: "Spain", flag: "🇪🇸" },
  { id: 55, name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { id: 54, name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { id: 53, name: "Ligue 1", country: "France", flag: "🇫🇷" },
  { id: 61, name: "Liga Portugal", country: "Portugal", flag: "🇵🇹" },
  { id: 57, name: "Eredivisie", country: "Netherlands", flag: "🇳🇱" },
  { id: 71, name: "Süper Lig", country: "Turkey", flag: "🇹🇷" },
  { id: 40, name: "First Division A", country: "Belgium", flag: "🇧🇪" },
  { id: 64, name: "Premiership", country: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  // Middle East
  { id: 536, name: "Saudi Pro League", country: "Saudi Arabia", flag: "🇸🇦" },
  // South America
  { id: 268, name: "Serie A", country: "Brazil", flag: "🇧🇷" },
  { id: 112, name: "Liga Profesional", country: "Argentina", flag: "🇦🇷" },
  // Poland
  { id: 196, name: "Ekstraklasa", country: "Poland", flag: "🇵🇱" },
  { id: 197, name: "1. Liga", country: "Poland", flag: "🇵🇱" },
] as const;

export type LeagueId = (typeof LEAGUES)[number]["id"];
