"use client";

import { Standing } from "@/lib/types";
import Image from "next/image";

interface StandingsTableProps {
  standings: Standing[];
}

function FormDot({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: "bg-emerald-500",
    D: "bg-amber-500",
    L: "bg-red-500",
  };
  return (
    <span
      className={`w-2 h-2 rounded-full ${colors[result] || "bg-gray-300"}`}
      title={result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"}
    />
  );
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No standings available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
            <th className="text-left py-3 px-2 w-8">#</th>
            <th className="text-left py-3 px-2">Team</th>
            <th className="text-center py-3 px-2">P</th>
            <th className="text-center py-3 px-2">W</th>
            <th className="text-center py-3 px-2">D</th>
            <th className="text-center py-3 px-2">L</th>
            <th className="text-center py-3 px-2 hidden sm:table-cell">GF</th>
            <th className="text-center py-3 px-2 hidden sm:table-cell">GA</th>
            <th className="text-center py-3 px-2">GD</th>
            <th className="text-center py-3 px-2 font-bold">Pts</th>
            <th className="text-center py-3 px-2 hidden md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => {
            const isChampionsLeague = idx < 4;
            const isEuropaLeague = idx === 4 || idx === 5;
            const isRelegation = idx >= standings.length - 3;

            let borderColor = "border-transparent";
            if (isChampionsLeague) borderColor = "border-blue-500";
            else if (isEuropaLeague) borderColor = "border-orange-500";
            else if (isRelegation) borderColor = "border-red-500";

            return (
              <tr
                key={team.team.id}
                className="border-b border-gray-50 dark:border-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-0.5 h-5 rounded-full border-l-2 ${borderColor}`}
                    />
                    <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                      {team.rank}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image
                        src={team.team.logo}
                        alt={team.team.name}
                        fill
                        className="object-contain"
                        sizes="20px"
                      />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                      {team.team.name}
                    </span>
                  </div>
                </td>
                <td className="text-center py-2.5 px-2 text-gray-500 dark:text-gray-400 tabular-nums">
                  {team.played}
                </td>
                <td className="text-center py-2.5 px-2 text-gray-700 dark:text-gray-300 tabular-nums">
                  {team.win}
                </td>
                <td className="text-center py-2.5 px-2 text-gray-500 dark:text-gray-400 tabular-nums">
                  {team.draw}
                </td>
                <td className="text-center py-2.5 px-2 text-gray-500 dark:text-gray-400 tabular-nums">
                  {team.lose}
                </td>
                <td className="text-center py-2.5 px-2 text-gray-500 dark:text-gray-400 tabular-nums hidden sm:table-cell">
                  {team.goalsFor}
                </td>
                <td className="text-center py-2.5 px-2 text-gray-500 dark:text-gray-400 tabular-nums hidden sm:table-cell">
                  {team.goalsAgainst}
                </td>
                <td className="text-center py-2.5 px-2 tabular-nums">
                  <span
                    className={
                      team.goalsDiff > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : team.goalsDiff < 0
                        ? "text-red-500 dark:text-red-400"
                        : "text-gray-500"
                    }
                  >
                    {team.goalsDiff > 0 ? "+" : ""}
                    {team.goalsDiff}
                  </span>
                </td>
                <td className="text-center py-2.5 px-2 font-bold text-gray-900 dark:text-white tabular-nums">
                  {team.points}
                </td>
                <td className="text-center py-2.5 px-2 hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    {team.form
                      .split("")
                      .slice(-5)
                      .map((r, i) => (
                        <FormDot key={i} result={r} />
                      ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-400 dark:text-gray-500 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-0.5 h-3 rounded-full bg-blue-500" />
          Champions League
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0.5 h-3 rounded-full bg-orange-500" />
          Europa League
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0.5 h-3 rounded-full bg-red-500" />
          Relegation
        </div>
      </div>
    </div>
  );
}
