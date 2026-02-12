import { NextRequest, NextResponse } from "next/server";
import { getTeamStats } from "@/lib/fotmob";

export const revalidate = 600;

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("team");

  if (!teamId) {
    return NextResponse.json({ error: "Team ID required" }, { status: 400 });
  }

  try {
    const data = await getTeamStats(parseInt(teamId));

    return NextResponse.json(
      { ...data, lastUpdated: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}
