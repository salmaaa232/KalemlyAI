"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldCheck,
  Building2,
  Loader2,
} from "lucide-react";
import ThinkingAnimation from "@/components/ThinkingAnimation";
import EscalationCard from "@/components/EscalationCard";
import { API_BASE_URL } from "@/lib/utils";

interface ChatbotConfig {
  id: string;
  company_name: string;
  chatbot_name: string;
  business_description: string;
  support_info: {
    support_email: string;
    support_phone: string;
    whatsapp_number?: string;
    working_hours: string;
  };
  theme_mode?: "dark" | "light";
  primary_color?: string;
  welcome_message?: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  confidence?: number;
  needHumanSupport?: boolean;
  category?: string;
  supportInfo?: any;
}

export default function PublicChatPage() {
  const params = useParams();
  const chatbotId = (params?.id as string) || "";

  const [botConfig, setBotConfig] = useState<ChatbotConfig | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && chatbotId) {
      const key = `kalemly_session_${chatbotId}`;
      let saved = localStorage.getItem(key);
      if (!saved) {
        saved = "session_" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem(key, saved);
      }
      setSessionId(saved);
    }
  }, [chatbotId]);

  useEffect(() => {
    async function fetchBotInfo() {
      let loadedConfig: ChatbotConfig | null = null;
      try {
        const res = await fetch(`${API_BASE_URL}/api/chatbots/${chatbotId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          loadedConfig = await res.json();
        }
      } catch (err) {
        console.warn("Backend API offline or unreachable.");
      }

      if (loadedConfig) {
        setBotConfig(loadedConfig);
        const welcome = loadedConfig.welcome_message || `Hello! Welcome to ${loadedConfig.company_name}. How can I assist you today?`;
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: welcome,
          },
        ]);
      } else {
        setBotConfig({
          id: chatbotId,
          company_name: "Customer Support",
          chatbot_name: "AI Support Assistant",
          business_description: "Customer Care",
          support_info: {
            support_email: "support@company.com",
            support_phone: "+1 (800) 555-0199",
            working_hours: "Mon-Fri 9AM - 6PM",
          },
          theme_mode: "dark",
          primary_color: "#253745",
          welcome_message: "Hello! Welcome to customer support. How can I assist you today?",
        });
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: "Hello! Welcome to customer support. How can I assist you today?",
          },
        ]);
      }

      setInitialLoading(false);
    }

    if (chatbotId) {
      fetchBotInfo();
    } else {
      setInitialLoading(false);
    }
  }, [chatbotId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isThinking) return;

    const currentSessionId = sessionId || `session_${chatbotId}_${Date.now()}`;
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbots/${chatbotId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: currentSessionId, message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: data.answer,
            confidence: data.confidence,
            needHumanSupport: data.need_human_support,
            category: data.category,
            supportInfo: data.support_info,
          },
        ]);
        setIsThinking(false);
        return;
      }
    } catch (err) {
      console.warn("Backend connection failed:", err);
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "I couldn't reach the AI backend server. Please make sure the backend server is running.",
          needHumanSupport: true,
          supportInfo: botConfig?.support_info,
        },
      ]);
      setIsThinking(false);
    }, 1000);
  };

  const isLight = botConfig?.theme_mode === "light";
  const primary = botConfig?.primary_color || "#253745";

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#06141b] flex flex-col items-center justify-center p-6 text-center text-[#ccd0cf]">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-[#253745] animate-pulse-orb" />
          <div className="relative w-full h-full bg-[#11212d] rounded-full flex items-center justify-center border border-[#253745]">
            <Bot className="w-12 h-12 text-[#ccd0cf] animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#ccd0cf] mb-2">Preparing your AI Assistant...</h2>
        <p className="text-xs text-[#9ba8ab] flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#ccd0cf] animate-spin" /> Loading Knowledge Base & Groq Engine
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-2 sm:p-6 transition-colors ${
        isLight ? "bg-slate-100 text-slate-900" : "bg-[#06141b] text-[#ccd0cf]"
      }`}
    >
      <div
        className={`w-full max-w-2xl h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isLight ? "bg-white border-slate-200" : "bg-[#11212d] border-[#253745]"
        }`}
      >
        {/* Header */}
        <div
          style={{ backgroundColor: primary }}
          className="px-6 py-4 flex items-center justify-between text-white shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {botConfig?.chatbot_name || "KalemlyAI Assistant"}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h2>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-white/70" /> {botConfig?.company_name || "Customer Support"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-white" /> Active RAG Support
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          className={`flex-1 p-6 overflow-y-auto space-y-4 ${
            isLight ? "bg-slate-50/60" : "bg-[#06141b]/40"
          }`}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`flex items-start gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  style={msg.sender === "user" ? { backgroundColor: primary } : {}}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === "user"
                      ? "text-white"
                      : isLight
                      ? "bg-slate-200 text-slate-700"
                      : "bg-[#253745] text-[#9ba8ab]"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div
                    style={msg.sender === "user" ? { backgroundColor: primary } : {}}
                    className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                      msg.sender === "user"
                        ? "text-white border-white/10 rounded-tr-none shadow-xs"
                        : isLight
                        ? "bg-white text-slate-900 border-slate-200 rounded-tl-none shadow-2xs"
                        : "bg-[#11212d] text-[#ccd0cf] border-[#253745] rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === "bot" && msg.needHumanSupport && (
                    <EscalationCard
                      chatbotId={chatbotId}
                      supportInfo={msg.supportInfo || botConfig?.support_info}
                      themeMode={botConfig?.theme_mode || "dark"}
                      primaryColor={primary}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: primary }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <ThinkingAnimation themeMode={botConfig?.theme_mode || "dark"} primaryColor={primary} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className={`p-4 border-t flex items-center gap-3 ${
            isLight ? "bg-white border-slate-200" : "bg-[#11212d] border-[#253745]"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-3 rounded-2xl border text-xs focus:outline-none transition-all ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                : "bg-[#06141b] border-[#253745] text-[#ccd0cf] placeholder-[#4a5c6a]"
            }`}
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            style={{ backgroundColor: primary }}
            className="p-3 rounded-2xl text-white font-medium transition-colors disabled:opacity-50 border border-white/10 shadow-xs hover:opacity-90"
          >
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
