import { NextRequest, NextResponse } from "next/server";
import { getPlayerMatchLog } from "@/lib/fotmob";

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("id");
  if (!playerId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 400 });
  }

  try {
    const profile = await getPlayerMatchLog(Number(playerId));
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Player stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch player data" },
      { status: 500 }
    );
  }
}
