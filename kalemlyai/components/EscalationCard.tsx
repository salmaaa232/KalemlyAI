"use client";

import { useState } from "react";
import { Mail, Phone, Clock, MessageSquare, AlertTriangle, LifeBuoy } from "lucide-react";
import TicketModal from "./TicketModal";

interface SupportInfo {
  support_email: string;
  support_phone: string;
  whatsapp_number?: string;
  working_hours: string;
}

interface EscalationCardProps {
  chatbotId: string;
  supportInfo?: SupportInfo | null;
  themeMode?: "dark" | "light";
  primaryColor?: string;
}

export default function EscalationCard({
  chatbotId,
  supportInfo,
  themeMode = "dark",
  primaryColor = "#253745",
}: EscalationCardProps) {
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const email = supportInfo?.support_email || "support@company.com";
  const phone = supportInfo?.support_phone || "+1 (800) 123-4567";
  const whatsapp = supportInfo?.whatsapp_number;
  const hours = supportInfo?.working_hours || "Mon - Fri, 9:00 AM - 6:00 PM";

  const isLight = themeMode === "light";

  return (
    <div
      className={`w-full my-3 p-5 rounded-2xl border shadow-xs transition-colors ${
        isLight
          ? "bg-slate-100/90 border-slate-300 text-slate-900"
          : "bg-[#06141b]/90 border-[#253745] text-[#ccd0cf]"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`p-2.5 rounded-xl border ${
            isLight
              ? "bg-amber-100 border-amber-300 text-amber-700"
              : "bg-[#253745] border-[#4a5c6a] text-amber-400"
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4
            className={`font-bold text-sm ${
              isLight ? "text-slate-900" : "text-[#ccd0cf]"
            }`}
          >
            Human Support Required
          </h4>
          <p
            className={`text-xs mt-0.5 ${
              isLight ? "text-slate-600" : "text-[#9ba8ab]"
            }`}
          >
            I wasn&apos;t able to completely resolve your request. Please reach out directly to our support team:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
            isLight
              ? "bg-white border-slate-200 text-slate-800"
              : "bg-[#11212d] border-[#253745] text-[#ccd0cf]"
          }`}
        >
          <Mail className="w-4 h-4 text-sky-500 shrink-0" />
          <div className="truncate">
            <span className={`block text-[10px] ${isLight ? "text-slate-400" : "text-[#9ba8ab]"}`}>
              Support Email
            </span>
            <a href={`mailto:${email}`} className="font-semibold hover:underline truncate block">
              {email}
            </a>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
            isLight
              ? "bg-white border-slate-200 text-slate-800"
              : "bg-[#11212d] border-[#253745] text-[#ccd0cf]"
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="truncate">
            <span className={`block text-[10px] ${isLight ? "text-slate-400" : "text-[#9ba8ab]"}`}>
              Phone Number
            </span>
            <a href={`tel:${phone}`} className="font-semibold hover:underline">
              {phone}
            </a>
          </div>
        </div>

        {whatsapp && (
          <div
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
              isLight
                ? "bg-white border-slate-200 text-slate-800"
                : "bg-[#11212d] border-[#253745] text-[#ccd0cf]"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-green-500 shrink-0" />
            <div className="truncate">
              <span className={`block text-[10px] ${isLight ? "text-slate-400" : "text-[#9ba8ab]"}`}>
                WhatsApp Support
              </span>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold hover:underline"
              >
                {whatsapp}
              </a>
            </div>
          </div>
        )}

        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
            isLight
              ? "bg-white border-slate-200 text-slate-800"
              : "bg-[#11212d] border-[#253745] text-[#ccd0cf]"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="truncate">
            <span className={`block text-[10px] ${isLight ? "text-slate-400" : "text-[#9ba8ab]"}`}>
              Working Hours
            </span>
            <span className="font-semibold">{hours}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsTicketOpen(true)}
        style={{ backgroundColor: primaryColor }}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-90 transition-all border border-white/10"
      >
        <LifeBuoy className="w-4 h-4" /> Create Support Ticket
      </button>

      {isTicketOpen && (
        <TicketModal
          chatbotId={chatbotId}
          onClose={() => setIsTicketOpen(false)}
          themeMode={themeMode}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}
