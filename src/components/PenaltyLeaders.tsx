"use client";

import { TopScorer } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Target, HandHelping, AlertTriangle } from "lucide-react";

interface PenaltyLeadersProps {
  players: TopScorer[];
}

export function PenaltyLeaders({ players }: PenaltyLeadersProps) {
  // Sort by penalties scored, filter out players with 0 penalties
  const penaltyPlayers = players
    .filter((p) => p.penalties > 0)
    .sort((a, b) => b.penalties - a.penalties)
    .slice(0, 15);

  if (penaltyPlayers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No penalty data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {penaltyPlayers.map((p, idx) => (
        <div
          key={p.player.id}
          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-all duration-200"
        >
          {/* Rank */}
          <span className="w-8 text-center text-sm font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
            {idx + 1}
          </span>

          {/* Player Photo */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-white/10">
            <Image
              src={p.player.photo}
              alt={p.player.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/player/${p.player.id}`} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {p.player.name}
              </h4>
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="relative w-4 h-4 rounded-sm overflow-hidden flex-shrink-0">
                <Image
                  src={p.team.logo}
                  alt={p.team.name}
                  fill
                  className="object-contain"
                  sizes="16px"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {p.team.name}
              </span>
            </div>
          </div>

          {/* Penalty Stats */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
              <span className="text-lg font-black tabular-nums">{p.penalties}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 hidden sm:inline">
                Scored
              </span>
            </div>

            {p.penaltyMissed > 0 && (
              <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-sm font-bold tabular-nums">
                  {p.penaltyMissed}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 hidden sm:inline">
                  Missed
                </span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <HandHelping className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold tabular-nums">{p.goals}</span>
              <span className="text-[10px] uppercase tracking-wider">
                Total Goals
              </span>
            </div>

            {/* Conversion rate */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                {Math.round(
                  (p.penalties / (p.penalties + p.penaltyMissed)) * 100
                )}
                %
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Conv.
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
