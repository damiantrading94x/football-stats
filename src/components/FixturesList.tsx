"use client";

import Image from "next/image";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

export interface Fixture {
  id: string;
  round: string;
  homeTeam: { id: number; name: string; shortName: string };
  awayTeam: { id: number; name: string; shortName: string };
  utcTime: string;
  status: "upcoming" | "live" | "finished";
  score?: string;
}

interface FixturesListProps {
  fixtures: Fixture[];
}

function teamLogoUrl(teamId: number): string {
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
}

function formatMatchDate(utcTime: string): string {
  const date = parseISO(utcTime);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, d MMM");
}

function formatMatchTime(utcTime: string): string {
  const date = parseISO(utcTime);
  return format(date, "HH:mm");
}

export function FixturesList({ fixtures }: FixturesListProps) {
  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No upcoming fixtures</p>
        <p className="text-sm mt-1">Check back when the schedule is released</p>
      </div>
    );
  }

  // Group fixtures by date
  const grouped = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const dateKey = formatMatchDate(f.utcTime);
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(f);
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([dateLabel, matches]) => (
        <div key={dateLabel}>
          {/* Date header */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                dateLabel === "Today"
                  ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : dateLabel === "Tomorrow"
                  ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
              }`}
            >
              {dateLabel}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {matches.length} {matches.length === 1 ? "match" : "matches"}
            </span>
          </div>

          {/* Match cards */}
          <div className="space-y-2">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
              >
                {/* Round */}
                <div className="hidden sm:block w-12 text-center flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
                    Rd {match.round}
                  </span>
                </div>

                {/* Home team */}
                <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate text-right">
                    {match.homeTeam.shortName}
                  </span>
                  <div className="relative w-7 h-7 flex-shrink-0">
                    <Image
                      src={teamLogoUrl(match.homeTeam.id)}
                      alt={match.homeTeam.name}
                      fill
                      className="object-contain"
                      sizes="28px"
                    />
                  </div>
                </div>

                {/* Time / Score */}
                <div className="w-16 sm:w-20 text-center flex-shrink-0">
                  {match.status === "finished" && match.score ? (
                    <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                      {match.score}
                    </span>
                  ) : match.status === "live" ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-bold text-red-500 tabular-nums">
                        {match.score || "LIVE"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatMatchTime(match.utcTime)}
                    </span>
                  )}
                </div>

                {/* Away team */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="relative w-7 h-7 flex-shrink-0">
                    <Image
                      src={teamLogoUrl(match.awayTeam.id)}
                      alt={match.awayTeam.name}
                      fill
                      className="object-contain"
                      sizes="28px"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {match.awayTeam.shortName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
