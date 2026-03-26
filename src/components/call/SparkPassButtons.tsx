'use client';

"use client";

import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface SparkPassButtonsProps {
  onChoice: (choice: "spark" | "pass") => void;
  elapsed: number;
}

export default function SparkPassButtons({ onChoice, elapsed }: SparkPassButtonsProps) {
  const passDisabled = elapsed < 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-center font-serif text-lg text-foreground mb-2">
        Time&apos;s up.
      </p>
      <p className="text-center text-sm text-muted mb-6">
        Did you feel a spark?
      </p>

      <div className="flex items-center justify-center gap-5">
        <button
          disabled={passDisabled}
          onClick={() => onChoice("pass")}
          className="min-w-[130px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-muted hover:text-foreground hover:border-foreground/30 disabled:opacity-40 transition-all"
        >
          <X className="w-4 h-4" />
          Pass
        </button>
        <button
          onClick={() => onChoice("spark")}
          className="min-w-[130px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold text-background font-medium hover:bg-gold-light transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Spark
        </button>
      </div>

      <p className="text-center text-[11px] text-muted/45 mt-4">
        Your choice is completely private. Only mutual sparks are ever revealed.
      </p>
    </motion.div>
  );
}
