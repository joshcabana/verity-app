"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface MutualSparkRevealProps {
  onContinue: () => void;
}

export default function MutualSparkReveal({ onContinue }: MutualSparkRevealProps) {
  return (
    <motion.div
      key="mutual-spark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center gap-8 px-6"
    >
      {/* Animated spark icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-gold" />
        </div>
        {/* Glow rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1 + ring * 0.4, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: ring * 0.3 }}
            className="absolute inset-0 rounded-full border border-gold/20"
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <h2 className="font-serif text-3xl text-foreground mb-3">
          It&apos;s mutual.
        </h2>
        <p className="text-muted max-w-sm">
          You both chose Spark. Identities will be revealed once you continue.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <button
          onClick={onContinue}
          className="px-8 py-3 rounded-xl bg-gold text-background font-medium hover:bg-gold-light transition-all"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
