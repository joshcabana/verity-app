"use client";

import { motion } from "framer-motion";

interface CallCountdownProps {
  seconds: number;
  total: number;
}

export default function CallCountdown({ seconds, total }: CallCountdownProps) {
  const pct = seconds / total;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  // Colour transitions: gold → amber → red
  const strokeColour =
    seconds <= 5
      ? "hsl(0, 62%, 50%)"
      : seconds <= 15
        ? "hsl(30, 80%, 55%)"
        : "#D4AF37";

  const textColour =
    seconds <= 5
      ? "text-red-500"
      : seconds <= 15
        ? "text-amber-400"
        : "text-gold";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="#262626"
            strokeWidth="2.5"
          />
          <motion.circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={strokeColour}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={seconds}
            initial={{ scale: 1.15, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`font-serif text-2xl tabular-nums ${textColour}`}
          >
            {seconds}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
