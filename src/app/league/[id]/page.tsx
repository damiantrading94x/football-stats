"use client";

import { useEffect, useState, use } from "react";
import { LEAGUES, TopScorer, Standing } from "@/lib/types";
import { StatsTable } from "@/components/StatsTable";
import { StandingsTable } from "@/components/StandingsTable";
import { PenaltyLeaders } from "@/components/PenaltyLeaders";
import {
  ArrowLeft,
  Trophy,
  HandHelping,
  Target,
  TableProperties,
  RefreshCw,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface LeagueResponse {
  league: {
    id: number;
    name: string;
    country: string;
    flag: string;
  };
  topScorers: TopScorer[];
  topAssists: TopScorer[];
  standings: Standing[];
  lastUpdated: string;
}

type TabType = "scorers" | "assists" | "penalties" | "standings";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "scorers", label: "Top Scorers", icon: Trophy },
  { key: "assists", label: "Top Assists", icon: HandHelping },
  { key: "penalties", label: "Penalties", icon: Target },
  { key: "standings", label: "Standings", icon: TableProperties },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-xl bg-gray-100 dark:bg-white/[0.03]"
        />
      ))}
    </div>
  );
}

export default function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const leagueId = parseInt(resolvedParams.id);
  const league = LEAGUES.find((l) => l.id === leagueId);

  const [data, setData] = useState<LeagueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("scorers");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/stats?league=${leagueId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Failed to load league data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  if (!league) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          League not found
        </h1>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to leagues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back button + League header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All Leagues
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{league.flag}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {league.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {league.country} · 2025/26 Season
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data?.lastUpdated && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                Updated{" "}
                {formatDistanceToNow(new Date(data.lastUpdated), {
                  addSuffix: true,
                })}
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">
              {tab.key === "scorers"
                ? "Goals"
                : tab.key === "assists"
                ? "Assists"
                : tab.key === "penalties"
                ? "Pens"
                : "Table"}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <div className="text-center py-16">
          <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="animate-fade-in">
          {activeTab === "scorers" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                  Top Scorers
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {data?.topScorers?.length || 0} players
                </span>
              </div>
              <StatsTable
                players={data?.topScorers || []}
                type="scorers"
              />
            </div>
          )}

          {activeTab === "assists" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                  Top Assists
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {data?.topAssists?.length || 0} players
                </span>
              </div>
              <StatsTable
                players={data?.topAssists || []}
                type="assists"
              />
            </div>
          )}

          {activeTab === "penalties" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                  Penalty Leaders
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Scored from top scorers data
                </span>
              </div>
              <PenaltyLeaders players={data?.topScorers || []} />
            </div>
          )}

          {activeTab === "standings" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                  League Table
                </h2>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4">
                <StandingsTable standings={data?.standings || []} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
