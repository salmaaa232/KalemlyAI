"use client";

import { useState } from "react";
import { X, Send, CheckCircle2, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/utils";

interface TicketModalProps {
  chatbotId: string;
  onClose: () => void;
  themeMode?: "dark" | "light";
  primaryColor?: string;
}

export default function TicketModal({
  chatbotId,
  onClose,
  themeMode = "dark",
  primaryColor = "#253745",
}: TicketModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isLight = themeMode === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/chatbots/${chatbotId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, notes: description }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-colors ${
          isLight
            ? "bg-white border-slate-200 text-slate-900"
            : "bg-[#11212d] border-[#253745] text-[#ccd0cf]"
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
            isLight
              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              : "text-[#9ba8ab] hover:text-white hover:bg-[#253745]"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-[#ccd0cf]"}`}>
              Ticket Submitted!
            </h3>
            <p className={`text-xs mt-2 ${isLight ? "text-slate-500" : "text-[#9ba8ab]"}`}>
              Our support team has received your ticket and will respond to {email} shortly.
            </p>
            <button
              onClick={onClose}
              className={`mt-5 px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  : "bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf]"
              }`}
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-[#ccd0cf]"}`}>
                Create Support Ticket
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-[#9ba8ab]"}`}>
                Fill in your details to connect with a support manager.
              </p>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-[#ccd0cf]"}`}>
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                    : "bg-[#06141b] border-[#253745] text-[#ccd0cf] placeholder-[#4a5c6a]"
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-[#ccd0cf]"}`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                    : "bg-[#06141b] border-[#253745] text-[#ccd0cf] placeholder-[#4a5c6a]"
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-[#ccd0cf]"}`}>
                Problem Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in detail..."
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                    : "bg-[#06141b] border-[#253745] text-[#ccd0cf] placeholder-[#4a5c6a]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: primaryColor }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-xs shadow-xs hover:opacity-90 transition-all disabled:opacity-50 border border-white/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Support Ticket
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
