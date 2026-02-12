import { TopScorer, Standing } from "./types";

const API_KEY = process.env.API_FOOTBALL_KEY || "";
const BASE_URL = "https://v3.football.api-sports.io";

// In-memory cache with TTL
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function apiRequest(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": API_KEY,
    },
    next: { revalidate: 300 }, // Revalidate every 5 mins
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  setCache(cacheKey, json);
  return json;
}

function getCurrentSeason(): number {
  const now = new Date();
  // Football seasons typically start in August
  // If we're before August, use previous year as season start
  return now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();
}

export async function getTopScorers(
  leagueId: number,
  season?: number
): Promise<TopScorer[]> {
  const s = season || getCurrentSeason();
  try {
    const data = await apiRequest("/players/topscorers", {
      league: leagueId.toString(),
      season: s.toString(),
    });

    if (!data.response || data.response.length === 0) return [];

    return data.response.map(
      (item: {
        player: {
          id: number;
          name: string;
          firstname: string;
          lastname: string;
          age: number;
          nationality: string;
          photo: string;
        };
        statistics: Array<{
          team: { id: number; name: string; logo: string };
          games: { appearences: number; minutes: number; rating: string | null };
          goals: { total: number; assists: number };
          penalty: { scored: number; missed: number };
          cards: { yellow: number; red: number };
        }>;
      }, index: number) => {
        const stats = item.statistics[0];
        return {
          rank: index + 1,
          player: item.player,
          team: stats.team,
          goals: stats.goals.total || 0,
          assists: stats.goals.assists || 0,
          penalties: stats.penalty.scored || 0,
          penaltyMissed: stats.penalty.missed || 0,
          appearances: stats.games.appearences || 0,
          minutes: stats.games.minutes || 0,
          rating: stats.games.rating,
          yellowCards: stats.cards.yellow || 0,
          redCards: stats.cards.red || 0,
        };
      }
    );
  } catch (error) {
    console.error(`Error fetching top scorers for league ${leagueId}:`, error);
    return [];
  }
}

export async function getTopAssists(
  leagueId: number,
  season?: number
): Promise<TopScorer[]> {
  const s = season || getCurrentSeason();
  try {
    const data = await apiRequest("/players/topassists", {
      league: leagueId.toString(),
      season: s.toString(),
    });

    if (!data.response || data.response.length === 0) return [];

    return data.response.map(
      (item: {
        player: {
          id: number;
          name: string;
          firstname: string;
          lastname: string;
          age: number;
          nationality: string;
          photo: string;
        };
        statistics: Array<{
          team: { id: number; name: string; logo: string };
          games: { appearences: number; minutes: number; rating: string | null };
          goals: { total: number; assists: number };
          penalty: { scored: number; missed: number };
          cards: { yellow: number; red: number };
        }>;
      }, index: number) => {
        const stats = item.statistics[0];
        return {
          rank: index + 1,
          player: item.player,
          team: stats.team,
          goals: stats.goals.total || 0,
          assists: stats.goals.assists || 0,
          penalties: stats.penalty.scored || 0,
          penaltyMissed: stats.penalty.missed || 0,
          appearances: stats.games.appearences || 0,
          minutes: stats.games.minutes || 0,
          rating: stats.games.rating,
          yellowCards: stats.cards.yellow || 0,
          redCards: stats.cards.red || 0,
        };
      }
    );
  } catch (error) {
    console.error(`Error fetching top assists for league ${leagueId}:`, error);
    return [];
  }
}

export async function getStandings(
  leagueId: number,
  season?: number
): Promise<Standing[]> {
  const s = season || getCurrentSeason();
  try {
    const data = await apiRequest("/standings", {
      league: leagueId.toString(),
      season: s.toString(),
    });

    if (
      !data.response ||
      data.response.length === 0 ||
      !data.response[0].league?.standings?.[0]
    )
      return [];

    return data.response[0].league.standings[0].map(
      (item: {
        rank: number;
        team: { id: number; name: string; logo: string };
        points: number;
        all: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: { for: number; against: number };
        };
        goalsDiff: number;
        form: string;
      }) => ({
        rank: item.rank,
        team: item.team,
        points: item.points,
        played: item.all.played,
        win: item.all.win,
        draw: item.all.draw,
        lose: item.all.lose,
        goalsFor: item.all.goals.for,
        goalsAgainst: item.all.goals.against,
        goalsDiff: item.goalsDiff,
        form: item.form || "",
      })
    );
  } catch (error) {
    console.error(`Error fetching standings for league ${leagueId}:`, error);
    return [];
  }
}
