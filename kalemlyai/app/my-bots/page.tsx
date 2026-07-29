"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchWithAuth } from "@/lib/auth";
import {
  Bot, Plus, ExternalLink, Trash2, Calendar,
  Building2, Loader2, Copy, Check
} from "lucide-react";

interface ChatbotCard {
  id: string;
  company_name: string;
  chatbot_name: string;
  doc_count: number;
  created_at: string;
  support_email: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export default function MyBotsPage() {
  const [bots, setBots] = useState<ChatbotCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadBots() {
    try {
      const res = await fetchWithAuth("/api/users/me/chatbots");
      if (res.ok) {
        const data = await res.json();
        setBots(data.chatbots || []);
      }
    } catch (e) {
      console.error("Failed to load bots", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadBots(); }, []);

  const handleCopyLink = (botId: string) => {
    const link = `${window.location.origin}/chat/${botId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(botId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (botId: string) => {
    if (!confirm("Are you sure you want to delete this chatbot? This action cannot be undone.")) return;
    setDeletingId(botId);
    try {
      const res = await fetchWithAuth(`/api/chatbots/${botId}`, { method: "DELETE" });
      if (res.ok) {
        setBots((prev) => prev.filter((b) => b.id !== botId));
      } else {
        alert("Failed to delete chatbot.");
      }
    } catch (e) {
      alert("Error deleting chatbot.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#06141b] text-[#ccd0cf]">
        {/* Header */}
        <div className="border-b border-[#253745] bg-[#11212d] px-6 py-6 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[#ccd0cf] flex items-center gap-2">
                <Bot className="w-6 h-6 text-[#ccd0cf]" />
                My Bots
              </h1>
              <p className="text-xs text-[#9ba8ab] mt-0.5">
                {bots.length} active chatbot{bots.length !== 1 ? "s" : ""} in your workspace
              </p>
            </div>
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] font-semibold text-xs border border-[#4a5c6a] transition-all"
            >
              <Plus className="w-4 h-4" /> New Chatbot
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#ccd0cf]" />
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-24 space-y-4 bg-[#11212d] rounded-3xl border border-[#253745] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#253745] flex items-center justify-center mx-auto text-[#ccd0cf]">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#ccd0cf]">No chatbots yet</h2>
              <p className="text-[#9ba8ab] text-xs max-w-sm mx-auto">
                Create your first AI customer support assistant. Upload company documents and go live in minutes.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] font-bold text-xs border border-[#4a5c6a] transition-all mt-2"
              >
                <Plus className="w-4 h-4" /> Build Your First Bot
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="bg-[#11212d] border border-[#253745] rounded-3xl p-6 hover:border-[#4a5c6a] transition-all group shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Bot Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#253745] border border-[#4a5c6a] flex items-center justify-center">
                        <Bot className="w-6 h-6 text-[#ccd0cf]" />
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#253745] text-[#ccd0cf] border border-[#4a5c6a] font-medium">
                        Active RAG
                      </span>
                    </div>

                    {/* Bot Info */}
                    <h3 className="text-base font-bold text-[#ccd0cf] mb-1 group-hover:text-white transition-colors">
                      {bot.chatbot_name}
                    </h3>
                    <p className="text-xs text-[#9ba8ab] flex items-center gap-1.5 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-[#4a5c6a]" /> {bot.company_name}
                    </p>
                    <p className="text-xs text-[#4a5c6a] flex items-center gap-1.5 mb-4">
                      <Calendar className="w-3.5 h-3.5" /> Created {timeAgo(bot.created_at)}
                      <span className="mx-1">·</span>
                      {bot.doc_count} Knowledge Chunks
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-[#253745] flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/chat/${bot.id}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Test Chat
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyLink(bot.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] font-medium transition-colors"
                        title="Copy Public Chat Link"
                      >
                        {copiedId === bot.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#9ba8ab]" /> Share Link
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(bot.id)}
                        disabled={deletingId === bot.id}
                        className="p-2 rounded-xl text-[#9ba8ab] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Chatbot"
                      >
                        {deletingId === bot.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
