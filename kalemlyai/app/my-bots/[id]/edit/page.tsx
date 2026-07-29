"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import {
  Bot, Building2, Save, ArrowLeft, Loader2, CheckCircle2,
  Globe, Trash2, Plus, Headphones, FileText, Upload, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function EditChatbotPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [chatbotName, setChatbotName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [instructions, setInstructions] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chatbots/${chatbotId}`);
        if (!res.ok) { setError("Chatbot not found."); setIsLoading(false); return; }
        const data = await res.json();
        setCompanyName(data.company_name || "");
        setChatbotName(data.chatbot_name || "");
        setBusinessDescription(data.business_description || "");
        setInstructions(
          data.instructions
            ? data.instructions.split("\n").filter((l: string) => l.trim())
            : []
        );
        setSupportEmail(data.support_info?.support_email || "");
        setSupportPhone(data.support_info?.support_phone || "");
        setWhatsappNumber(data.support_info?.whatsapp_number || "");
        setWorkingHours(data.support_info?.working_hours || "");
      } catch (e) {
        setError("Failed to load chatbot data.");
      } finally {
        setIsLoading(false);
      }
    }
    if (chatbotId) load();
  }, [chatbotId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("chatbot_name", chatbotName);
      formData.append("business_description", businessDescription);
      formData.append("instructions", instructions.join("\n"));
      formData.append("support_email", supportEmail);
      formData.append("support_phone", supportPhone);
      formData.append("whatsapp_number", whatsappNumber);
      formData.append("working_hours", workingHours);
      formData.append("urls", JSON.stringify(urls));
      files.forEach((f) => formData.append("files", f));

      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        setFiles([]);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const err = await res.json();
        setError(err.detail || "Failed to update chatbot.");
      }
    } catch (e) {
      setError("Network error. Please check the backend is running.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050811] text-slate-100">
        <div className="border-b border-white/10 bg-slate-900/60 px-6 py-5">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link href="/my-bots" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" /> Edit Chatbot
              </h1>
              <p className="text-xs text-slate-400">Changes are automatically re-indexed in the knowledge base</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Chatbot updated and knowledge base re-indexed successfully!
                </div>
              )}

              {/* Basic Info */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Company Name</label>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Chatbot Name</label>
                    <input value={chatbotName} onChange={(e) => setChatbotName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Business Description</label>
                  <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all resize-none" />
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" /> Custom Instructions
                </h2>
                <div className="space-y-2">
                  {instructions.map((inst, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-xs text-slate-300 flex-1">{inst}</span>
                      <button type="button" onClick={() => setInstructions(instructions.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newInstruction} onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="Add a custom instruction..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                  <button type="button" onClick={() => { if (newInstruction.trim()) { setInstructions([...instructions, newInstruction.trim()]); setNewInstruction(""); } }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-cyan-400" /> Support Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Support Email", value: supportEmail, setter: setSupportEmail, placeholder: "support@company.com" },
                    { label: "Support Phone", value: supportPhone, setter: setSupportPhone, placeholder: "+1 (800) 555-0199" },
                    { label: "WhatsApp Number", value: whatsappNumber, setter: setWhatsappNumber, placeholder: "+18005550199" },
                    { label: "Working Hours", value: workingHours, setter: setWorkingHours, placeholder: "Mon-Fri 9AM-6PM" },
                  ].map(({ label, value, setter, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">{label}</label>
                      <input value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* URLs */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" /> Add New Website URLs
                </h2>
                <div className="space-y-2">
                  {urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-xs text-cyan-400 flex-1 truncate font-mono">{url}</span>
                      <button type="button" onClick={() => setUrls(urls.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://yoursite.com/faq"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500" />
                  <button type="button" onClick={() => { if (urlInput.trim()) { setUrls([...urls, urlInput.trim()]); setUrlInput(""); } }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-500">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* New Files */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" /> Add New Documents
                </h2>
                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-400">Click to upload PDF, TXT, DOCX files</span>
                  <input type="file" multiple accept=".pdf,.txt,.docx,.doc" className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                </label>
                {files.length > 0 && (
                  <div className="space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-xs text-slate-300 flex-1 truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSaving}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving & Re-indexing...</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
