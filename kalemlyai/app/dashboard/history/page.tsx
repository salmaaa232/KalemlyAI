"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchWithAuth } from "@/lib/auth";
import {
  MessageSquare, Bot, ShieldAlert, Filter, Clock,
  Loader2, ArrowLeft, Search, ChevronRight, X, User,
  Sparkles, AlertTriangle, MessageCircle, BarChart2, CheckCircle2
} from "lucide-react";

interface Chatbot {
  id: string;
  chatbot_name: string;
  company_name: string;
}

interface MessageItem {
  id: string;
  sender: "user" | "bot";
  content: string;
  category?: string;
  confidence?: number;
  need_escalation?: number;
  created_at: string;
}

interface ConversationItem {
  id: string;
  chatbot_id: string;
  session_id: string;
  title: string;
  summary: string;
  category: string;
  total_messages: number;
  confidence: number;
  need_escalation: number;
  started_at: string;
  updated_at: string;
  messages?: MessageItem[];
}

interface ChatbotStats {
  total_conversations: number;
  today_conversations: number;
  refund_requests: number;
  complaints: number;
  human_escalations: number;
  most_asked_category: string;
  avg_messages: number;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  refund: { label: "Refund", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  complaint: { label: "Complaint", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  technical_support: { label: "Technical Support", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  order_info: { label: "Order Info", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  product_inquiry: { label: "Product Inquiry", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  human_support: { label: "Human Escalation", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  general: { label: "General Questions", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
};

function formatTime(iso: string) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffD = Math.floor(diffMs / 86400000);
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffD === 0) return `Today, ${timeStr}`;
  if (diffD === 1) return `Yesterday, ${timeStr}`;
  return `${d.toLocaleDateString()} ${timeStr}`;
}

export default function ChatHistoryPage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConvos, setIsLoadingConvos] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected Conversation for detail modal
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    async function loadBots() {
      try {
        const res = await fetchWithAuth("/api/users/me/chatbots");
        if (res.ok) {
          const data = await res.json();
          const botsList = data.chatbots || [];
          setBots(botsList);
          if (botsList.length > 0) {
            setSelectedBot(botsList[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load chatbots", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadBots();
  }, []);

  useEffect(() => {
    if (!selectedBot) return;
    async function loadConversations() {
      setIsLoadingConvos(true);
      try {
        const catParam = filterCategory !== "all" ? `&category=${filterCategory}` : "";
        const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : "";
        const res = await fetchWithAuth(`/api/chatbots/${selectedBot}/conversations?limit=100${catParam}${searchParam}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
          setStats(data.stats || null);
        }
      } catch (e) {
        console.error("Failed to load conversations", e);
      } finally {
        setIsLoadingConvos(false);
      }
    }
    loadConversations();
  }, [selectedBot, filterCategory, searchQuery]);

  const handleOpenConversation = async (convId: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetchWithAuth(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConversation(data);
      }
    } catch (e) {
      console.error("Failed to load conversation details", e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#06141b] text-[#ccd0cf]">
        {/* Header */}
        <div className="border-b border-[#253745] bg-[#11212d] px-6 py-6 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-[#ccd0cf] flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[#9ba8ab]" />
                  Conversation Analytics & History
                </h1>
                <p className="text-xs text-[#9ba8ab] mt-0.5">Analyze customer conversations, topic breakdown, and escalation metrics</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#ccd0cf]" />
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-24 text-[#9ba8ab] text-sm bg-[#11212d] rounded-3xl border border-[#253745]">
              No chatbots found. Create one to start recording conversations.
            </div>
          ) : (
            <>
              {/* Bot Selector Bar */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-[#9ba8ab] shrink-0">Chatbot:</span>
                {bots.map((bot) => (
                  <button
                    key={bot.id}
                    onClick={() => setSelectedBot(bot.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      selectedBot === bot.id
                        ? "bg-[#253745] text-[#ccd0cf] border border-[#4a5c6a] shadow-xs"
                        : "bg-[#11212d] border border-[#253745] text-[#9ba8ab] hover:text-[#ccd0cf] hover:bg-[#253745]"
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{bot.chatbot_name}</span>
                  </button>
                ))}
              </div>

              {/* CONVERSATION ANALYTICAL STATS HEADER */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Total Conversations", value: stats?.total_conversations ?? 0, icon: MessageCircle },
                  { label: "Today's Conversations", value: stats?.today_conversations ?? 0, icon: Clock },
                  { label: "Refund Requests", value: stats?.refund_requests ?? 0, icon: Filter },
                  { label: "Complaints", value: stats?.complaints ?? 0, icon: AlertTriangle },
                  { label: "Human Escalations", value: stats?.human_escalations ?? 0, icon: ShieldAlert },
                  { label: "Most Asked Topic", value: stats?.most_asked_category ?? "General", icon: BarChart2, isText: true },
                ].map((s) => (
                  <div key={s.label} className="bg-[#11212d] border border-[#253745] rounded-2xl p-4 shadow-xs">
                    <s.icon className="w-4 h-4 text-[#9ba8ab] mb-2" />
                    <p className={`font-bold text-[#ccd0cf] ${s.isText ? "text-sm truncate" : "text-xl"}`}>{s.value}</p>
                    <p className="text-[10px] text-[#9ba8ab] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* FILTERS & SEARCH */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#11212d] border border-[#253745] p-4 rounded-2xl shadow-xs">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5c6a]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles or summaries..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                  {[
                    { id: "all", label: "All" },
                    { id: "refund", label: "Refunds" },
                    { id: "complaint", label: "Complaints" },
                    { id: "technical_support", label: "Technical" },
                    { id: "product_inquiry", label: "Product" },
                    { id: "escalated", label: "Escalated" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterCategory(tab.id)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                        filterCategory === tab.id
                          ? "bg-[#253745] text-[#ccd0cf] border-[#4a5c6a]"
                          : "bg-[#06141b] border-[#253745] text-[#9ba8ab] hover:text-[#ccd0cf] hover:bg-[#253745]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CONVERSATION CARDS FEED */}
              {isLoadingConvos ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ccd0cf]" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-20 text-[#9ba8ab] text-sm bg-[#11212d] border border-[#253745] rounded-2xl">
                  {searchQuery || filterCategory !== "all"
                    ? "No conversations match the selected filter."
                    : "No customer conversations recorded yet for this chatbot."}
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => {
                    const catBadge = CATEGORY_LABELS[conv.category] || CATEGORY_LABELS.general;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleOpenConversation(conv.id)}
                        className="bg-[#11212d] border border-[#253745] hover:border-[#4a5c6a] rounded-2xl p-5 cursor-pointer transition-all hover:bg-[#253745]/40 group shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${catBadge.color}`}>
                              {catBadge.label}
                            </span>
                            {conv.need_escalation === 1 ? (
                              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-rose-500/20 text-rose-300 border-rose-500/30 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-400" /> Escalated to Human Support
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resolved
                              </span>
                            )}
                            <span className="text-[11px] text-[#9ba8ab]">· {conv.total_messages} Messages</span>
                          </div>

                          <span className="text-[11px] text-[#9ba8ab] shrink-0 font-mono">
                            {formatTime(conv.updated_at || conv.started_at)}
                          </span>
                        </div>

                        {/* Title & AI Summary */}
                        <h3 className="text-sm font-bold text-[#ccd0cf] group-hover:text-white transition-colors mb-1">
                          {conv.title || "Customer Support Conversation"}
                        </h3>
                        <p className="text-xs text-[#9ba8ab] line-clamp-2 leading-relaxed">
                          {conv.summary || "Customer initiated a support request."}
                        </p>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#253745] text-[11px] text-[#ccd0cf] font-medium">
                          <span>View Full Transcript & Confidence Analytics</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* CONVERSATION DETAIL VIEW MODAL */}
        {(activeConversation || isLoadingDetail) && (
          <div className="fixed inset-0 z-50 bg-[#06141b]/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#11212d] border border-[#253745] w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
              {isLoadingDetail ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ccd0cf]" />
                  <p className="text-xs text-[#9ba8ab]">Loading conversation transcript...</p>
                </div>
              ) : activeConversation && (
                <>
                  {/* Modal Header */}
                  <div className="px-6 py-5 border-b border-[#253745] bg-[#06141b] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[#ccd0cf] font-bold">#{activeConversation.id}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_LABELS[activeConversation.category]?.color || CATEGORY_LABELS.general.color}`}>
                          {CATEGORY_LABELS[activeConversation.category]?.label || activeConversation.category}
                        </span>
                        {activeConversation.need_escalation === 1 ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-500/20 text-rose-300 border-rose-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" /> Escalated
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resolved
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-[#ccd0cf]">{activeConversation.title}</h2>
                    </div>

                    <button
                      onClick={() => setActiveConversation(null)}
                      className="p-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Conversation Stats Summary Header */}
                  <div className="px-6 py-3 bg-[#06141b]/60 border-b border-[#253745] grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#9ba8ab] block">Started</span>
                      <span className="text-[#ccd0cf] font-medium">{formatTime(activeConversation.started_at)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9ba8ab] block">Total Turns</span>
                      <span className="text-[#ccd0cf] font-medium">{activeConversation.total_messages} Messages</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9ba8ab] block">RAG Confidence</span>
                      <span className="text-emerald-400 font-semibold">{activeConversation.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9ba8ab] block">Status</span>
                      <span className={activeConversation.need_escalation === 1 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        {activeConversation.need_escalation === 1 ? "Escalated" : "Resolved"}
                      </span>
                    </div>
                  </div>

                  {/* AI Generated Summary Card */}
                  <div className="mx-6 mt-4 p-4 rounded-2xl bg-[#253745]/50 border border-[#4a5c6a] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[#ccd0cf] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#ccd0cf]" /> AI Conversation Summary
                    </div>
                    <p className="text-[#9ba8ab] leading-relaxed">
                      {activeConversation.summary}
                    </p>
                  </div>

                  {/* Full Messages Transcript */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {activeConversation.messages && activeConversation.messages.length > 0 ? (
                      activeConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`flex items-start gap-2.5 max-w-[85%] ${
                              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                                msg.sender === "user"
                                  ? "bg-[#4a5c6a] text-[#ccd0cf]"
                                  : "bg-[#253745] text-[#9ba8ab]"
                              }`}
                            >
                              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>

                            <div
                              className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                                msg.sender === "user"
                                  ? "bg-[#253745] text-[#ccd0cf] border-[#4a5c6a] rounded-tr-none"
                                  : "bg-[#06141b] text-[#ccd0cf] border-[#253745] rounded-tl-none"
                              }`}
                            >
                              <div className={`text-[10px] mb-1 font-semibold ${msg.sender === "user" ? "text-[#9ba8ab]" : "text-[#4a5c6a]"}`}>
                                {msg.sender === "user" ? "Customer" : "AI Assistant"}
                              </div>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-[#9ba8ab] py-8">No messages recorded in this conversation.</p>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-[#06141b] border-t border-[#253745] flex justify-end">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="px-5 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] text-xs font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
