'use client';

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, isPast } from "date-fns";
import { Calendar, Users, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";

type Drop = Database["public"]["Tables"]["drops"]["Row"];

interface DropWithRSVPCount extends Drop {
  rsvp_count: number;
}

export default function DropsPage() {
  const [drops, setDrops] = useState<DropWithRSVPCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDrops = async () => {
      const now = new Date().toISOString();

      const { data: dropsData } = await supabase
        .from("drops")
        .select("*")
        .gt("scheduled_at", now)
        .order("scheduled_at", { ascending: true });

      if (dropsData) {
        // Fetch RSVP counts for each drop
        const dropsWithCounts: DropWithRSVPCount[] = await Promise.all(
          dropsData.map(async (drop) => {
            const { count } = await supabase
              .from("drop_rsvps")
              .select("*", { count: "exact", head: true })
              .eq("drop_id", drop.id);

            return { ...drop, rsvp_count: count ?? 0 };
          })
        );

        setDrops(dropsWithCounts);
      }

      setIsLoading(false);
    };

    fetchDrops();
  }, [supabase]);

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-6">
        <p className="label-caps mb-1">Upcoming</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Drops
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 animate-pulse"
            >
              <div className="h-5 bg-border rounded w-3/4 mb-3" />
              <div className="h-4 bg-border rounded w-1/2 mb-2" />
              <div className="h-4 bg-border rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : drops.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-muted/30 mx-auto mb-4" />
          <p className="text-muted text-sm">No upcoming drops right now.</p>
          <p className="text-muted/60 text-xs mt-1">
            Check back soon — new drops are added regularly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {drops.map((drop) => (
            <Link key={drop.id} href={`/drops/${drop.id}`}>
              <div className="bg-card border border-gold/20 rounded-xl p-5 hover:border-gold/40 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-gold transition-colors">
                      {drop.title}
                    </h3>
                    {drop.description && (
                      <p className="text-muted text-sm mt-1 line-clamp-2">
                        {drop.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-muted text-xs">
                        <Calendar size={13} />
                        <span>
                          {format(
                            new Date(drop.scheduled_at),
                            "EEE d MMM, h:mm a"
                          )}
                        </span>
                      </div>
                      {drop.duration_minutes && (
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                          <Clock size={13} />
                          <span>{drop.duration_minutes} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted text-xs">
                        <Users size={13} />
                        <span>{drop.rsvp_count} RSVPs</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-muted group-hover:text-gold transition-colors mt-1 flex-shrink-0"
                  />
                </div>

                {/* Status badge */}
                {drop.status && (
                  <div className="mt-3 flex">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-medium tracking-wide ${
                        drop.status === "open"
                          ? "bg-gold/10 text-gold"
                          : "bg-border text-muted"
                      }`}
                    >
                      {drop.status}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
