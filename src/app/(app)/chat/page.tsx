"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { MessageCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/lib/supabase/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];

interface MatchWithPartner extends Match {
  partner_name: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [matches, setMatches] = useState<MatchWithPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("matches")
        .select("*")
        .eq("is_mutual", true)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (data) {
        const enriched: MatchWithPartner[] = await Promise.all(
          data.map(async (match) => {
            const partnerId =
              match.user1_id === user.id ? match.user2_id : match.user1_id;
            const { data: partnerProfile } = await supabase
              .from("profiles")
              .select("display_name, name")
              .eq("id", partnerId)
              .single();

            return {
              ...match,
              partner_name:
                partnerProfile?.display_name ||
                partnerProfile?.name ||
                "Someone",
            };
          })
        );
        setMatches(enriched);
      }

      setIsLoading(false);
    };

    fetchMatches();
  }, [supabase, user]);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <p className="label-caps mb-1">Your</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Conversations
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 animate-pulse"
            >
              <div className="h-5 bg-border rounded w-1/2 mb-2" />
              <div className="h-4 bg-border rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-muted/30 mx-auto mb-4" />
          <p className="text-muted text-sm">No conversations yet.</p>
          <p className="text-muted/60 text-xs mt-1">
            Join a drop and spark a connection to start chatting.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => (
            <Link key={match.id} href={`/chat/${match.id}`}>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-gold/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="text-gold text-sm font-medium">
                      {match.partner_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {match.partner_name}
                    </p>
                    <p className="text-muted text-xs">
                      Matched{" "}
                      {match.created_at
                        ? formatDistanceToNow(new Date(match.created_at), {
                            addSuffix: true,
                          })
                        : "recently"}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-muted group-hover:text-gold transition-colors"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
