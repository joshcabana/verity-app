"use client";

import { motion } from "framer-motion";
import type { RefObject } from "react";

interface VideoAreaProps {
  localVideoRef: RefObject<HTMLDivElement | null>;
  remoteVideoRef: RefObject<HTMLDivElement | null>;
  isRemoteConnected: boolean;
}

export default function VideoArea({ localVideoRef, remoteVideoRef, isRemoteConnected }: VideoAreaProps) {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      {/* Remote video (full screen) */}
      <div
        ref={remoteVideoRef}
        className="absolute inset-0 bg-surface/20"
      />

      {/* Placeholder when remote not connected */}
      {!isRemoteConnected && (
        <div className="relative z-10">
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-surface/40 border border-border/50 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface/60 border border-border/30" />
          </div>
          {[1, 2].map((ring) => (
            <motion.div
              key={ring}
              animate={{ scale: [1, 1.25 + ring * 0.15], opacity: [0.15, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: ring * 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-gold/15"
            />
          ))}
        </div>
      )}

      {/* Local video PiP (bottom-right) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-5 right-5 w-24 h-32 sm:w-28 sm:h-36 rounded-xl border border-border/40 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] z-20"
      >
        <div ref={localVideoRef} className="absolute inset-0 bg-surface/50" />
      </motion.div>
    </div>
  );
}
