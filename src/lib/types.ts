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

export const LEAGUES = [
  { id: 39, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 140, name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { id: 135, name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { id: 78, name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { id: 61, name: "Ligue 1", country: "France", flag: "🇫🇷" },
  { id: 94, name: "Primeira Liga", country: "Portugal", flag: "🇵🇹" },
  { id: 88, name: "Eredivisie", country: "Netherlands", flag: "🇳🇱" },
  { id: 203, name: "Süper Lig", country: "Turkey", flag: "🇹🇷" },
  { id: 144, name: "Pro League", country: "Belgium", flag: "🇧🇪" },
  { id: 179, name: "Premiership", country: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
] as const;

export type LeagueId = (typeof LEAGUES)[number]["id"];
