"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Target,
  HandHelping,
  Clock,
  Star,
  Trophy,
  Shirt,
  MapPin,
  Ruler,
  Calendar,
  Loader2,
} from "lucide-react";
import type { PlayerProfile, PlayerMatchEntry } from "@/lib/fotmob";

function teamLogoUrl(teamId: number) {
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
}

function MatchCard({ match }: { match: PlayerMatchEntry }) {
  const matchDate = new Date(match.date);
  const isGoalInvolved = match.goals > 0;
  const isAssistInvolved = match.assists > 0;

  return (
    <div className="group flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-all duration-200">
      {/* Date */}
      <div className="hidden sm:flex flex-col items-center w-14 flex-shrink-0 text-center">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
          {format(matchDate, "MMM")}
        </span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {format(matchDate, "dd")}
        </span>
      </div>

      {/* Competition badge */}
      <div className="hidden md:block w-28 flex-shrink-0">
        <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400 dark:text-gray-500 truncate block">
          {match.leagueName}
        </span>
        {match.stage && (
          <span className="text-[9px] text-gray-400 dark:text-gray-600">
            {match.stage}
          </span>
        )}
      </div>

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 sm:hidden">
            {format(matchDate, "dd MMM")}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 md:hidden sm:block hidden">
            {match.leagueName}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Opponent */}
          <Link href={`/team/${match.opponentId}`} className="flex items-center gap-1.5 group/opp hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            <div className="relative w-5 h-5 rounded-sm overflow-hidden flex-shrink-0">
              <Image
                src={teamLogoUrl(match.opponentId)}
                alt={match.opponentName}
                fill
                className="object-contain"
                sizes="20px"
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover/opp:text-blue-500 dark:group-hover/opp:text-blue-400 truncate">
              {match.isHome ? "" : "@ "}{match.opponentName}
            </span>
          </Link>
        </div>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-center">
        <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
          (match.isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore)
            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            : (match.homeScore === match.awayScore)
            ? "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
            : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
        }`}>
          {match.isHome ? `${match.homeScore}-${match.awayScore}` : `${match.awayScore}-${match.homeScore}`}
        </div>
      </div>

      {/* Goals & Assists */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isGoalInvolved && (
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {match.goals}
            </span>
          </div>
        )}
        {isAssistInvolved && (
          <div className="flex items-center gap-1">
            <HandHelping className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {match.assists}
            </span>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
        {match.rating && (
          <div
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
              match.isTopRating
                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                : parseFloat(match.rating) >= 7.5
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
            }`}
          >
            <Star className="w-3 h-3" />
            {parseFloat(match.rating).toFixed(1)}
          </div>
        )}
        {match.playerOfTheMatch && (
          <Trophy className="w-4 h-4 text-amber-500" />
        )}
      </div>
    </div>
  );
}

export default function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "goals" | "assists">("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/player-stats?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setPlayer(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Failed to load player data</p>
          <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const filteredMatches = player.matches.filter((m) => {
    if (filter === "goals") return m.goals > 0;
    if (filter === "assists") return m.assists > 0;
    return true;
  });

  const totalGoals = player.matches.reduce((sum, m) => sum + m.goals, 0);
  const totalAssists = player.matches.reduce((sum, m) => sum + m.assists, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Player Header */}
        <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Photo */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-white/10 flex-shrink-0">
              <Image
                src={player.photo}
                alt={player.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {player.name}
              </h1>
              <Link
                href={`/team/${player.teamId}`}
                className="inline-flex items-center gap-2 mt-2 group/team"
              >
                <div className="relative w-6 h-6 rounded-sm overflow-hidden">
                  <Image
                    src={player.teamLogo}
                    alt={player.teamName}
                    fill
                    className="object-contain"
                    sizes="24px"
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover/team:text-blue-500 dark:group-hover/team:text-blue-400 transition-colors">
                  {player.teamName}
                </span>
              </Link>

              {/* Player details */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                {player.position !== "Unknown" && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {player.position}
                  </span>
                )}
                {player.country && (
                  <span className="flex items-center gap-1">
                    🌍 {player.country}
                  </span>
                )}
                {player.age > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {player.age} yrs
                  </span>
                )}
                {player.height && (
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5" />
                    {player.height}
                  </span>
                )}
                {player.shirtNumber && (
                  <span className="flex items-center gap-1">
                    <Shirt className="w-3.5 h-3.5" />
                    #{player.shirtNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Season stats */}
            <div className="flex gap-4 sm:gap-6 flex-shrink-0">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                  {player.seasonGoals}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Goals
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                  {player.seasonAssists}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Assists
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                  {player.seasonAppearances}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Apps
                </div>
              </div>
              {player.seasonRating && (
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {parseFloat(player.seasonRating).toFixed(1)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                    Rating
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Log Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Goal Involvements
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalGoals} goals & {totalAssists} assists across {player.matches.length} matches
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
            {(["all", "goals", "assists"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === f
                    ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {f === "all" ? `All (${player.matches.length})` : f === "goals" ? `Goals (${player.matches.filter((m) => m.goals > 0).length})` : `Assists (${player.matches.filter((m) => m.assists > 0).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Match list */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No matches found</p>
            <p className="text-sm mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMatches.map((match) => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
