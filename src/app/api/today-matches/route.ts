import { NextResponse } from "next/server";
import { getTodaysMatches } from "@/lib/fotmob";
import { LEAGUES } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const leagueIds = LEAGUES.map((l) => l.id);
    const leagueMeta: Record<number, { name: string; country: string }> = {};
    for (const l of LEAGUES) {
      leagueMeta[l.id] = { name: l.name, country: l.country };
    }

    const todaysMatches = await getTodaysMatches(leagueIds, leagueMeta);

    return NextResponse.json(todaysMatches, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("Error fetching today's matches:", error);
    return NextResponse.json([], { status: 500 });
  }
}
