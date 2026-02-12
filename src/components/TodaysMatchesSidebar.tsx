"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { Tv, ChevronRight, ChevronLeft, Loader2, Calendar, Zap } from "lucide-react";
import { getBroadcastForLeague, BroadcastInfo } from "@/lib/broadcasts";
import { leagueLogoUrl } from "@/lib/types";

interface TodaysMatch {
  matchId: string;
  leagueId: number;
  leagueName: string;
  homeTeam: { id: number; name: string; shortName: string };
  awayTeam: { id: number; name: string; shortName: string };
  utcTime: string;
  status: "upcoming" | "live" | "finished";
  score?: string;
  round: string;
}

interface TodaysMatchesByLeague {
  leagueId: number;
  leagueName: string;
  leagueCountry: string;
  matches: TodaysMatch[];
}

function teamLogoUrl(teamId: number): string {
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
}

function formatTime(utcTime: string): string {
  return format(parseISO(utcTime), "HH:mm");
}

function BroadcastTooltip({ broadcast }: { broadcast: BroadcastInfo }) {
  const hasAny =
    broadcast.poland.length > 0 || broadcast.uk.length > 0 || broadcast.usa.length > 0;

  if (!hasAny) {
    return (
      <div className="text-xs text-gray-400 dark:text-gray-500 italic py-1">
        No broadcast info available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {broadcast.poland.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
            <span>🇵🇱</span> Poland
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300">
            {broadcast.poland.join(" · ")}
          </div>
        </div>
      )}
      {broadcast.uk.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
            <span>🇬🇧</span> United Kingdom
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300">
            {broadcast.uk.join(" · ")}
          </div>
        </div>
      )}
      {broadcast.usa.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
            <span>🇺🇸</span> USA
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300">
            {broadcast.usa.join(" · ")}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: TodaysMatch }) {
  const [showBroadcast, setShowBroadcast] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const broadcast = getBroadcastForLeague(match.leagueId);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowBroadcast(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowBroadcast(false), 200);
  };

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors cursor-default
          ${isLive ? "bg-emerald-500/10 dark:bg-emerald-500/10" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}
      >
        {/* Time / Status */}
        <div className="w-11 text-center shrink-0">
          {isLive ? (
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-500">
              <Zap className="w-3 h-3" />
              LIVE
            </span>
          ) : isFinished ? (
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">FT</span>
          ) : (
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {formatTime(match.utcTime)}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Image
              src={teamLogoUrl(match.homeTeam.id)}
              alt=""
              width={14}
              height={14}
              className="object-contain"
              unoptimized
            />
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
              {match.homeTeam.shortName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Image
              src={teamLogoUrl(match.awayTeam.id)}
              alt=""
              width={14}
              height={14}
              className="object-contain"
              unoptimized
            />
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
              {match.awayTeam.shortName}
            </span>
          </div>
        </div>

        {/* Score (if finished/live) */}
        {match.score && (
          <div className="shrink-0 text-right">
            {match.score.split(" - ").map((s, i) => (
              <div
                key={i}
                className={`text-xs font-bold ${
                  isLive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {s.trim()}
              </div>
            ))}
          </div>
        )}

        {/* TV icon */}
        <Tv className="w-3 h-3 shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
      </div>

      {/* Broadcast Popover */}
      {showBroadcast && (
        <div
          className="absolute right-full top-0 mr-2 z-50 w-56 p-3 rounded-xl
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            shadow-xl shadow-black/10 dark:shadow-black/30
            animate-in fade-in slide-in-from-right-2 duration-150"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
            <Tv className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Broadcast
            </span>
          </div>
          <BroadcastTooltip broadcast={broadcast} />
        </div>
      )}
    </div>
  );
}

export function TodaysMatchesSidebar() {
  const [data, setData] = useState<TodaysMatchesByLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    fetch("/api/today-matches")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const totalMatches = data.reduce((acc, league) => acc + league.matches.length, 0);

  // Collapsed state - just a floating button
  if (collapsed) {
    return (
      <button
        onClick={toggleCollapsed}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40
          bg-white dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700
          rounded-l-xl p-3 shadow-lg shadow-black/10 dark:shadow-black/30
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
        title="Show today's matches"
      >
        <div className="flex flex-col items-center gap-1">
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 transition-colors" />
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {totalMatches > 0 && (
            <span className="text-[10px] font-bold text-emerald-500">{totalMatches}</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-16 bottom-0 z-30 w-64
      bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
      border-l border-gray-200 dark:border-white/10
      flex flex-col shadow-2xl shadow-black/5 dark:shadow-black/20
      transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Today&apos;s Matches
          </h2>
          {totalMatches > 0 && (
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              {totalMatches}
            </span>
          )}
        </div>
        <button
          onClick={toggleCollapsed}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title="Collapse sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">Failed to load matches</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-xs text-gray-400 dark:text-gray-500">No matches today</p>
            <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
              Check back tomorrow
            </p>
          </div>
        ) : (
          <div className="py-2">
            {data.map((league) => (
              <div key={league.leagueId} className="mb-3">
                {/* League Header */}
                <div className="flex items-center gap-2 px-3 py-1.5 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10">
                  <Image
                    src={leagueLogoUrl(league.leagueId)}
                    alt=""
                    width={14}
                    height={14}
                    className="object-contain"
                    unoptimized
                  />
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
                    {league.leagueName}
                  </span>
                </div>

                {/* Matches */}
                <div className="px-1">
                  {league.matches
                    .sort((a, b) => a.utcTime.localeCompare(b.utcTime))
                    .map((match) => (
                      <MatchRow key={match.matchId} match={match} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-white/5">
        <p className="text-[10px] text-gray-400 dark:text-gray-600 flex items-center gap-1">
          <Tv className="w-3 h-3" /> Hover a match for broadcast info
        </p>
      </div>
    </div>
  );
}
