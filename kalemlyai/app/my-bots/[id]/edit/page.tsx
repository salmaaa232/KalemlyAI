"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { API_BASE_URL } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import {
  Bot, Building2, Save, ArrowLeft, Loader2, CheckCircle2,
  Globe, Trash2, Plus, Headphones, FileText, Upload, AlertCircle,
  Palette, Moon, Sun, MessageSquare
} from "lucide-react";
import Link from "next/link";
import EscalationCard from "@/components/EscalationCard";

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
  
  // Customization state
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [primaryColor, setPrimaryColor] = useState("#253745");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");

  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const colorPresets = [
    { name: "Navy Slate", hex: "#253745" },
    { name: "Royal Indigo", hex: "#4f46e5" },
    { name: "Emerald Green", hex: "#10b981" },
    { name: "Cyan Blue", hex: "#0284c7" },
    { name: "Deep Violet", hex: "#8b5cf6" },
    { name: "Rose Crimson", hex: "#f43f5e" },
    { name: "Warm Amber", hex: "#f59e0b" },
  ];

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
        setThemeMode(data.theme_mode || "dark");
        setPrimaryColor(data.primary_color || "#253745");
        setWelcomeMessage(data.welcome_message || "Hello! How can I assist you today?");
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
      formData.append("theme_mode", themeMode);
      formData.append("primary_color", primaryColor);
      formData.append("welcome_message", welcomeMessage);
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
      <div className="min-h-screen bg-[#06141b] text-[#ccd0cf]">
        <div className="border-b border-[#253745] bg-[#11212d] px-6 py-5 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/my-bots" className="p-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] transition-colors text-[#ccd0cf]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-[#ccd0cf] flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#ccd0cf]" /> Edit Chatbot & Customization
              </h1>
              <p className="text-xs text-[#9ba8ab]">Customize colors, instructions, and human support details</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#ccd0cf]" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Chatbot updated and knowledge base re-indexed successfully!
                </div>
              )}

              {/* Basic Info */}
              <div className="bg-[#11212d] border border-[#253745] rounded-3xl p-6 space-y-4 shadow-xs">
                <h2 className="text-sm font-bold text-[#ccd0cf] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#9ba8ab]" /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">Company Name</label>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] focus:outline-none focus:border-[#4a5c6a] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">Chatbot Name</label>
                    <input value={chatbotName} onChange={(e) => setChatbotName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] focus:outline-none focus:border-[#4a5c6a] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">Business Description</label>
                  <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] focus:outline-none focus:border-[#4a5c6a] transition-all resize-none" />
                </div>
              </div>

              {/* Appearance & Customization */}
              <div className="bg-[#11212d] border border-[#253745] rounded-3xl p-6 space-y-5 shadow-xs">
                <h2 className="text-sm font-bold text-[#ccd0cf] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#9ba8ab]" /> Appearance & Customization
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Inputs */}
                  <div className="space-y-4">
                    {/* Theme Mode Toggle */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ccd0cf] mb-2">Theme Mode</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setThemeMode("dark")}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            themeMode === "dark"
                              ? "bg-[#253745] border-[#4a5c6a] text-[#ccd0cf]"
                              : "bg-[#06141b] border-[#253745] text-[#9ba8ab] hover:text-[#ccd0cf]"
                          }`}
                        >
                          <Moon className="w-4 h-4" /> Dark Mode
                        </button>
                        <button
                          type="button"
                          onClick={() => setThemeMode("light")}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            themeMode === "light"
                              ? "bg-slate-100 border-slate-300 text-slate-900"
                              : "bg-[#06141b] border-[#253745] text-[#9ba8ab] hover:text-[#ccd0cf]"
                          }`}
                        >
                          <Sun className="w-4 h-4" /> Light Mode
                        </button>
                      </div>
                    </div>

                    {/* Primary Color Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ccd0cf] mb-2">Primary Brand Color</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setPrimaryColor(preset.hex)}
                            style={{ backgroundColor: preset.hex }}
                            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                              primaryColor.toLowerCase() === preset.hex.toLowerCase()
                                ? "border-white scale-110 shadow-xs"
                                : "border-transparent opacity-80"
                            }`}
                            title={preset.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-xl border border-[#253745] bg-[#06141b] cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Welcome Message */}
                    <div>
                      <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">Welcome Message</label>
                      <textarea
                        rows={3}
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        placeholder="Hello! Welcome to support."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Preview */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#ccd0cf]">Live Widget Preview</label>
                    <div
                      className={`p-4 rounded-3xl border shadow-md space-y-3 text-xs ${
                        themeMode === "light"
                          ? "bg-white border-slate-200 text-slate-900"
                          : "bg-[#11212d] border-[#253745] text-[#ccd0cf]"
                      }`}
                    >
                      <div style={{ backgroundColor: primaryColor }} className="p-3 rounded-2xl text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <span className="font-bold text-xs">{chatbotName}</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>

                      <div className="space-y-2 py-1">
                        <div
                          className={`p-3 rounded-2xl text-[11px] border ${
                            themeMode === "light"
                              ? "bg-slate-100 text-slate-800 border-slate-200"
                              : "bg-[#06141b] text-[#ccd0cf] border-[#253745]"
                          }`}
                        >
                          {welcomeMessage}
                        </div>

                        <div className="flex justify-end">
                          <div style={{ backgroundColor: primaryColor }} className="p-2.5 rounded-2xl text-[11px] text-white">
                            Need human help
                          </div>
                        </div>

                        <EscalationCard
                          chatbotId="preview"
                          supportInfo={{
                            support_email: supportEmail,
                            support_phone: supportPhone,
                            whatsapp_number: whatsappNumber,
                            working_hours: workingHours,
                          }}
                          themeMode={themeMode}
                          primaryColor={primaryColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#11212d] border border-[#253745] rounded-3xl p-6 space-y-4 shadow-xs">
                <h2 className="text-sm font-bold text-[#ccd0cf] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9ba8ab]" /> Custom Instructions
                </h2>
                <div className="space-y-2">
                  {instructions.map((inst, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-[#06141b] border border-[#253745]">
                      <span className="text-xs text-[#ccd0cf] flex-1">{inst}</span>
                      <button type="button" onClick={() => setInstructions(instructions.filter((_, idx) => idx !== i))}
                        className="text-[#9ba8ab] hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newInstruction} onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="Add a custom instruction..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] focus:outline-none focus:border-[#4a5c6a] transition-all" />
                  <button type="button" onClick={() => { if (newInstruction.trim()) { setInstructions([...instructions, newInstruction.trim()]); setNewInstruction(""); } }}
                    className="px-4 py-2.5 rounded-xl bg-[#253745] text-[#ccd0cf] hover:bg-[#4a5c6a] border border-[#4a5c6a] text-xs transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-[#11212d] border border-[#253745] rounded-3xl p-6 space-y-4 shadow-xs">
                <h2 className="text-sm font-bold text-[#ccd0cf] flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#9ba8ab]" /> Support Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Support Email", value: supportEmail, setter: setSupportEmail, placeholder: "support@company.com" },
                    { label: "Support Phone", value: supportPhone, setter: setSupportPhone, placeholder: "+1 (800) 555-0199" },
                    { label: "WhatsApp Number", value: whatsappNumber, setter: setWhatsappNumber, placeholder: "+18005550199" },
                    { label: "Working Hours", value: workingHours, setter: setWorkingHours, placeholder: "Mon-Fri 9AM-6PM" },
                  ].map(({ label, value, setter, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">{label}</label>
                      <input value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] focus:outline-none focus:border-[#4a5c6a] transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* URLs */}
              <div className="bg-[#11212d] border border-[#253745] rounded-3xl p-6 space-y-4 shadow-xs">
                <h2 className="text-sm font-bold text-[#ccd0cf] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#9ba8ab]" /> Add New Website URLs
                </h2>
                <div className="space-y-2">
                  {urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#06141b] border border-[#253745]">
                      <span className="text-xs text-[#ccd0cf] flex-1 truncate font-mono">{url}</span>
                      <button type="button" onClick={() => setUrls(urls.filter((_, idx) => idx !== i))} className="text-[#9ba8ab] hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://yoursite.com/faq"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] focus:outline-none focus:border-[#4a5c6a]" />
                  <button type="button" onClick={() => { if (urlInput.trim()) { setUrls([...urls, urlInput.trim()]); setUrlInput(""); } }}
                    className="px-4 py-2.5 rounded-xl bg-[#253745] text-[#ccd0cf] hover:bg-[#4a5c6a] text-xs border border-[#4a5c6a]">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* New Files */}
              <div className="bg-[#11212d] border border-[#253745] rounded-3xl p-6 space-y-4 shadow-xs">
                <h2 className="text-sm font-bold text-[#ccd0cf] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#9ba8ab]" /> Add New Documents
                </h2>
                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[#253745] bg-[#06141b] rounded-2xl cursor-pointer hover:bg-[#253745]/30 transition-all">
                  <Upload className="w-6 h-6 text-[#9ba8ab]" />
                  <span className="text-xs text-[#ccd0cf]">Click to upload PDF, TXT, DOCX files</span>
                  <input type="file" multiple accept=".pdf,.txt,.docx,.doc" className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                </label>
                {files.length > 0 && (
                  <div className="space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#06141b] border border-[#253745]">
                        <FileText className="w-3.5 h-3.5 text-[#ccd0cf] shrink-0" />
                        <span className="text-xs text-[#ccd0cf] flex-1 truncate">{f.name}</span>
                        <span className="text-[10px] text-[#9ba8ab]">{(f.size / 1024).toFixed(0)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSaving}
                className="w-full py-3.5 rounded-2xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving & Re-indexing...</> : <><Save className="w-4 h-4" /> Save Changes & Customization</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
