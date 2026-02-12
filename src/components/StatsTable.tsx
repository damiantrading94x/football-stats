"use client";

import { TopScorer } from "@/lib/types";
import Image from "next/image";
import { Target, HandHelping, AlertTriangle, Clock, Star } from "lucide-react";

interface StatsTableProps {
  players: TopScorer[];
  type: "scorers" | "assists";
}

function StatBadge({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-1 text-xs ${color}`} title={label}>
      <Icon className="w-3.5 h-3.5" />
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export function StatsTable({ players, type }: StatsTableProps) {
  if (!players || players.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No data available</p>
        <p className="text-sm mt-1">Stats will appear once matches are played</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.slice(0, 20).map((p, idx) => {
        const isTop3 = idx < 3;
        const medalColors = [
          "from-amber-500/20 to-yellow-500/10 border-amber-300 dark:border-amber-500/30",
          "from-gray-300/20 to-slate-200/10 border-gray-300 dark:border-gray-500/30",
          "from-orange-500/15 to-amber-500/5 border-orange-300 dark:border-orange-500/30",
        ];
        const medalEmojis = ["🥇", "🥈", "🥉"];

        return (
          <div
            key={p.player.id}
            className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
              isTop3
                ? `bg-gradient-to-r ${medalColors[idx]} shadow-sm`
                : "bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.06]"
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center flex-shrink-0">
              {isTop3 ? (
                <span className="text-lg">{medalEmojis[idx]}</span>
              ) : (
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500">
                  {idx + 1}
                </span>
              )}
            </div>

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
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {p.player.name}
                </h4>
                {p.rating && (
                  <div className="hidden sm:flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <Star className="w-2.5 h-2.5" />
                    {parseFloat(p.rating).toFixed(1)}
                  </div>
                )}
              </div>
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

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
              {/* Main stat */}
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                  {type === "scorers" ? p.goals : p.assists}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
                  {type === "scorers" ? "Goals" : "Assists"}
                </div>
              </div>

              {/* Secondary stats - hidden on mobile */}
              <div className="hidden md:flex items-center gap-4">
                {type === "scorers" && (
                  <>
                    <StatBadge
                      icon={HandHelping}
                      value={p.assists}
                      label="Assists"
                      color="text-blue-500 dark:text-blue-400"
                    />
                    <StatBadge
                      icon={Target}
                      value={p.penalties}
                      label="Penalties"
                      color="text-emerald-500 dark:text-emerald-400"
                    />
                    {p.penaltyMissed > 0 && (
                      <StatBadge
                        icon={AlertTriangle}
                        value={p.penaltyMissed}
                        label="Penalties Missed"
                        color="text-red-500 dark:text-red-400"
                      />
                    )}
                  </>
                )}
                {type === "assists" && (
                  <StatBadge
                    icon={Target}
                    value={p.goals}
                    label="Goals"
                    color="text-emerald-500 dark:text-emerald-400"
                  />
                )}
                <StatBadge
                  icon={Clock}
                  value={p.appearances}
                  label="Appearances"
                  color="text-gray-400 dark:text-gray-500"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
