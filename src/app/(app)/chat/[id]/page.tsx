
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { ArrowLeft, Send, MoreHorizontal, Flag, Ban, Archive } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Message {
  id: string;
  sender_id: string;
  from_user?: string | null;
  content: string | null;
  message_text?: string | null;
  created_at: string;
  is_read?: boolean | null;
  match_id?: string | null;
  spark_id?: string | null;
}

const TYPING_TIMEOUT = 3000;

export default function ChatDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerName, setPartnerName] = useState("Chat");
  const [dropName, setDropName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingBroadcast = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Try sparks table first, fall back to matches
      let pid: string | null = null;
      let foundDropName: string | null = null;

      const { data: spark } = await supabase
        .from("sparks")
        .select("user_a, user_b, call_id")
        .eq("id", matchId)
        .single();

      if (spark) {
        pid = spark.user_a === user.id ? spark.user_b : spark.user_a;
      } else {
        // Fallback to matches table
        const { data: match } = await supabase
          .from("matches")
          .select("*")
          .eq("id", matchId)
          .single();

        if (match) {
          pid = match.user1_id === user.id ? match.user2_id : match.user1_id;
        }
      }

      if (pid) {
        setPartnerId(pid);
        const { data: partner } = await supabase
          .from("profiles")
          .select("display_name, name")
          .eq("id", pid)
          .single();
        setPartnerName(partner?.display_name || partner?.name || "Someone");
      }

      if (foundDropName) {
        setDropName(foundDropName);
      }

      // Fetch messages — try both spark_id and match_id columns
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`match_id.eq.${matchId},spark_id.eq.${matchId}`)
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs as Message[]);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase, matchId, user]);

  // Real-time message subscription
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload: any) => {
          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `spark_id=eq.${matchId}`,
        },
        (payload: any) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, matchId]);

  // Typing indicator via Realtime Broadcast
  useEffect(() => {
    if (!matchId || !user) return;
    const channel = supabase.channel(`typing-${matchId}`);
    channel
      .on("broadcast", { event: "typing" }, (payload: any) => {
        if (payload.payload?.user_id !== user.id) {
          setPartnerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), TYPING_TIMEOUT);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [matchId, user, supabase]);

  const broadcastTyping = useCallback(() => {
    if (!matchId || !user) return;
    const now = Date.now();
    if (now - lastTypingBroadcast.current < 2000) return;
    lastTypingBroadcast.current = now;
    supabase.channel(`typing-${matchId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    });
  }, [matchId, user, supabase]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread partner messages as read
  useEffect(() => {
    if (!user || !messages.length) return;
    const unreadIds = messages
      .filter((m) => m.sender_id !== user.id && (m.from_user !== user.id) && m.is_read === false)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    supabase
      .from("messages")
      .update({ is_read: true })
      .in("id", unreadIds)
      .then();
  }, [messages, user, supabase]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    setIsSending(true);

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      spark_id: matchId,
      sender_id: user.id,
      from_user: user.id,
      message_text: newMessage.trim(),
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Couldn't send message.");
    } else {
      setNewMessage("");
    }

    setIsSending(false);
  };

  const handleReport = useCallback(async () => {
    if (!user || !partnerId) return;
    setMenuOpen(false);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: partnerId,
      reason: "Reported from chat",
    });
    if (error) {
      toast.error("Failed to submit report.");
      return;
    }
    toast.success("Report submitted.");
  }, [user, partnerId, supabase]);

  const handleBlock = useCallback(async () => {
    if (!user || !partnerId) return;
    setMenuOpen(false);
    await supabase.from("user_blocks").insert({
      blocker_id: user.id,
      blocked_id: partnerId,
    });
    toast.success("User blocked.");
    router.push("/chat");
  }, [user, partnerId, supabase, router]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Link
          href="/chat"
          className="text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
          <span className="text-gold text-xs font-medium">
            {partnerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-medium text-foreground text-sm truncate">{partnerName}</h1>
          {dropName && (
            <p className="text-[10px] text-muted/60 truncate">Matched via {dropName}</p>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-10 w-44 bg-card border border-border rounded-lg shadow-lg py-1 z-10">
              <button onClick={handleReport}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface/50 transition-colors">
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
              <button onClick={handleBlock}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface/50 transition-colors">
                <Ban className="w-3.5 h-3.5" /> Block
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-sm">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_id === user?.id || msg.from_user === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < 20 ? i * 0.03 : 0 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                    isOwn
                      ? "bg-gold/20 text-foreground"
                      : "bg-surface border border-border text-foreground"
                  }`}
                >
                  <p className="text-sm">
                    {msg.message_text || msg.content}
                  </p>
                  {msg.created_at && (
                    <p
                      className={`text-[10px] mt-1 ${
                        isOwn ? "text-gold/60" : "text-muted/60"
                      }`}
                    >
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* Typing indicator */}
        {partnerTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-muted"
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card mb-16">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              broadcastTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold/50 transition-colors text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
