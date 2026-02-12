import { NextRequest, NextResponse } from "next/server";
import {
  getTopScorers,
  getTopAssists,
  getStandings,
  enrichWithTeamNames,
  enrichWithPenaltyData,
  getUpcomingFixtures,
} from "@/lib/fotmob";
import { LEAGUES } from "@/lib/types";

export const revalidate = 600; // 10 minutes ISR

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leagueId = searchParams.get("league");

  if (!leagueId) {
    return NextResponse.json({ error: "League ID required" }, { status: 400 });
  }

  const id = parseInt(leagueId);
  const league = LEAGUES.find((l) => l.id === id);

  if (!league) {
    return NextResponse.json({ error: "Invalid league ID" }, { status: 400 });
  }

  try {
    // Fetch standings first (needed for team name enrichment)
    const standings = await getStandings(id);

    // Fetch scorers, assists and fixtures in parallel
    const [rawScorers, rawAssists, fixtures] = await Promise.all([
      getTopScorers(id),
      getTopAssists(id),
      getUpcomingFixtures(id),
    ]);

    // Enrich with team names from standings
    const [scorersWithNames, topAssists] = await Promise.all([
      enrichWithTeamNames(rawScorers, id),
      enrichWithTeamNames(rawAssists, id),
    ]);

    // Enrich with actual penalty data from player shotmaps
    const topScorers = await enrichWithPenaltyData(scorersWithNames, id);

    return NextResponse.json(
      {
        league: {
          id: league.id,
          name: league.name,
          country: league.country,
          flag: league.flag,
        },
        topScorers,
        topAssists,
        standings,
        fixtures,
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching league stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
