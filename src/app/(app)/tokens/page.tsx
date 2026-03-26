"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { Coins, Sparkles, Zap, Gift } from "lucide-react";

const packages = [
  {
    id: "starter",
    name: "Starter",
    tokens: 10,
    price: "$4.99",
    icon: Sparkles,
    popular: false,
  },
  {
    id: "popular",
    name: "Popular",
    tokens: 30,
    price: "$9.99",
    icon: Zap,
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    tokens: 100,
    price: "$24.99",
    icon: Gift,
    popular: false,
  },
];

export default function TokensPage() {
  const { profile } = useAuth();

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-6">
        <p className="label-caps mb-1">Token</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Shop
        </h1>
      </div>

      {/* Balance card */}
      <div className="bg-card border border-gold/20 rounded-xl p-6 mb-6 text-center">
        <Coins className="w-10 h-10 text-gold mx-auto mb-3" />
        <p className="label-caps mb-1">Current Balance</p>
        <p className="font-serif text-3xl font-semibold text-gold">
          {profile?.token_balance ?? 0}
        </p>
        <p className="text-muted text-xs mt-1">tokens</p>
      </div>

      {/* Packages */}
      <p className="label-caps mb-3">Top Up</p>
      <div className="space-y-3">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            className={`w-full bg-card border rounded-xl p-5 flex items-center gap-4 hover:border-gold/40 transition-colors text-left ${
              pkg.popular ? "border-gold/30" : "border-border"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <pkg.icon className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-foreground font-medium">{pkg.name}</h3>
                {pkg.popular && (
                  <span className="bg-gold/10 text-gold text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}
              </div>
              <p className="text-muted text-sm mt-0.5">
                {pkg.tokens} tokens
              </p>
            </div>
            <p className="text-gold font-medium">{pkg.price}</p>
          </button>
        ))}
      </div>

      {/* Info */}
      <p className="text-muted/60 text-xs text-center mt-6">
        Tokens are used to enter drops and unlock premium features. Payments are
        processed securely via Stripe.
      </p>
    </div>
  );
}
