"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/utils";
import {
  Bot, Plus, ExternalLink, Trash2, Calendar,
  Building2, Loader2, Copy, Check, Code2, X, Link2, Edit
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

function EmbedModal({ bot, onClose }: { bot: ChatbotCard; onClose: () => void }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const publicLink = `${window.location.origin}/chat/${bot.id}`;
  const embedCode = `<script src="${API_BASE_URL}/api/chatbots/${bot.id}/widget.js"></script>\n<KalemlyAI chatbot-id="${bot.id}" />`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#11212d] border border-[#253745] rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#253745] border border-[#4a5c6a]">
              <Code2 className="w-4 h-4 text-[#ccd0cf]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#ccd0cf]">Embed & Share — {bot.chatbot_name}</h3>
              <p className="text-xs text-[#9ba8ab]">{bot.company_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ba8ab] hover:text-[#ccd0cf] hover:bg-[#253745] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Public Chat Link */}
          <div className="p-4 rounded-2xl bg-[#06141b] border border-[#253745] space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#ccd0cf]">
              <Link2 className="w-3.5 h-3.5 text-[#9ba8ab]" /> Public Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={publicLink}
                className="flex-1 px-3 py-2 rounded-xl bg-[#11212d] border border-[#253745] text-xs text-[#ccd0cf] font-mono focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] text-xs font-medium shrink-0 transition-colors border border-[#4a5c6a]"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied!" : "Copy"}
              </button>
              <a
                href={publicLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* HTML Embed Snippet */}
          <div className="p-4 rounded-2xl bg-[#06141b] border border-[#253745] space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#ccd0cf]">
              <Code2 className="w-3.5 h-3.5 text-[#9ba8ab]" /> Website HTML Embed Script
            </label>
            <textarea
              readOnly
              rows={3}
              value={embedCode}
              className="w-full px-3 py-2 rounded-xl bg-[#11212d] border border-[#253745] text-xs text-[#ccd0cf] font-mono focus:outline-none resize-none"
            />
            <button
              onClick={copyEmbed}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] text-xs font-medium border border-[#4a5c6a] transition-colors"
            >
              {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedEmbed ? "Embed Script Copied!" : "Copy Embed Script"}
            </button>
          </div>

          <p className="text-[10px] text-[#4a5c6a] text-center">
            Paste the embed script anywhere in your website's HTML to add the floating chat widget.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MyBotsPage() {
  const [bots, setBots] = useState<ChatbotCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [embedBot, setEmbedBot] = useState<ChatbotCard | null>(null);

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
                  <div className="pt-4 border-t border-[#253745] space-y-2">
                    {/* Row 1: Test + Embed */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/chat/${bot.id}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] font-medium text-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Test Chat
                      </Link>
                      <button
                        onClick={() => setEmbedBot(bot)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] font-medium text-xs transition-colors border border-[#4a5c6a]"
                      >
                        <Code2 className="w-3.5 h-3.5" /> Embed Code
                      </button>
                    </div>
                    {/* Row 2: Edit + Delete */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/my-bots/${bot.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#06141b] hover:bg-[#253745] text-[#9ba8ab] hover:text-[#ccd0cf] font-medium text-xs transition-colors border border-[#253745]"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit & Customize
                      </Link>
                      <button
                        onClick={() => handleDelete(bot.id)}
                        disabled={deletingId === bot.id}
                        className="p-2 rounded-xl text-[#9ba8ab] hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-[#253745]"
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

      {/* Embed Code Modal */}
      {embedBot && <EmbedModal bot={embedBot} onClose={() => setEmbedBot(null)} />}
    </ProtectedRoute>
  );
}
