"use client";

import { useEffect, useState, use } from "react";
import { TeamOverview, TeamPlayerStat } from "@/lib/fotmob";
import {
  ArrowLeft,
  Trophy,
  HandHelping,
  Clock,
  Timer,
  Zap,
  Target,
  RefreshCw,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";

interface TeamResponse {
  overview: TeamOverview;
  scorers: TeamPlayerStat[];
  assisters: TeamPlayerStat[];
  form: Array<{
    result: string;
    opponent: string;
    score: string;
    date: string;
  }>;
  nextMatch: {
    home: string;
    away: string;
    date: string;
    tournament: string;
  } | null;
  lastUpdated: string;
}

type TabType = "scorers" | "assists" | "form";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "scorers", label: "Top Scorers", icon: Trophy },
  { key: "assists", label: "Top Assists", icon: HandHelping },
  { key: "form", label: "Recent Form", icon: Calendar },
];

function PlayerRow({
  player,
  idx,
  type,
}: {
  player: TeamPlayerStat;
  idx: number;
  type: "goals" | "assists";
}) {
  const isTop3 = idx < 3;
  const medalColors = [
    "from-amber-500/20 to-yellow-500/10 border-amber-300 dark:border-amber-500/30",
    "from-gray-300/20 to-slate-200/10 border-gray-300 dark:border-gray-500/30",
    "from-orange-500/15 to-amber-500/5 border-orange-300 dark:border-orange-500/30",
  ];
  const medalEmojis = ["🥇", "🥈", "🥉"];
  const minsPerGoal =
    type === "goals" && player.minutes > 0 && player.value > 0
      ? Math.round(player.minutes / player.value)
      : null;

  return (
    <div
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

      {/* Photo */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-white/10">
        <Image
          src={player.photo}
          alt={player.name}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
          {player.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            League rank: #{player.rank}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
        {/* Main stat */}
        <div className="text-right">
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tabular-nums">
            {player.value}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
            {type === "goals" ? "Goals" : "Assists"}
          </div>
        </div>

        {/* Secondary stats */}
        <div className="hidden md:flex items-center gap-4">
          {type === "goals" && player.subValue > 0 && (
            <div
              className="flex items-center gap-1 text-xs text-emerald-500 dark:text-emerald-400"
              title="Penalties"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="font-semibold">{player.subValue}</span>
            </div>
          )}
          <div
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500"
            title="Appearances"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold">{player.appearances}</span>
          </div>
          <div
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500"
            title="Minutes Played"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="font-semibold">{player.minutes}&apos;</span>
          </div>
          {minsPerGoal && (
            <div
              className="flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400"
              title="Minutes per Goal"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="font-semibold">{minsPerGoal}&apos;</span>
              <span className="text-[9px] text-gray-400">/goal</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormResult({
  result,
  opponent,
  score,
  date,
}: {
  result: string;
  opponent: string;
  score: string;
  date: string;
}) {
  const colors: Record<string, string> = {
    W: "border-emerald-500 bg-emerald-500/10",
    D: "border-amber-500 bg-amber-500/10",
    L: "border-red-500 bg-red-500/10",
  };
  const textColors: Record<string, string> = {
    W: "text-emerald-600 dark:text-emerald-400",
    D: "text-amber-600 dark:text-amber-400",
    L: "text-red-600 dark:text-red-400",
  };
  const labels: Record<string, string> = { W: "Win", D: "Draw", L: "Loss" };

  return (
    <div
      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-l-4 ${
        colors[result] || "border-gray-300 bg-gray-100/50"
      } bg-white dark:bg-white/[0.03]`}
    >
      <div
        className={`text-lg font-black w-8 text-center ${
          textColors[result] || "text-gray-500"
        }`}
      >
        {result}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
          vs {opponent}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {format(new Date(date), "dd MMM yyyy")} ·{" "}
          {labels[result] || result}
        </div>
      </div>
      <div className="text-lg font-bold text-gray-700 dark:text-gray-300 tabular-nums">
        {score}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-xl bg-gray-100 dark:bg-white/5"
        />
      ))}
    </div>
  );
}

export default function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("scorers");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/team-stats?team=${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load team data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Back to leagues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back link */}
      <Link
        href={
          data?.overview?.leagueId
            ? `/league/${data.overview.leagueId}`
            : "/"
        }
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to standings
      </Link>

      {/* Team Header */}
      {data && (
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            <Image
              src={data.overview.logo}
              alt={data.overview.name}
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {data.overview.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span>{data.overview.country}</span>
              {data.lastUpdated && (
                <div className="flex items-center gap-1 text-xs">
                  <RefreshCw className="w-3 h-3" />
                  Updated{" "}
                  {formatDistanceToNow(new Date(data.lastUpdated), {
                    addSuffix: true,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Next Match */}
      {data?.nextMatch && (
        <div className="mb-6 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 font-medium">
            Next Match · {data.nextMatch.tournament}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 dark:text-white">
              {data.nextMatch.home}
            </span>
            <span className="text-xs text-gray-400 px-3">vs</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {data.nextMatch.away}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(data.nextMatch.date), "EEEE dd MMM yyyy, HH:mm")}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {activeTab === "scorers" && (
            <div className="space-y-2">
              {data?.scorers && data.scorers.length > 0 ? (
                data.scorers.map((p, idx) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    idx={idx}
                    type="goals"
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">No scorer data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "assists" && (
            <div className="space-y-2">
              {data?.assisters && data.assisters.length > 0 ? (
                data.assisters.map((p, idx) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    idx={idx}
                    type="assists"
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">
                    No assist data available
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "form" && (
            <div className="space-y-2">
              {data?.form && data.form.length > 0 ? (
                data.form.map((f, idx) => (
                  <FormResult
                    key={idx}
                    result={f.result}
                    opponent={f.opponent}
                    score={f.score}
                    date={f.date}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">No form data available</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
