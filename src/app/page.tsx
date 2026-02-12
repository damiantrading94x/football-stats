import { LEAGUES } from "@/lib/types";
import { LeagueCard } from "@/components/LeagueCard";
import { Trophy, TrendingUp, Target, Users } from "lucide-react";

export default function Home() {
  const STAT_HIGHLIGHTS = [
    { icon: Trophy, label: "Leagues", value: String(LEAGUES.length), color: "text-amber-500" },
    { icon: TrendingUp, label: "Updated", value: "5min", color: "text-emerald-500" },
    { icon: Target, label: "Stats", value: "Live", color: "text-blue-500" },
    { icon: Users, label: "Players", value: "200+", color: "text-purple-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
          Football{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            Statistics
          </span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Real-time top scorers, assists, penalty leaders, and league standings
          across the world&apos;s best football leagues.
        </p>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8">
          {STAT_HIGHLIGHTS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* League Grid */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold mb-4 px-1">
          Select a League
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEAGUES.map((league, index) => (
            <LeagueCard
              key={league.id}
              id={league.id}
              name={league.name}
              country={league.country}
              flag={league.flag}
              index={index}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
