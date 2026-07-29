import { Bot, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#253745] bg-[#11212d] py-10 px-6 mt-16 text-[#9ba8ab]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#253745] border border-[#4a5c6a] flex items-center justify-center text-[#ccd0cf]">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#ccd0cf]">KalemlyAI</span> — Intelligent AI Support Assistant Builder
        </div>
        <p className="flex items-center gap-1 text-[#9ba8ab]">
          Built with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> using LangChain, Groq API, ChromaDB & Next.js
        </p>
        <p className="text-[#4a5c6a]">© 2026 KalemlyAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
