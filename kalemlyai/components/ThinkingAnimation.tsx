"use client";

import { useEffect, useState } from "react";
import { Search, Database, Sparkles, FileText, CheckCircle2 } from "lucide-react";

interface ThinkingAnimationProps {
  hasContext?: boolean;
  themeMode?: "dark" | "light";
  primaryColor?: string;
}

export default function ThinkingAnimation({
  hasContext = true,
  themeMode = "dark",
  primaryColor = "#253745",
}: ThinkingAnimationProps) {
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
  const isLight = themeMode === "light";

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-2xl border shadow-md max-w-sm transition-colors ${
        isLight
          ? "bg-slate-100 border-slate-200"
          : "bg-[#11212d] border-[#253745]"
      }`}
    >
      {/* Orb + Waveform */}
      <div className="flex items-center gap-4">
        {/* Animated Glowing Orb */}
        <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
          <div
            className="absolute w-8 h-8 rounded-full animate-pulse-orb opacity-40"
            style={{ backgroundColor: primaryColor }}
          />
          <CurrentIcon
            className={`w-5 h-5 z-10 animate-bounce ${isLight ? "text-slate-700" : "text-[#ccd0cf]"}`}
          />
        </div>

        {/* Dynamic Waveform Bars — tinted with primaryColor */}
        <div className="flex items-center gap-1.5 h-6">
          <div
            className="w-1 rounded-full wave-bar-1"
            style={{ backgroundColor: primaryColor, opacity: 1 }}
          />
          <div
            className="w-1 rounded-full wave-bar-2"
            style={{ backgroundColor: primaryColor, opacity: 0.8 }}
          />
          <div
            className="w-1 rounded-full wave-bar-3"
            style={{ backgroundColor: primaryColor, opacity: 0.55 }}
          />
          <div
            className="w-1 rounded-full wave-bar-4"
            style={{ backgroundColor: primaryColor, opacity: 0.35 }}
          />
        </div>
      </div>

      {/* Status text */}
      <div
        className={`flex items-center justify-between text-xs font-medium pt-2 border-t ${
          isLight ? "border-slate-200 text-slate-500" : "border-[#253745] text-[#9ba8ab]"
        }`}
      >
        <span
          className={`flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-[#ccd0cf]"}`}
        >
          <CurrentIcon
            className={`w-3.5 h-3.5 animate-spin ${isLight ? "text-slate-500" : "text-[#9ba8ab]"}`}
          />
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
