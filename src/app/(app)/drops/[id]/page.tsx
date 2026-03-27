
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { format } from "date-fns";
import { Calendar, Users, Clock, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/database.types";

type Drop = Database["public"]["Tables"]["drops"]["Row"];

export default function DropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [drop, setDrop] = useState<Drop | null>(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRSVPing, setIsRSVPing] = useState(false);

  const dropId = params.id as string;

  useEffect(() => {
    const fetchDrop = async () => {
      const { data } = await supabase
        .from("drops")
        .select("*")
        .eq("id", dropId)
        .single();

      if (data) {
        setDrop(data);
      }

      // Get RSVP count
      const { count } = await supabase
        .from("drop_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("drop_id", dropId);

      setRsvpCount(count ?? 0);

      // Check if user has already RSVPd
      if (user) {
        const { data: rsvp } = await supabase
          .from("drop_rsvps")
          .select("id")
          .eq("drop_id", dropId)
          .eq("user_id", user.id)
          .single();

        setHasRSVPd(!!rsvp);
      }

      setIsLoading(false);
    };

    fetchDrop();
  }, [supabase, dropId, user]);

  const handleRSVP = async () => {
    if (!user) return;
    setIsRSVPing(true);

    if (hasRSVPd) {
      // Cancel RSVP
      await supabase
        .from("drop_rsvps")
        .delete()
        .eq("drop_id", dropId)
        .eq("user_id", user.id);

      setHasRSVPd(false);
      setRsvpCount((c) => c - 1);
      toast.success("RSVP cancelled.");
    } else {
      // Create RSVP
      const { error } = await supabase.from("drop_rsvps").insert({
        drop_id: dropId,
        user_id: user.id,
      });

      if (error) {
        toast.error("Couldn't RSVP. Please try again.");
      } else {
        setHasRSVPd(true);
        setRsvpCount((c) => c + 1);
        toast.success("You're in! We'll notify you when it starts.");
      }
    }

    setIsRSVPing(false);
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-border rounded w-1/4" />
          <div className="h-8 bg-border rounded w-3/4" />
          <div className="h-4 bg-border rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-muted">Drop not found.</p>
        <Link href="/drops" className="text-gold text-sm mt-2 inline-block">
          Back to Drops
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Back button */}
      <Link
        href="/drops"
        className="inline-flex items-center gap-1.5 text-muted hover:text-foreground transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back to Drops</span>
      </Link>

      {/* Drop card */}
      <div className="bg-card border border-gold/20 rounded-xl p-6 space-y-6">
        <div>
          <p className="label-caps mb-2">Drop Details</p>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {drop.title}
          </h1>
          {drop.description && (
            <p className="text-muted text-sm mt-2 leading-relaxed">
              {drop.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar size={15} className="text-gold" />
            <span>
              {format(new Date(drop.scheduled_at), "EEE d MMM yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock size={15} className="text-gold" />
            <span>
              {format(new Date(drop.scheduled_at), "h:mm a")}
              {drop.duration_minutes && ` · ${drop.duration_minutes} min`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Users size={15} className="text-gold" />
            <span>
              {rsvpCount} RSVP{rsvpCount !== 1 ? "s" : ""}
              {drop.max_capacity && ` / ${drop.max_capacity}`}
            </span>
          </div>
          {drop.region && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin size={15} className="text-gold" />
              <span>{drop.region}</span>
            </div>
          )}
        </div>

        {/* RSVP button */}
        <button
          onClick={handleRSVP}
          disabled={isRSVPing}
          className={`ghost-pill w-full ${
            hasRSVPd
              ? "!border-border !text-muted hover:!border-red-500/50 hover:!text-red-400"
              : ""
          }`}
        >
          {isRSVPing
            ? "Updating…"
            : hasRSVPd
              ? "Cancel RSVP"
              : "RSVP to this Drop"}
        </button>
      </div>
    </div>
  );
}
