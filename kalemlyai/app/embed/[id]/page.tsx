"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Bot, Send, X, MessageSquare, Loader2, Sparkles } from "lucide-react";
import ThinkingAnimation from "@/components/ThinkingAnimation";
import EscalationCard from "@/components/EscalationCard";
import { API_BASE_URL } from "@/lib/utils";

interface ChatbotConfig {
  id: string;
  company_name: string;
  chatbot_name: string;
  support_info: any;
  theme_mode?: "dark" | "light";
  primary_color?: string;
  welcome_message?: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  needHumanSupport?: boolean;
  supportInfo?: any;
}

export default function EmbedWidgetPage() {
  const params = useParams();
  const chatbotId = (params?.id as string) || "demo-bot";

  const [isOpen, setIsOpen] = useState(false);
  const [botConfig, setBotConfig] = useState<ChatbotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(7));
  }, []);

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
        console.warn("Backend API offline or unreachable, using default embed widget config.");
      }

      if (loadedConfig) {
        setBotConfig(loadedConfig);
        const welcome = loadedConfig.welcome_message || `Hello! Welcome to ${loadedConfig.company_name}. How can I help you today?`;
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: welcome,
          },
        ]);
      } else {
        const defaultConfig: ChatbotConfig = {
          id: chatbotId,
          company_name: "Customer Support",
          chatbot_name: "Kalemly Assistant",
          support_info: null,
          theme_mode: "dark",
          primary_color: "#253745",
          welcome_message: "Hello! How can I assist you today?",
        };
        setBotConfig(defaultConfig);
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: defaultConfig.welcome_message!,
          },
        ]);
      }
    }

    if (chatbotId) {
      fetchBotInfo();
    }
  }, [chatbotId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isThinking) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbots/${chatbotId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId || "demo-session", message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: data.answer,
            needHumanSupport: data.need_human_support,
            supportInfo: data.support_info,
          },
        ]);
        setIsThinking(false);
        return;
      }
    } catch (err) {
      console.warn("Backend chat endpoint offline, using fallback:", err);
    }

    setTimeout(() => {
      let replyText = "I'm unable to find that information in the company's knowledge base.";
      let needHumanSupport = false;

      if (userText.toLowerCase().includes("human") || userText.toLowerCase().includes("support")) {
        replyText = "I wasn't able to resolve your request. Please reach out to our human support team.";
        needHumanSupport = true;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: replyText,
          needHumanSupport,
          supportInfo: botConfig?.support_info,
        },
      ]);
      setIsThinking(false);
    }, 1000);
  };

  const isLight = botConfig?.theme_mode === "light";
  const primary = botConfig?.primary_color || "#253745";

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 font-sans flex flex-col items-end bg-transparent pointer-events-none">
      {/* Floating Widget Drawer Window */}
      {isOpen && (
        <div
          className={`w-[370px] h-[560px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 transition-colors ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#11212d] border-[#253745] text-[#ccd0cf]"
          }`}
        >
          {/* Widget Header */}
          <div
            style={{ backgroundColor: primary }}
            className="px-5 py-3.5 flex items-center justify-between text-white shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {botConfig?.chatbot_name || "Support Assistant"}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[10px] text-white/80">{botConfig?.company_name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 p-4 overflow-y-auto space-y-3 text-xs ${
              isLight ? "bg-slate-50/60" : "bg-[#06141b]/50"
            }`}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  style={msg.sender === "user" ? { backgroundColor: primary } : {}}
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed border ${
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
            ))}

            {isThinking && (
              <div className="flex items-start gap-2">
                <ThinkingAnimation />
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
            className={`p-3 border-t flex items-center gap-2 ${
              isLight ? "bg-white border-slate-200" : "bg-[#11212d] border-[#253745]"
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                  : "bg-[#06141b] border-[#253745] text-[#ccd0cf] placeholder-[#4a5c6a]"
              }`}
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              style={{ backgroundColor: primary }}
              className="p-2.5 rounded-xl text-white transition-colors disabled:opacity-50 border border-white/10 shadow-xs hover:opacity-90"
            >
              {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: primary }}
        className="w-14 h-14 rounded-full text-white border border-white/20 flex items-center justify-center shadow-xl hover:scale-105 transition-all pointer-events-auto cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
