"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Bot, Send, X, MessageSquare, Loader2 } from "lucide-react";
import ThinkingAnimation from "@/components/ThinkingAnimation";
import EscalationCard from "@/components/EscalationCard";
import { API_BASE_URL } from "@/lib/utils";

interface ChatbotConfig {
  id: string;
  company_name: string;
  chatbot_name: string;
  support_info: any;
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
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: `Hello! Welcome to ${loadedConfig.company_name}. How can I help you today?`,
          },
        ]);
      } else {
        setBotConfig({
          id: chatbotId,
          company_name: "Customer Support",
          chatbot_name: "Kalemly Assistant",
          support_info: null,
        });
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            text: "Hello! How can I assist you today?",
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

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 font-sans flex flex-col items-end">
      {/* Floating Widget Drawer Window */}
      {isOpen && (
        <div className="w-[370px] h-[560px] rounded-3xl bg-[#11212d] border border-[#253745] shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Widget Header */}
          <div className="px-5 py-3.5 bg-[#06141b] border-b border-[#253745] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#253745] border border-[#4a5c6a] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#ccd0cf]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#ccd0cf] flex items-center gap-1.5">
                  {botConfig?.chatbot_name || "Support Assistant"}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[10px] text-[#9ba8ab]">{botConfig?.company_name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#9ba8ab] hover:text-[#ccd0cf] hover:bg-[#253745] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#06141b]/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed border ${
                    msg.sender === "user"
                      ? "bg-[#253745] text-[#ccd0cf] border-[#4a5c6a] rounded-tr-none"
                      : "bg-[#11212d] text-[#ccd0cf] border-[#253745] rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "bot" && msg.needHumanSupport && (
                  <EscalationCard
                    chatbotId={chatbotId}
                    supportInfo={msg.supportInfo || botConfig?.support_info}
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
            className="p-3 bg-[#11212d] border-t border-[#253745] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="p-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] transition-colors"
            >
              {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] flex items-center justify-center shadow-xl hover:scale-105 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
