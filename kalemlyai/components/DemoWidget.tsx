"use client";

import { useState } from "react";
import { Bot, Send, User, RefreshCw, ShieldCheck } from "lucide-react";
import ThinkingAnimation from "./ThinkingAnimation";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function DemoWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! Welcome to KalemlyAI Interactive Demo. Ask me anything about our features, return policy, or pricing!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const sampleQuestions = [
    "What is your return policy?",
    "How does website embedding work?",
    "I need to talk to a human support agent",
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      let replyText = "";

      const lower = userText.toLowerCase();

      if (lower.includes("refund") || lower.includes("return")) {
        replyText = "Items can be returned within 30 days of purchase for a full refund or exchange. Items must be in original condition with proof of purchase.";
      } else if (lower.includes("embed") || lower.includes("website")) {
        replyText = "Embedding is seamless! Simply copy the generated `<script src='kalemly-ai.js'></script><KalemlyAI chatbot-id='...' />` snippet into your website.";
      } else if (lower.includes("human") || lower.includes("manager") || lower.includes("support")) {
        replyText = "I can connect you with human support! Please email support@acme.com or call +1 (800) 555-0199.";
      } else {
        replyText = "I'm unable to find that information in the company's knowledge base.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: replyText,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-[#11212d] border border-[#253745] shadow-xl overflow-hidden flex flex-col h-[560px]">
      {/* Widget Header */}
      <div className="px-6 py-4 bg-[#06141b] border-b border-[#253745] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#253745] flex items-center justify-center border border-[#4a5c6a]">
            <Bot className="w-5 h-5 text-[#ccd0cf]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#ccd0cf] flex items-center gap-2">
              KalemlyAI Demo Bot <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-[11px] text-[#9ba8ab] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#9ba8ab]" /> Active RAG & Groq Engine
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-xl text-[#9ba8ab] hover:text-[#ccd0cf] hover:bg-[#253745] transition-colors"
          title="Reset Chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#06141b]/50">
        {messages.map((msg) => (
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
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                  msg.sender === "user"
                    ? "bg-[#253745] text-[#ccd0cf] border-[#4a5c6a] rounded-tr-none"
                    : "bg-[#11212d] text-[#ccd0cf] border-[#253745] rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#253745] text-[#9ba8ab] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <ThinkingAnimation />
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-6 py-2 bg-[#06141b] border-t border-[#253745] flex gap-2 overflow-x-auto text-[11px]">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-[#11212d] text-[#ccd0cf] border border-[#253745] hover:bg-[#253745] transition-colors font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 bg-[#11212d] border-t border-[#253745] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the demo assistant..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
