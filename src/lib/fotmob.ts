import { TopScorer, Standing } from "./types";
import { Fixture } from "@/components/FixturesList";

const FOTMOB_BASE = "https://www.fotmob.com/api";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.fotmob.com/",
};

// In-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

function playerPhotoUrl(playerId: number): string {
  return `https://images.fotmob.com/image_resources/playerimages/${playerId}.png`;
}

function teamLogoUrl(teamId: number): string {
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
}

// ──────────────────────────────────────────────
// Fetch league overview (standings + season ID)
// ──────────────────────────────────────────────

interface FotMobLeagueResponse {
  details: { id: number; name: string; country: string };
  table: Array<{
    data: {
      table: {
        all: FotMobStanding[];
      };
    };
    teamForm?: Record<string, { formRaw: string[] }>;
  }>;
  stats: {
    seasonStatLinks: Array<{ TournamentId: number; Name: string }>;
    players?: Array<{
      header: string;
      name: string;
      fetchAllUrl: string;
      topThree: FotMobTopPlayer[];
    }>;
  };
}

interface FotMobStanding {
  name: string;
  shortName: string;
  id: number;
  pageUrl: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scoresStr: string; // "49-17"
  goalConDiff: number;
  pts: number;
  idx: number;
  qualColor: string | null;
}

interface FotMobTopPlayer {
  id: number;
  name: string;
  rank: number;
  ccode: string;
  teamId: number;
  teamName: string;
  value: number;
  stat: { name: string; value: number };
  teamColors: { darkMode: string; lightMode: string };
}

interface FotMobDeepStatsResponse {
  statsData: FotMobDeepStatPlayer[];
  statsList: Array<{ name: string; title: string }>;
  currentSeasonId: string;
}

interface FotMobDeepStatPlayer {
  id: number;
  teamId: number;
  name: string;
  position: number;
  statValue: { name: string; value: number };
  substatValue?: { value: number };
  rank: number;
}

async function fotmobFetch<T>(url: string): Promise<T> {
  const cached = getCached<T>(url);
  if (cached) return cached;

  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`FotMob ${res.status}: ${url}`);
  const data = await res.json();
  setCache(url, data);
  return data as T;
}

// ──────────────────────────────────────────────
// Get current season tournament ID for a league
// ──────────────────────────────────────────────

async function getLeagueSeasonId(leagueId: number): Promise<number> {
  const data = await fotmobFetch<FotMobLeagueResponse>(
    `${FOTMOB_BASE}/leagues?id=${leagueId}`
  );
  
  // Try each season until we find one with data (for leagues with upcoming seasons)
  for (const season of data.stats.seasonStatLinks.slice(0, 3)) {
    try {
      const testData = await fotmobFetch<FotMobDeepStatsResponse>(
        `${FOTMOB_BASE}/leagueseasondeepstats?id=${leagueId}&season=${season.TournamentId}&type=players&stat=goals`
      );
      if (testData.statsData && testData.statsData.length > 0) {
        return season.TournamentId;
      }
    } catch {
      continue;
    }
  }
  
  // Fallback to first season if none have data
  return data.stats.seasonStatLinks[0].TournamentId;
}

// ──────────────────────────────────────────────
// Deep stats fetcher
// ──────────────────────────────────────────────

async function getDeepStats(
  leagueId: number,
  seasonId: number,
  stat: string
): Promise<FotMobDeepStatPlayer[]> {
  try {
    const data = await fotmobFetch<FotMobDeepStatsResponse>(
      `${FOTMOB_BASE}/leagueseasondeepstats?id=${leagueId}&season=${seasonId}&type=players&stat=${stat}`
    );
    return data.statsData || [];
  } catch (error) {
    console.error(`Error fetching ${stat} for league ${leagueId}:`, error);
    return [];
  }
}

// ──────────────────────────────────────────────
// PUBLIC API
// ──────────────────────────────────────────────

export async function getTopScorers(leagueId: number): Promise<TopScorer[]> {
  const seasonId = await getLeagueSeasonId(leagueId);
  const [goalData, assistData] = await Promise.all([
    getDeepStats(leagueId, seasonId, "goals"),
    getDeepStats(leagueId, seasonId, "goal_assist"),
  ]);

  // Build assists lookup
  const assistMap = new Map(assistData.map((p) => [p.id, p.statValue.value]));

  return goalData.slice(0, 25).map((p, idx) => ({
    rank: idx + 1,
    player: {
      id: p.id,
      name: p.name,
      firstname: p.name.split(" ")[0] || "",
      lastname: p.name.split(" ").slice(1).join(" ") || "",
      age: 0,
      nationality: "",
      photo: playerPhotoUrl(p.id),
    },
    team: {
      id: p.teamId,
      name: "", // Will be enriched from standings
      logo: teamLogoUrl(p.teamId),
    },
    goals: p.statValue.value,
    assists: assistMap.get(p.id) || 0,
    penalties: p.substatValue?.value || 0,
    penaltyMissed: 0,
    appearances: 0,
    minutes: 0,
    rating: null,
    yellowCards: 0,
    redCards: 0,
  }));
}

export async function getTopAssists(leagueId: number): Promise<TopScorer[]> {
  const seasonId = await getLeagueSeasonId(leagueId);
  const [assistData, goalData] = await Promise.all([
    getDeepStats(leagueId, seasonId, "goal_assist"),
    getDeepStats(leagueId, seasonId, "goals"),
  ]);

  const goalMap = new Map(goalData.map((p) => [p.id, p.statValue.value]));

  return assistData.slice(0, 25).map((p, idx) => ({
    rank: idx + 1,
    player: {
      id: p.id,
      name: p.name,
      firstname: p.name.split(" ")[0] || "",
      lastname: p.name.split(" ").slice(1).join(" ") || "",
      age: 0,
      nationality: "",
      photo: playerPhotoUrl(p.id),
    },
    team: {
      id: p.teamId,
      name: "",
      logo: teamLogoUrl(p.teamId),
    },
    goals: goalMap.get(p.id) || 0,
    assists: p.statValue.value,
    penalties: 0,
    penaltyMissed: 0,
    appearances: 0,
    minutes: 0,
    rating: null,
    yellowCards: 0,
    redCards: 0,
  }));
}

export async function getStandings(leagueId: number): Promise<Standing[]> {
  const data = await fotmobFetch<FotMobLeagueResponse>(
    `${FOTMOB_BASE}/leagues?id=${leagueId}`
  );

  if (!data.table?.[0]?.data?.table?.all) return [];
  const standings = data.table[0].data.table.all;

  return standings.map((team) => {
    const scores = team.scoresStr.split("-").map(Number);
    return {
      rank: team.idx,
      team: {
        id: team.id,
        name: team.name,
        logo: teamLogoUrl(team.id),
      },
      points: team.pts,
      played: team.played,
      win: team.wins,
      draw: team.draws,
      lose: team.losses,
      goalsFor: scores[0] || 0,
      goalsAgainst: scores[1] || 0,
      goalsDiff: team.goalConDiff,
      form: "", // FotMob form is on a different sub-object
    };
  });
}

// Enrich scorers/assists with team names from standings
export async function enrichWithTeamNames(
  players: TopScorer[],
  leagueId: number
): Promise<TopScorer[]> {
  const standings = await getStandings(leagueId);
  const teamNameMap = new Map(standings.map((s) => [s.team.id, s.team.name]));

  return players.map((p) => ({
    ...p,
    team: {
      ...p.team,
      name: teamNameMap.get(p.team.id) || `Team ${p.team.id}`,
    },
  }));
}

// ──────────────────────────────────────────────
// Upcoming fixtures
// ──────────────────────────────────────────────

interface FotMobMatch {
  id: string;
  round: string;
  roundName: number;
  home: { id: string; name: string; shortName: string };
  away: { id: string; name: string; shortName: string };
  status: {
    utcTime: string;
    started: boolean;
    cancelled: boolean;
    finished: boolean;
    scoreStr?: string;
    reason?: { short: string };
  };
}

export async function getUpcomingFixtures(
  leagueId: number,
  limit = 30
): Promise<Fixture[]> {
  const data = await fotmobFetch<FotMobLeagueResponse & { fixtures: { allMatches: FotMobMatch[] } }>(
    `${FOTMOB_BASE}/leagues?id=${leagueId}`
  );

  if (!data.fixtures?.allMatches) return [];

  const now = new Date();
  const upcoming = data.fixtures.allMatches
    .filter((m) => {
      if (m.status.cancelled) return false;
      // Include not-started and currently live matches
      if (!m.status.finished) return true;
      return false;
    })
    .sort((a, b) => new Date(a.status.utcTime).getTime() - new Date(b.status.utcTime).getTime())
    .slice(0, limit);

  return upcoming.map((m) => ({
    id: m.id,
    round: m.round,
    homeTeam: {
      id: parseInt(m.home.id),
      name: m.home.name,
      shortName: m.home.shortName,
    },
    awayTeam: {
      id: parseInt(m.away.id),
      name: m.away.name,
      shortName: m.away.shortName,
    },
    utcTime: m.status.utcTime,
    status: m.status.started && !m.status.finished
      ? "live"
      : m.status.finished
      ? "finished"
      : "upcoming",
    score: m.status.scoreStr,
  }));
}
