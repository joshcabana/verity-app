
"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogOut, Phone, Flag } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import CallCountdown from "@/components/call/CallCountdown";
import CallControls from "@/components/call/CallControls";
import VideoArea from "@/components/call/VideoArea";
import SparkPassButtons from "@/components/call/SparkPassButtons";
import MutualSparkReveal from "@/components/call/MutualSparkReveal";
import { useAgoraCall } from "@/hooks/useAgoraCall";

type CallPhase =
  | "loading"
  | "connecting"
  | "live"
  | "deciding"
  | "waiting"
  | "mutual-spark"
  | "no-spark"
  | "reflection"
  | "complete";

interface CallRecord {
  id: string;
  caller_id: string;
  callee_id: string;
  agora_channel: string;
  caller_decision?: string | null;
  callee_decision?: string | null;
  is_mutual_spark?: boolean | null;
}

const CALL_DURATION = 45;

export default function LiveCallPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LiveCallPageInner />
    </Suspense>
  );
}

function LiveCallPageInner() {
  const params = useParams();
  const callId = params.id as string;
  const searchParams = useSearchParams();
  const channelFromUrl = searchParams.get("channel") || "";
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [phase, setPhase] = useState<CallPhase>("loading");
  const [secondsLeft, setSecondsLeft] = useState(CALL_DURATION);
  const [elapsed, setElapsed] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [myChoice, setMyChoice] = useState<"spark" | "pass" | null>(null);

  // Call data from DB
  const [callData, setCallData] = useState<CallRecord | null>(null);
  const [myRole, setMyRole] = useState<"caller" | "callee" | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [sparkId, setSparkId] = useState<string | null>(null);
  const [wasMutualSpark, setWasMutualSpark] = useState(false);

  // Agora params
  const [agoraParams, setAgoraParams] = useState({ appId: "", token: null as string | null, uid: 0 });

  const {
    localVideoRef,
    remoteVideoRef,
    isRemoteConnected,
    isJoined,
    micOn,
    cameraOn,
    error: agoraError,
    leave,
    toggleMic,
    toggleCamera,
    revealIdentity,
  } = useAgoraCall({
    appId: agoraParams.appId,
    channel: channelFromUrl || callData?.agora_channel || "",
    token: agoraParams.token,
    uid: agoraParams.uid,
    enabled: phase === "connecting" && !!agoraParams.appId,
  });

  // Fetch call data and get Agora token
  useEffect(() => {
    if (!callId || !user) return;
    let cancelled = false;

    const fetchCall = async () => {
      const { data: call, error } = await supabase
        .from("calls")
        .select("*")
        .eq("id", callId)
        .single();

      if (cancelled) return;
      if (error || !call) {
        toast.error("Call not found");
        router.push("/lobby");
        return;
      }

      setCallData(call as CallRecord);
      const role = call.caller_id === user.id ? "caller" : "callee";
      setMyRole(role);
      setPartnerId(role === "caller" ? call.callee_id : call.caller_id);

      // Get Agora token
      const channel = channelFromUrl || call.agora_channel;
      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke("agora-token", {
        body: { call_id: callId, channel },
      });

      if (cancelled) return;
      if (tokenErr) {
        toast.error("Failed to get call credentials");
        router.push("/lobby");
        return;
      }

      setAgoraParams({
        appId: tokenData.appId,
        token: tokenData.token,
        uid: tokenData.uid,
      });
      setPhase("connecting");
    };

    fetchCall();
    return () => { cancelled = true; };
  }, [callId, user, router, channelFromUrl, supabase]);

  // When Agora joins, start the live phase
  useEffect(() => {
    if (isJoined && phase === "connecting") {
      const t = setTimeout(() => setPhase("live"), 1500);
      return () => clearTimeout(t);
    }
  }, [isJoined, phase]);

  // Countdown
  useEffect(() => {
    if (phase !== "live") return;
    if (secondsLeft <= 0) {
      setPhase("deciding");
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((s) => s - 1);
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);

  // Handle choice: write to calls table
  const handleChoice = useCallback(async (choice: "spark" | "pass") => {
    if (!callId || !myRole) return;
    setMyChoice(choice);
    setPhase("waiting");

    const { error } = await supabase.rpc("submit_call_decision", {
      p_call_id: callId,
      p_decision: choice,
    });

    if (error) {
      toast.error("Failed to record choice. Please try again.");
      setPhase("deciding");
      return;
    }

    // Leave Agora after deciding
    await leave();
  }, [callId, myRole, leave, supabase]);

  // Subscribe to call updates for partner's decision
  useEffect(() => {
    if (phase !== "waiting" || !callId) return;
    let cancelled = false;

    // First check if both decisions already exist
    const checkDecisions = async () => {
      const { data } = await supabase
        .from("calls")
        .select("caller_decision, callee_decision, is_mutual_spark")
        .eq("id", callId)
        .single();
      if (cancelled) return;
      if (data?.caller_decision && data?.callee_decision) {
        setWasMutualSpark(!!data.is_mutual_spark);
        setPhase(data.is_mutual_spark ? "mutual-spark" : "no-spark");
      }
    };
    checkDecisions();

    const channel = supabase
      .channel(`call-${callId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "calls",
        filter: `id=eq.${callId}`,
      }, (payload: any) => {
        const row = payload.new as CallRecord;
        if (row.caller_decision && row.callee_decision) {
          setWasMutualSpark(!!row.is_mutual_spark);
          setPhase(row.is_mutual_spark ? "mutual-spark" : "no-spark");
        }
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [phase, callId, supabase]);

  // Handle safe exit
  const handleSafeExit = useCallback(async () => {
    await leave();
    router.push("/lobby");
  }, [router, leave]);

  // Handle report
  const handleReport = useCallback(async (reason: string) => {
    if (!user || !partnerId || !callId) return;
    const sanitizedReason = reason.slice(0, 1000).trim();
    if (!sanitizedReason) {
      toast.error("Please provide a reason for the report.");
      return;
    }
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: partnerId,
      reason: sanitizedReason,
    });
    if (error) {
      toast.error("Failed to submit report.");
      return;
    }
    toast.success("Report submitted. Thank you for keeping Verity safe.");
    setReportOpen(false);
  }, [user, partnerId, callId, supabase]);

  // Navigate to reflection after mutual spark reveal
  const handleMutualSparkContinue = useCallback(async () => {
    if (!callId) {
      router.push("/chat");
      return;
    }

    // Reveal identity (swap anonymized track for raw camera) on mutual spark
    await revealIdentity();

    // Find the spark created by the trigger
    const { data: spark } = await supabase
      .from("sparks")
      .select("id")
      .eq("call_id", callId)
      .single();
    if (spark) {
      setSparkId(spark.id);
      router.push(`/chat/${spark.id}`);
    } else {
      router.push("/chat");
    }
  }, [callId, router, revealIdentity, supabase]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <AnimatePresence mode="wait">
        {/* LOADING */}
        {phase === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {/* CONNECTING */}
        {phase === "connecting" && (
          <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-7 px-6">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full border-2 border-gold/25 flex items-center justify-center">
              <Phone className="w-7 h-7 text-gold" />
            </motion.div>
            <div className="text-center">
              <p className="font-serif text-2xl text-foreground mb-2">Connecting you now…</p>
              <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
                Your call is fully anonymous. Relax — just be yourself.
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-gold" />
              ))}
            </div>
            {agoraError && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-red-400">{agoraError}</p>
                <button
                  onClick={() => router.back()}
                  className="text-sm text-gold hover:text-gold-light transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* LIVE CALL / DECIDING */}
        {(phase === "live" || phase === "deciding") && (
          <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col">
            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted/60">
                  <Shield className="w-3 h-3 text-gold/50" />
                  <span>Safety on</span>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-2">
                <CallCountdown seconds={secondsLeft} total={CALL_DURATION} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setReportOpen(true)}
                  className="w-9 h-9 rounded-full bg-surface/50 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-all"
                  aria-label="Report">
                  <Flag className="w-4 h-4" />
                </button>
                <button onClick={handleSafeExit}
                  className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-all"
                  aria-label="Safe Exit">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <VideoArea
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              isRemoteConnected={isRemoteConnected}
            />

            <div className="relative z-10 px-6 pb-8 pt-4">
              {phase === "deciding" ? (
                <SparkPassButtons onChoice={handleChoice} elapsed={elapsed} />
              ) : (
                <div className="flex items-center justify-center">
                  <CallControls micOn={micOn} cameraOn={cameraOn}
                    onToggleMic={toggleMic} onToggleCamera={toggleCamera} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* WAITING */}
        {phase === "waiting" && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            <p className="font-serif text-2xl text-foreground">
              {myChoice === "spark" ? "Spark sent." : "Choice recorded."}
            </p>
            <p className="text-sm text-muted">Waiting for their decision…</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-gold" />
              ))}
            </div>
          </motion.div>
        )}

        {/* MUTUAL SPARK */}
        {phase === "mutual-spark" && (
          <MutualSparkReveal onContinue={handleMutualSparkContinue} />
        )}

        {/* NO SPARK */}
        {phase === "no-spark" && (
          <motion.div key="no-spark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.6 }}
              className="text-center">
              <p className="font-serif text-2xl text-foreground mb-3">
                Thank you for your honesty.
              </p>
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Neither party knows who chose what. That&apos;s the Verity promise — dignity, always.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="flex flex-col items-center gap-3">
              <button onClick={() => router.push("/lobby")}
                className="text-sm text-gold hover:text-gold-light transition-colors">
                Back to lobby
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* COMPLETE */}
        {phase === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <div className="text-center">
              <p className="font-serif text-2xl text-foreground mb-3">Until next time.</p>
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Every call teaches you something about what you&apos;re looking for.
              </p>
            </div>
            <button onClick={() => router.push("/lobby")}
              className="text-sm text-gold hover:text-gold-light transition-colors">
              Back to lobby
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur flex items-center justify-center px-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-serif text-lg text-foreground mb-4">Report this person</h3>
            <div className="space-y-2 mb-6">
              {["Harassment", "Sexual content", "Scam", "Underage concern", "Other"].map((reason) => (
                <button key={reason} onClick={() => handleReport(reason)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border text-sm text-foreground hover:border-gold/30 hover:bg-gold/5 transition-all">
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={() => setReportOpen(false)}
              className="text-sm text-muted hover:text-foreground transition-colors w-full text-center">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
