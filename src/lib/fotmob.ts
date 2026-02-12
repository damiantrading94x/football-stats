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
  const [goalData, assistData, minsData] = await Promise.all([
    getDeepStats(leagueId, seasonId, "goals"),
    getDeepStats(leagueId, seasonId, "goal_assist"),
    getDeepStats(leagueId, seasonId, "mins_played"),
  ]);

  // Build lookups
  const assistMap = new Map(assistData.map((p) => [p.id, p.statValue.value]));
  const minsMap = new Map(
    minsData.map((p) => [p.id, { minutes: p.statValue.value, appearances: p.substatValue?.value || 0 }])
  );

  return goalData.slice(0, 25).map((p, idx) => {
    const mins = minsMap.get(p.id);
    return {
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
      appearances: mins?.appearances || 0,
      minutes: mins?.minutes || 0,
      rating: null,
      yellowCards: 0,
      redCards: 0,
    };
  });
}

export async function getTopAssists(leagueId: number): Promise<TopScorer[]> {
  const seasonId = await getLeagueSeasonId(leagueId);
  const [assistData, goalData, minsData] = await Promise.all([
    getDeepStats(leagueId, seasonId, "goal_assist"),
    getDeepStats(leagueId, seasonId, "goals"),
    getDeepStats(leagueId, seasonId, "mins_played"),
  ]);

  const goalMap = new Map(goalData.map((p) => [p.id, p.statValue.value]));
  const minsMap = new Map(
    minsData.map((p) => [p.id, { minutes: p.statValue.value, appearances: p.substatValue?.value || 0 }])
  );

  return assistData.slice(0, 25).map((p, idx) => {
    const mins = minsMap.get(p.id);
    return {
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
      appearances: mins?.appearances || 0,
      minutes: mins?.minutes || 0,
      rating: null,
      yellowCards: 0,
      redCards: 0,
    };
  });
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
// Penalty data from player shotmaps
// ──────────────────────────────────────────────

interface FotMobShot {
  eventType: string;
  situation: string;
}

interface FotMobPlayerDataResponse {
  firstSeasonStats?: {
    shotmap?: FotMobShot[];
  };
  statSeasons?: Array<{
    tournaments: Array<{ tournamentId: number; entryId: string }>;
  }>;
}

export async function enrichWithPenaltyData(
  players: TopScorer[],
  leagueId: number
): Promise<TopScorer[]> {
  // Only fetch shotmap for players who have scored penalties
  const penaltyPlayers = players.filter((p) => p.penalties > 0);
  if (penaltyPlayers.length === 0) return players;

  // Find the correct season entry for this league from the first player
  const penaltyData = await Promise.all(
    penaltyPlayers.map(async (p) => {
      try {
        // First get the player data to find the right season entry for this league
        const playerData = await fotmobFetch<FotMobPlayerDataResponse>(
          `${FOTMOB_BASE}/playerData?id=${p.player.id}`
        );

        // Find the tournament entry matching this league
        let seasonEntry = "0-0"; // default to current season, first tournament
        if (playerData.statSeasons?.[0]?.tournaments) {
          const tournIdx = playerData.statSeasons[0].tournaments.findIndex(
            (t) => t.tournamentId === leagueId
          );
          if (tournIdx >= 0) {
            seasonEntry = playerData.statSeasons[0].tournaments[tournIdx].entryId;
          }
        }

        // Fetch with the correct season entry
        const data = await fotmobFetch<FotMobPlayerDataResponse>(
          `${FOTMOB_BASE}/playerData?id=${p.player.id}&season=${seasonEntry}`
        );

        const shots = data.firstSeasonStats?.shotmap || [];
        const pens = shots.filter((s) => s.situation === "Penalty");
        const scored = pens.filter((s) => s.eventType === "Goal").length;
        const missed = pens.length - scored;

        return { playerId: p.player.id, scored, missed };
      } catch {
        return { playerId: p.player.id, scored: p.penalties, missed: 0 };
      }
    })
  );

  const penaltyMap = new Map(penaltyData.map((pd) => [pd.playerId, pd]));

  return players.map((p) => {
    const pd = penaltyMap.get(p.player.id);
    if (pd) {
      return { ...p, penalties: pd.scored, penaltyMissed: pd.missed };
    }
    return p;
  });
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

// ──────────────────────────────────────────────
// Team stats
// ──────────────────────────────────────────────

interface FotMobTeamStatPlayer {
  ParticipantName: string;
  ParticiantId: number;
  TeamId: number;
  TeamName: string;
  StatValue: number;
  SubStatValue: number;
  MinutesPlayed: number;
  MatchesPlayed: number;
  Rank: number;
  ParticipantCountryCode: string;
  Positions: number[];
}

interface FotMobTeamStatsJson {
  TopLists: Array<{
    StatName: string;
    Title: string;
    Subtitle: string;
    StatList: FotMobTeamStatPlayer[];
  }>;
}

export interface TeamOverview {
  id: number;
  name: string;
  logo: string;
  country: string;
  leagueId: number;
  leagueName: string;
  seasonId: number;
}

export interface TeamPlayerStat {
  id: number;
  name: string;
  photo: string;
  value: number;
  subValue: number;
  appearances: number;
  minutes: number;
  rank: number;
  country: string;
}

export async function getTeamStats(teamId: number): Promise<{
  overview: TeamOverview;
  scorers: TeamPlayerStat[];
  assisters: TeamPlayerStat[];
  form: Array<{ result: string; opponent: string; score: string; date: string }>;
  nextMatch: { home: string; away: string; date: string; tournament: string } | null;
}> {
  // Fetch team overview from FotMob
  interface FotMobTeamResponse {
    details: { id: number; name: string; country: string; shortName: string };
    stats: {
      primaryLeagueId: number;
      primarySeasonId: number;
      players: Array<{
        fetchAllUrl: string;
        localizedTitleId: string;
        header: string;
        topThree: Array<{ id: number; name: string; value: number }>;
      }>;
    };
    overview: {
      season: string;
      teamForm: Array<{
        result: number;
        resultString: string;
        score: string;
        tooltipText: {
          utcTime: string;
          homeTeam: string;
          awayTeam: string;
          homeScore: number;
          awayScore: number;
        };
      }>;
      nextMatch?: {
        home: { name: string };
        away: { name: string };
        status: { utcTime: string };
        tournament: { name: string };
      };
    };
  }

  const data = await fotmobFetch<FotMobTeamResponse>(
    `${FOTMOB_BASE}/teams?id=${teamId}`
  );

  const overview: TeamOverview = {
    id: data.details.id,
    name: data.details.name,
    logo: teamLogoUrl(data.details.id),
    country: data.details.country,
    leagueId: data.stats.primaryLeagueId,
    leagueName: "",
    seasonId: data.stats.primarySeasonId,
  };

  // Find the goals and assists fetchAllUrl
  const goalsStat = data.stats.players?.find(
    (s) => s.localizedTitleId === "goals_title"
  );
  const assistsStat = data.stats.players?.find(
    (s) => s.localizedTitleId === "goal_assist_title"
  );

  // Fetch full stats JSON in parallel
  const [scorersData, assistsData] = await Promise.all([
    goalsStat?.fetchAllUrl
      ? fotmobFetch<FotMobTeamStatsJson>(goalsStat.fetchAllUrl)
      : Promise.resolve(null),
    assistsStat?.fetchAllUrl
      ? fotmobFetch<FotMobTeamStatsJson>(assistsStat.fetchAllUrl)
      : Promise.resolve(null),
  ]);

  // Filter to this team's players
  const teamScorers = (scorersData?.TopLists?.[0]?.StatList || [])
    .filter((p) => p.TeamId === teamId)
    .map((p) => ({
      id: p.ParticiantId,
      name: p.ParticipantName,
      photo: playerPhotoUrl(p.ParticiantId),
      value: p.StatValue,
      subValue: p.SubStatValue,
      appearances: p.MatchesPlayed,
      minutes: p.MinutesPlayed,
      rank: p.Rank,
      country: p.ParticipantCountryCode,
    }));

  const teamAssisters = (assistsData?.TopLists?.[0]?.StatList || [])
    .filter((p) => p.TeamId === teamId)
    .map((p) => ({
      id: p.ParticiantId,
      name: p.ParticipantName,
      photo: playerPhotoUrl(p.ParticiantId),
      value: p.StatValue,
      subValue: p.SubStatValue,
      appearances: p.MatchesPlayed,
      minutes: p.MinutesPlayed,
      rank: p.Rank,
      country: p.ParticipantCountryCode,
    }));

  // Form
  const form = (data.overview?.teamForm || []).slice(0, 10).map((f) => ({
    result: f.resultString,
    opponent:
      f.tooltipText.homeTeam === data.details.name
        ? f.tooltipText.awayTeam
        : f.tooltipText.homeTeam,
    score: f.score,
    date: f.tooltipText.utcTime,
  }));

  // Next match
  const nm = data.overview?.nextMatch;
  const nextMatch = nm
    ? {
        home: nm.home.name,
        away: nm.away.name,
        date: nm.status.utcTime,
        tournament: nm.tournament.name,
      }
    : null;

  return { overview, scorers: teamScorers, assisters: teamAssisters, form, nextMatch };
}

// ──────────────────────────────────────────────
// Player match log (goals & assists per game)
// ──────────────────────────────────────────────

export interface PlayerMatchEntry {
  matchId: string;
  date: string;
  leagueId: number;
  leagueName: string;
  stage: string | null;
  teamName: string;
  teamId: number;
  opponentName: string;
  opponentId: number;
  isHome: boolean;
  homeScore: number;
  awayScore: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  rating: string | null;
  isTopRating: boolean;
  playerOfTheMatch: boolean;
  yellowCards: number;
  redCards: number;
  onBench: boolean;
}

export interface PlayerProfile {
  id: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  position: string;
  country: string;
  countryCode: string;
  age: number;
  height: string;
  shirtNumber: number | null;
  seasonGoals: number;
  seasonAssists: number;
  seasonAppearances: number;
  seasonMinutes: number;
  seasonRating: string | null;
  matches: PlayerMatchEntry[];
}

export async function getPlayerMatchLog(playerId: number): Promise<PlayerProfile> {
  interface FotMobPlayerFull {
    id: number;
    name: string;
    primaryTeam: { teamId: number; teamName: string };
    positionDescription?: { primaryPosition?: { label: string } };
    playerInformation?: Array<{
      translationKey: string;
      value: { numberValue?: number; key?: string; fallback?: string | number };
    }>;
    mainLeague?: {
      leagueId: number;
      leagueName: string;
      stats: Array<{ localizedTitleId: string; value: number }>;
    };
    recentMatches: Array<{
      teamId: number;
      teamName: string;
      opponentTeamId: number;
      opponentTeamName: string;
      isHomeTeam: boolean;
      id: number;
      matchDate: { utcTime: string };
      leagueId: number;
      leagueName: string;
      stage: string | null;
      homeScore: number;
      awayScore: number;
      minutesPlayed: number;
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
      ratingProps: { rating: string | number; isTopRating: boolean };
      playerOfTheMatch: boolean;
      onBench: boolean;
    }>;
  }

  const data = await fotmobFetch<FotMobPlayerFull>(
    `${FOTMOB_BASE}/playerData?id=${playerId}`
  );

  // Extract player info
  const info = data.playerInformation || [];
  const getInfo = (key: string) => info.find((i) => i.translationKey === key);
  const ageInfo = getInfo("age_sentencecase");
  const heightInfo = getInfo("height_sentencecase");
  const shirtInfo = getInfo("shirt");
  const countryInfo = getInfo("country_sentencecase");

  // Main league stats
  const mainStats = data.mainLeague?.stats || [];
  const getStat = (id: string) => mainStats.find((s) => s.localizedTitleId === id)?.value || 0;

  const profile: PlayerProfile = {
    id: data.id,
    name: data.name,
    photo: playerPhotoUrl(data.id),
    teamId: data.primaryTeam.teamId,
    teamName: data.primaryTeam.teamName,
    teamLogo: teamLogoUrl(data.primaryTeam.teamId),
    position: data.positionDescription?.primaryPosition?.label || "Unknown",
    country: countryInfo?.value?.fallback?.toString() || "",
    countryCode: (countryInfo as { icon?: { id: string } })?.icon?.id || "",
    age: ageInfo?.value?.numberValue || 0,
    height: heightInfo?.value?.fallback?.toString() || "",
    shirtNumber: shirtInfo?.value?.numberValue || null,
    seasonGoals: getStat("goals"),
    seasonAssists: getStat("assists"),
    seasonAppearances: getStat("matches_uppercase"),
    seasonMinutes: getStat("minutes_played"),
    seasonRating: mainStats.find((s) => s.localizedTitleId === "rating")?.value?.toString() || null,
    matches: data.recentMatches
      .filter((m) => m.goals > 0 || m.assists > 0)
      .map((m) => ({
        matchId: String(m.id),
        date: m.matchDate.utcTime,
        leagueId: m.leagueId,
        leagueName: m.leagueName,
        stage: m.stage,
        teamName: m.teamName,
        teamId: m.teamId,
        opponentName: m.opponentTeamName,
        opponentId: m.opponentTeamId,
        isHome: m.isHomeTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        goals: m.goals,
        assists: m.assists,
        minutesPlayed: m.minutesPlayed,
        rating: typeof m.ratingProps.rating === "number"
          ? m.ratingProps.rating === 0 ? null : String(m.ratingProps.rating)
          : m.ratingProps.rating || null,
        isTopRating: m.ratingProps.isTopRating,
        playerOfTheMatch: m.playerOfTheMatch,
        yellowCards: m.yellowCards,
        redCards: m.redCards,
        onBench: m.onBench,
      })),
  };

  return profile;
}
