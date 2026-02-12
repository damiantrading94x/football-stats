"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { leagueLogoUrl } from "@/lib/types";

interface LeagueCardProps {
  id: number;
  name: string;
  country: string;
  flag: string;
  index: number;
}

export function LeagueCard({ id, name, country, flag, index }: LeagueCardProps) {
  const gradients = [
    "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 dark:from-purple-500/5 dark:to-pink-500/5 dark:hover:from-purple-500/15 dark:hover:to-pink-500/15",
    "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 dark:from-blue-500/5 dark:to-cyan-500/5 dark:hover:from-blue-500/15 dark:hover:to-cyan-500/15",
    "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 dark:from-emerald-500/5 dark:to-teal-500/5 dark:hover:from-emerald-500/15 dark:hover:to-teal-500/15",
    "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 dark:from-amber-500/5 dark:to-orange-500/5 dark:hover:from-amber-500/15 dark:hover:to-orange-500/15",
    "from-rose-500/10 to-red-500/10 hover:from-rose-500/20 hover:to-red-500/20 dark:from-rose-500/5 dark:to-red-500/5 dark:hover:from-rose-500/15 dark:hover:to-red-500/15",
  ];

  const borderColors = [
    "border-purple-200 dark:border-purple-500/20",
    "border-blue-200 dark:border-blue-500/20",
    "border-emerald-200 dark:border-emerald-500/20",
    "border-amber-200 dark:border-amber-500/20",
    "border-rose-200 dark:border-rose-500/20",
  ];

  const accentColors = [
    "text-purple-600 dark:text-purple-400",
    "text-blue-600 dark:text-blue-400",
    "text-emerald-600 dark:text-emerald-400",
    "text-amber-600 dark:text-amber-400",
    "text-rose-600 dark:text-rose-400",
  ];

  const gradientIdx = index % gradients.length;

  return (
    <Link href={`/league/${id}`}>
      <div
        className={`group relative rounded-2xl border ${borderColors[gradientIdx]} bg-gradient-to-br ${gradients[gradientIdx]} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer`}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={leagueLogoUrl(id)}
                alt={name}
                fill
                className="object-contain"
                sizes="40px"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                {name}
              </h3>
              <p className={`text-xs ${accentColors[gradientIdx]} font-medium`}>
                {country}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </Link>
  );
}
