"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function ChatDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { user } = useAuth();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerName, setPartnerName] = useState("Chat");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch match to get partner info
      const { data: match } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (match) {
        const partnerId =
          match.user1_id === user.id ? match.user2_id : match.user1_id;
        const { data: partner } = await supabase
          .from("profiles")
          .select("display_name, name")
          .eq("id", partnerId)
          .single();

        setPartnerName(partner?.display_name || partner?.name || "Someone");
      }

      // Fetch messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs);
      setIsLoading(false);
    };

    fetchData();

    // Subscribe to new messages
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, matchId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    setIsSending(true);

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
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
        <h1 className="font-medium text-foreground text-sm">{partnerName}</h1>
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
              No messages yet. Say hello! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id || msg.from_user === user?.id;
            return (
              <div
                key={msg.id}
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
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card mb-16">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
