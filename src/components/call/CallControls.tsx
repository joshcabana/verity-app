'use client';

"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface CallControlsProps {
  micOn: boolean;
  cameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
}

export default function CallControls({ micOn, cameraOn, onToggleMic, onToggleCamera }: CallControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-3"
    >
      <button
        onClick={onToggleMic}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
          micOn
            ? "bg-surface text-gold hover:bg-card"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        }`}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
      >
        {micOn ? <Mic className="w-[18px] h-[18px]" /> : <MicOff className="w-[18px] h-[18px]" />}
      </button>
      <button
        onClick={onToggleCamera}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
          cameraOn
            ? "bg-surface text-gold hover:bg-card"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        }`}
        aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
      >
        {cameraOn ? <Video className="w-[18px] h-[18px]" /> : <VideoOff className="w-[18px] h-[18px]" />}
      </button>
    </motion.div>
  );
}
