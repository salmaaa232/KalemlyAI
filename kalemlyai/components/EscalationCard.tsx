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
}

export default function EscalationCard({ chatbotId, supportInfo }: EscalationCardProps) {
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const email = supportInfo?.support_email || "support@company.com";
  const phone = supportInfo?.support_phone || "+1 (800) 123-4567";
  const whatsapp = supportInfo?.whatsapp_number;
  const hours = supportInfo?.working_hours || "Mon - Fri, 9:00 AM - 6:00 PM";

  return (
    <div className="w-full my-3 p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-800 shadow-xs">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Human Support Required</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            I wasn&apos;t able to completely resolve your request. Please reach out directly to our support team:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80">
          <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 block text-[10px]">Support Email</span>
            <a href={`mailto:${email}`} className="text-slate-900 font-semibold hover:underline truncate">
              {email}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80">
          <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 block text-[10px]">Phone Number</span>
            <a href={`tel:${phone}`} className="text-slate-900 font-semibold hover:underline">
              {phone}
            </a>
          </div>
        </div>

        {whatsapp && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80">
            <MessageSquare className="w-4 h-4 text-green-600 shrink-0" />
            <div className="truncate">
              <span className="text-slate-500 block text-[10px]">WhatsApp Support</span>
              <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-slate-900 font-semibold hover:underline">
                {whatsapp}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 block text-[10px]">Working Hours</span>
            <span className="text-slate-900 font-semibold">{hours}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsTicketOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors"
      >
        <LifeBuoy className="w-4 h-4" /> Create Support Ticket
      </button>

      {isTicketOpen && (
        <TicketModal chatbotId={chatbotId} onClose={() => setIsTicketOpen(false)} />
      )}
    </div>
  );
}
