'use client';

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Camera, Mic, Wifi, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type CheckStatus = "pending" | "ok" | "warn" | "error";

interface Drop {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  status: string;
  room_id: string;
  agora_channel?: string;
}

export default function LobbyPage() {
  const router = useRouter();
  const { user, userTrust } = useAuth();
  const supabase = createClient();

  const [nextDrop, setNextDrop] = useState<Drop | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isDropLive, setIsDropLive] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Hardware checks
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CheckStatus>("pending");
  const [micStatus, setMicStatus] = useState<CheckStatus>("pending");
  const [networkStatus, setNetworkStatus] = useState<CheckStatus>("pending");

  // Camera + Mic check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus("ok");
        setMicStatus("ok");
      } catch {
        if (!cancelled) {
          setCameraStatus("error");
          setMicStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Network check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const start = performance.now();
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: "HEAD",
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        });
        const latency = Math.round(performance.now() - start);
        if (cancelled) return;
        setNetworkStatus(latency < 300 ? "ok" : latency < 800 ? "warn" : "error");
      } catch {
        if (!cancelled) setNetworkStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch next RSVP'd drop
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchNextDrop = async () => {
      // Get user's RSVP'd drop IDs
      const { data: rsvps } = await supabase
        .from("drop_rsvps")
        .select("drop_id")
        .eq("user_id", user.id);

      if (cancelled || !rsvps || rsvps.length === 0) return;

      const dropIds = rsvps.map((r) => r.drop_id).filter((id): id is string => id !== null);
      const { data: drops } = await supabase
        .from("drops")
        .select("*")
        .in("id", dropIds)
        .in("status", ["upcoming", "live"])
        .order("scheduled_at", { ascending: true })
        .limit(1);

      if (cancelled) return;
      if (drops && drops.length > 0) {
        setNextDrop(drops[0] as Drop);
        setIsDropLive(drops[0].status === "live");
      }
    };

    fetchNextDrop();

    // Subscribe to drop updates
    const channel = supabase
      .channel("lobby-drops")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "drops",
      }, (payload: any) => {
        const row = payload.new;
        if (nextDrop && row.id === nextDrop.id) {
          setNextDrop(row as Drop);
          setIsDropLive(row.status === "live");
        }
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user, supabase, nextDrop]);

  // Countdown timer
  useEffect(() => {
    if (!nextDrop || isDropLive) return;
    const updateCountdown = () => {
      const now = new Date();
      const dropTime = new Date(nextDrop.scheduled_at);
      const diff = dropTime.getTime() - now.getTime();

      if (diff <= 0) {
        setIsDropLive(true);
        setCountdown("Live now!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const t = setInterval(updateCountdown, 1000);
    return () => clearInterval(t);
  }, [nextDrop, isDropLive]);

  // Matchmaking polling refs
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRetryRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollRetryRef.current = 0;
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Find match
  const handleFindMatch = useCallback(async () => {
    if (!nextDrop || !user) return;
    setIsMatching(true);
    setMatchError(null);

    try {
      const { data, error } = await supabase.functions.invoke("find-match", {
        body: { drop_id: nextDrop.id, room_id: nextDrop.room_id },
      });

      if (error) throw error;

      if (data.status === "matched") {
        setIsMatching(false);
        router.push(`/call/${data.call_id}?channel=${encodeURIComponent(data.agora_channel)}`);
      } else {
        // Queued — start polling every 4s, max 10 retries
        pollRetryRef.current = 0;
        pollIntervalRef.current = setInterval(async () => {
          pollRetryRef.current += 1;
          if (pollRetryRef.current > 10) {
            stopPolling();
            setIsMatching(false);
            setMatchError("No match found this time. Try again when the Drop is live.");
            return;
          }
          try {
            const { data: pollData, error: pollErr } = await supabase.functions.invoke("find-match", {
              body: { drop_id: nextDrop.id, room_id: nextDrop.room_id },
            });
            if (pollErr) return;
            if (pollData?.status === "matched") {
              stopPolling();
              setIsMatching(false);
              router.push(`/call/${pollData.call_id}?channel=${encodeURIComponent(pollData.agora_channel)}`);
            }
          } catch {
            // Silent — retry next interval
          }
        }, 4000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to find match";
      setMatchError(message);
      setIsMatching(false);
    }
  }, [nextDrop, user, supabase, router, stopPolling]);

  const statusColor = (s: CheckStatus) => {
    if (s === "ok") return "text-green-500";
    if (s === "warn") return "text-amber-500";
    if (s === "error") return "text-red-400";
    return "text-muted animate-pulse";
  };

  const statusLabel = (s: CheckStatus) => {
    if (s === "ok") return "Ready";
    if (s === "warn") return "Okay";
    if (s === "error") return "Issue";
    return "Checking…";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container max-w-2xl mx-auto px-5 h-14 flex items-center">
          <h1 className="font-serif text-lg text-foreground">Green Room</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-5 pt-6 space-y-6">
        {/* Camera preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border border-border bg-card aspect-video">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          {cameraStatus === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card">
              <p className="text-sm text-muted">Camera not available — check browser permissions</p>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface/80 backdrop-blur rounded-full px-3 py-1 text-[11px] text-muted">
            <Shield className="w-3 h-3 text-gold/60" />
            Anonymous filter ON
          </div>
        </motion.div>

        {/* Hardware checks */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2">
            <Camera className={`w-5 h-5 ${statusColor(cameraStatus)}`} />
            <span className="text-[11px] font-medium text-foreground">Camera</span>
            <span className={`text-[10px] ${statusColor(cameraStatus)}`}>{statusLabel(cameraStatus)}</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2">
            <Mic className={`w-5 h-5 ${statusColor(micStatus)}`} />
            <span className="text-[11px] font-medium text-foreground">Microphone</span>
            <span className={`text-[10px] ${statusColor(micStatus)}`}>{statusLabel(micStatus)}</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2">
            <Wifi className={`w-5 h-5 ${statusColor(networkStatus)}`} />
            <span className="text-[11px] font-medium text-foreground">Network</span>
            <span className={`text-[10px] ${statusColor(networkStatus)}`}>{statusLabel(networkStatus)}</span>
          </div>
        </motion.div>

        {/* Drop info / countdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5 text-center space-y-3">
          {nextDrop ? (
            <>
              <p className="label-caps text-gold">Your Next Drop</p>
              <h2 className="font-serif text-xl text-foreground">{nextDrop.title}</h2>
              {isDropLive ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Live now</span>
                </div>
              ) : (
                <div>
                  <p className="text-muted text-xs mb-1">Starts in</p>
                  <p className="font-serif text-2xl text-gold tabular-nums">{countdown}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-muted text-sm">No upcoming drops RSVP&apos;d</p>
              <button onClick={() => router.push("/drops")}
                className="ghost-pill text-sm">
                Browse Drops
              </button>
            </>
          )}
        </motion.div>

        {/* Find match / matchmaking */}
        <AnimatePresence mode="wait">
          {isMatching ? (
            <motion.div
              key="matching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border border-gold/20 bg-gold/5 p-8 flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-gold" />
              </motion.div>
              <p className="font-serif text-lg text-foreground">Finding your match…</p>
              <p className="text-sm text-muted text-center max-w-xs">
                Hang tight — we&apos;re pairing you with someone special. This usually takes less than a minute.
              </p>
              <button
                onClick={() => { stopPolling(); setIsMatching(false); }}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              {matchError && (
                <p className="text-sm text-red-400 text-center">{matchError}</p>
              )}
              {nextDrop && isDropLive && (
                <button
                  onClick={handleFindMatch}
                  className="w-full max-w-xs py-3 rounded-xl bg-gold text-background font-medium hover:bg-gold-light transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Find My Match
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reassurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted/60 pt-2">
          <Shield className="w-3.5 h-3.5 text-gold/40" />
          <span>You can leave anytime · Nothing is recorded</span>
        </div>
      </main>
    </div>
  );
}
