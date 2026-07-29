"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/auth";
import {
  Bot, ShieldAlert, Zap, Plus, ArrowRight,
  TrendingUp, Clock, BarChart3, Loader2, MessageCircle
} from "lucide-react";

interface Stats {
  total_bots: number;
  total_conversations: number;
  total_escalations: number;
  active_today: number;
  avg_messages_per_conversation?: number;
  most_asked_category?: string;
  recent_chats: {
    id: string;
    title?: string;
    summary?: string;
    user_message?: string;
    bot_response?: string;
    category: string;
    confidence: number;
    need_escalation: number;
    total_messages?: number;
    updated_at?: string;
    created_at?: string;
    chatbot_name: string;
    company_name: string;
  }[];
}

function categoryBadge(cat: string) {
  return "bg-[#253745] text-[#ccd0cf] border border-[#4a5c6a]";
}

function timeAgo(isoString?: string) {
  if (!isoString) return "recently";
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth("/api/users/me/stats");
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#06141b] text-[#ccd0cf]">
        {/* Header */}
        <div className="border-b border-[#253745] bg-[#11212d] px-6 py-6 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[#ccd0cf] flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#9ba8ab]" />
                Dashboard Overview
              </h1>
              <p className="text-xs text-[#9ba8ab] mt-0.5">
                Welcome back, <span className="text-[#ccd0cf] font-bold">{user?.full_name}</span>
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

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#ccd0cf]" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Chatbots", value: stats?.total_bots ?? 0, icon: Bot },
                  { label: "Total Conversations", value: stats?.total_conversations ?? 0, icon: MessageCircle },
                  { label: "Human Escalations", value: stats?.total_escalations ?? 0, icon: ShieldAlert },
                  { label: "Active Today", value: stats?.active_today ?? 0, icon: Zap },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#11212d] border border-[#253745] rounded-2xl p-5 shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#253745] border border-[#4a5c6a] flex items-center justify-center mb-4 text-[#ccd0cf]">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-extrabold text-[#ccd0cf]">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-[#9ba8ab] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Analytics Sub-bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#11212d] border border-[#253745] p-5 rounded-2xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-[#9ba8ab]">Average Messages / Conversation</span>
                    <p className="text-xl font-extrabold text-[#ccd0cf] mt-0.5">{stats?.avg_messages_per_conversation ?? 0} Messages</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-[#4a5c6a]" />
                </div>

                <div className="bg-[#11212d] border border-[#253745] p-5 rounded-2xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-[#9ba8ab]">Most Asked Category</span>
                    <p className="text-xl font-extrabold text-[#ccd0cf] mt-0.5">{stats?.most_asked_category || "General Inquiry"}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#4a5c6a]" />
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/my-bots" className="group p-5 bg-[#11212d] border border-[#253745] rounded-2xl hover:border-[#4a5c6a] transition-all shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#ccd0cf]">My Bots</p>
                      <p className="text-xs text-[#9ba8ab] mt-1">Manage & share your chatbots</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#ccd0cf] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/create" className="group p-5 bg-[#11212d] border border-[#253745] rounded-2xl hover:border-[#4a5c6a] transition-all shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#ccd0cf]">Create Chatbot</p>
                      <p className="text-xs text-[#9ba8ab] mt-1">Build a new AI assistant</p>
                    </div>
                    <Plus className="w-5 h-5 text-[#ccd0cf] group-hover:rotate-90 transition-transform" />
                  </div>
                </Link>

                <Link href="/dashboard/history" className="group p-5 bg-[#11212d] border border-[#253745] rounded-2xl hover:border-[#4a5c6a] transition-all shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#ccd0cf]">Conversation History</p>
                      <p className="text-xs text-[#9ba8ab] mt-1">Review complete customer sessions</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#ccd0cf] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Recent Conversations Feed */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#ccd0cf] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#9ba8ab]" /> Recent Conversations
                  </h2>
                  <Link href="/dashboard/history" className="text-xs text-[#ccd0cf] hover:text-white font-medium transition-colors flex items-center gap-1">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {!stats?.recent_chats?.length ? (
                  <div className="py-12 text-center text-[#9ba8ab] text-sm bg-[#11212d] border border-[#253745] rounded-2xl">
                    No conversations recorded yet. Share your chatbot link to start receiving conversations!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recent_chats.map((chat) => (
                      <Link
                        key={chat.id}
                        href="/dashboard/history"
                        className="block bg-[#11212d] border border-[#253745] rounded-2xl p-4 hover:border-[#4a5c6a] transition-all group shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryBadge(chat.category)}`}>
                              {chat.category.replace("_", " ")}
                            </span>
                            {chat.need_escalation === 1 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Escalated
                              </span>
                            )}
                            <span className="text-[11px] text-[#9ba8ab]">{chat.chatbot_name} · {chat.company_name}</span>
                            {chat.total_messages && (
                              <span className="text-[11px] text-[#4a5c6a]">· {chat.total_messages} Messages</span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#9ba8ab] shrink-0 font-mono">
                            {timeAgo(chat.updated_at || chat.created_at)}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-[#ccd0cf] group-hover:text-white transition-colors mb-1">
                          {chat.title || "Customer Support Conversation"}
                        </h3>
                        <p className="text-xs text-[#9ba8ab] line-clamp-1">
                          {chat.summary || chat.user_message || "Customer initiated a support request."}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
