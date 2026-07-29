"use client";

import { useEffect, useState } from "react";
import { Search, Database, Sparkles, FileText, CheckCircle2 } from "lucide-react";

interface ThinkingAnimationProps {
  hasContext?: boolean;
}

export default function ThinkingAnimation({ hasContext = true }: ThinkingAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: "Understanding your question...", icon: Sparkles },
    { text: "Searching company knowledge base...", icon: Search },
    { text: "Retrieving relevant document chunks...", icon: Database },
    { text: "Generating response with Groq LLM...", icon: FileText },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    return () => clearInterval(timer);
  }, [steps.length]);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#11212d] border border-[#253745] shadow-md max-w-sm">
      {/* Waveform and Glowing Orb */}
      <div className="flex items-center gap-4">
        {/* Animated Glowing Orb */}
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute w-8 h-8 rounded-full bg-[#253745] animate-pulse-orb" />
          <CurrentIcon className="w-5 h-5 text-[#ccd0cf] z-10 animate-bounce" />
        </div>

        {/* Dynamic Waveform Audio Bars (Matching Custom Palette) */}
        <div className="flex items-center gap-1.5 h-6">
          <div className="w-1 bg-[#ccd0cf] rounded-full wave-bar-1" />
          <div className="w-1 bg-[#9ba8ab] rounded-full wave-bar-2" />
          <div className="w-1 bg-[#4a5c6a] rounded-full wave-bar-3" />
          <div className="w-1 bg-[#253745] rounded-full wave-bar-4" />
        </div>
      </div>

      {/* RAG Retrieval Status Badge */}
      <div className="flex items-center justify-between text-xs text-[#9ba8ab] font-medium pt-2 border-t border-[#253745]">
        <span className="flex items-center gap-1.5 text-[#ccd0cf]">
          <CurrentIcon className="w-3.5 h-3.5 text-[#9ba8ab] animate-spin" />
          {steps[stepIndex].text}
        </span>
        {stepIndex >= 2 && (
          <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-500/30 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Match Found
          </span>
        )}
      </div>
    </div>
  );
}
