"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LeagueCard } from "./LeagueCard";
import { GripVertical, RotateCcw } from "lucide-react";

interface League {
  id: number;
  name: string;
  country: string;
  flag: string;
}

const STORAGE_KEY = "football-stats-league-order";

function SortableLeague({
  league,
  index,
}: {
  league: League;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: league.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/drag ${isDragging ? "opacity-90 scale-105" : ""}`}
    >
      <div className="relative">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg opacity-0 group-hover/drag:opacity-100 transition-opacity duration-200 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <LeagueCard
          id={league.id}
          name={league.name}
          country={league.country}
          flag={league.flag}
          index={index}
        />
      </div>
    </div>
  );
}

export function SortableLeagueGrid({ leagues }: { leagues: League[] }) {
  const [orderedLeagues, setOrderedLeagues] = useState(leagues);
  const [isCustomOrder, setIsCustomOrder] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved order from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedOrder: number[] = JSON.parse(saved);
        // Rebuild ordered list from saved IDs, adding any new leagues at the end
        const ordered: League[] = [];
        const leagueMap = new Map(leagues.map((l) => [l.id, l]));

        for (const id of savedOrder) {
          const league = leagueMap.get(id);
          if (league) {
            ordered.push(league);
            leagueMap.delete(id);
          }
        }
        // Add any leagues not in saved order (newly added)
        for (const league of leagueMap.values()) {
          ordered.push(league);
        }

        setOrderedLeagues(ordered);
        setIsCustomOrder(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [leagues]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedLeagues((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(prev, oldIndex, newIndex);

      // Save to localStorage
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(newOrder.map((l) => l.id))
        );
      } catch {
        // Ignore
      }

      setIsCustomOrder(true);
      return newOrder;
    });
  }

  function resetOrder() {
    setOrderedLeagues(leagues);
    setIsCustomOrder(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {leagues.map((league, index) => (
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
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
          Select a League
        </h2>
        <div className="flex items-center gap-3">
          {isCustomOrder && (
            <button
              onClick={resetOrder}
              className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Reset to default order"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset order
            </button>
          )}
          <span className="text-[10px] text-gray-300 dark:text-gray-600">
            Drag to reorder
          </span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedLeagues.map((l) => l.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orderedLeagues.map((league, index) => (
              <SortableLeague
                key={league.id}
                league={league}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
