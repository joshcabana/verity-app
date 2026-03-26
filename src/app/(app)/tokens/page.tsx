"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Crown, Check, Sparkles, Zap, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const tokenPacks = [
  { id: "starter", name: "Starter", tokens: 10, price: "$4.90", badge: null, price_id: "price_1T6rXLC1O032lUHcL3kvvio4" },
  { id: "popular", name: "Popular", tokens: 15, price: "$6.90", badge: "Most popular", price_id: "price_1T6rYJC1O032lUHc3fO3j6R6" },
  { id: "value", name: "Value", tokens: 30, price: "$11.90", badge: "Best value", price_id: "price_1T6rZ0C1O032lUHciuLq0TXN" },
] as const;

const passPerks = [
  { icon: Zap, text: "Priority matchmaking — top of every room" },
  { icon: Coins, text: "5 bonus tokens every month" },
  { icon: Sparkles, text: "One free Spark Extension every day" },
  { icon: Star, text: "Access to all premium rooms" },
  { icon: Crown, text: "Ad-free experience, always" },
];

export default function TokensPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <TokensPageInner />
    </Suspense>
  );
}

function TokensPageInner() {
  const { profile, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const tokenBalance = profile?.token_balance ?? 0;
  const subscriptionTier = profile?.subscription_tier ?? "free";
  const isPassHolder = subscriptionTier === "pass_monthly" || subscriptionTier === "pass_annual";

  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  // Handle ?success=true redirect from Stripe
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setPurchaseSuccess(true);
      toast.success("Purchase complete!");
      refreshProfile();
      // Clean URL
      router.replace("/tokens");
    }
  }, [searchParams, router, refreshProfile]);

  const handleCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      toast.error("Unable to start checkout. Please try again.");
    } finally {
      setLoadingPriceId(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPriceId("manage");
    try {
      const returnUrl = `${window.location.origin}/tokens`;
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { return_url: returnUrl },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Unable to open subscription portal");
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-2xl mx-auto px-5 pt-5 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-2xl text-foreground mb-1"
          >
            Credits & Pass
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-medium tabular-nums">
              {tokenBalance} tokens
            </span>
            <span className="text-xs text-muted/50">available</span>
          </motion.div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-5 pt-6">
        {/* Purchase success banner */}
        <AnimatePresence>
          {purchaseSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">Purchase complete!</p>
                <p className="text-xs text-muted">Your tokens have been added.</p>
              </div>
              <button onClick={() => setPurchaseSuccess(false)} className="text-xs text-muted hover:text-foreground">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token Packs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="font-serif text-lg text-foreground mb-1">Token Packs</h2>
          <p className="text-xs text-muted/60 mb-5">Support more meaningful connections</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tokenPacks.map((pack, i) => {
              const isLoading = loadingPriceId === pack.price_id;
              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className={`relative rounded-lg border p-5 transition-all duration-300 ${
                    pack.id === "popular"
                      ? "border-gold/30 bg-gold/[0.04] shadow-[0_0_40px_rgba(212,175,55,0.05)]"
                      : "border-border bg-card hover:border-gold/15"
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-2.5 left-4">
                      <span className="text-[9px] tracking-[0.15em] uppercase text-gold bg-background border border-gold/25 px-2.5 py-0.5 rounded-full">
                        {pack.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xs text-muted/60 uppercase tracking-[0.15em] mb-1">{pack.name}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-2xl text-foreground">{pack.tokens}</span>
                      <span className="text-xs text-muted">tokens</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted/50 mb-4">Use for Spark Extensions and premium features</p>

                  <div className="w-full h-[3px] rounded-full bg-surface/60 overflow-hidden mb-5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(pack.tokens / 30) * 100}%` }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                      className="h-full rounded-full bg-gold/40"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground">{pack.price}</span>
                    <button
                      disabled={!!loadingPriceId}
                      onClick={() => handleCheckout(pack.price_id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        pack.id === "popular"
                          ? "bg-gold text-background hover:bg-gold-light"
                          : "ghost-pill"
                      } disabled:opacity-50`}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="h-px bg-border mb-10" />

        {/* Verity Pass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-10"
        >
          <div className="rounded-xl border border-gold/25 bg-card p-6 shadow-[0_0_60px_rgba(212,175,55,0.04)]">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-foreground">Verity Pass</h2>
                <p className="text-xs text-muted/60">The complete experience</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {passPerks.map((perk) => (
                <div key={perk.text} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{perk.text}</p>
                </div>
              ))}
            </div>

            {!isPassHolder && (
              <div className="flex items-center gap-2 mb-5 bg-surface/40 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 py-2 rounded-md text-xs transition-all duration-300 ${
                    billingCycle === "monthly"
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted"
                  }`}
                >
                  Monthly · $12.90
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`flex-1 py-2 rounded-md text-xs transition-all duration-300 relative ${
                    billingCycle === "annual"
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted"
                  }`}
                >
                  Annual · $99
                  <span className="ml-1 text-[9px] text-gold">Save 36%</span>
                </button>
              </div>
            )}

            {isPassHolder ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Check className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gold font-medium">Active member</span>
                </div>
                <button
                  disabled={loadingPriceId === "manage"}
                  onClick={handleManageSubscription}
                  className="w-full ghost-pill flex items-center justify-center gap-2"
                >
                  {loadingPriceId === "manage" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Manage subscription
                </button>
              </div>
            ) : (
              <button
                disabled={!!loadingPriceId}
                onClick={() =>
                  handleCheckout(
                    billingCycle === "monthly" ? "price_1T6rZjC1O032lUHcZiPWdPg7" : "price_1T6rawC1O032lUHcywgSq3ft"
                  )
                }
                className="w-full py-3 rounded-xl bg-gold text-background font-medium hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingPriceId?.startsWith("price_") ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Subscribe to Verity Pass
              </button>
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-muted/35 mb-6 leading-relaxed"
        >
          All purchases are processed securely via Stripe.
          <br />
          Subscriptions can be cancelled at any time.
        </motion.p>
      </main>
    </div>
  );
}
