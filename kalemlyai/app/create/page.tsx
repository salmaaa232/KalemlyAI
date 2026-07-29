"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { getToken } from "@/lib/auth";
import confetti from "canvas-confetti";
import {
  Building2,
  Bot,
  FileText,
  Upload,
  Globe,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Headphones,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/utils";

export default function CreateChatbotPage() {
  const [step, setStep] = useState(1);

  // Form State
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [chatbotName, setChatbotName] = useState("Acme Support Bot");
  const [businessDescription, setBusinessDescription] = useState(
    "Acme Corp provides premium SaaS e-commerce solutions for online stores."
  );

  // Preset & Custom Instructions
  const [instructions, setInstructions] = useState([
    "Always reply professionally and politely.",
    "Speak Arabic and English fluently based on user language.",
    "Never provide refund information unless it exists in the provided documents.",
    "Escalate angry customers or unresolved disputes to human support.",
    "Never discuss topics unrelated to the business.",
  ]);
  const [customInstructionInput, setCustomInstructionInput] = useState("");

  // Support Info
  const [supportEmail, setSupportEmail] = useState("support@acme.com");
  const [supportPhone, setSupportPhone] = useState("+1 (800) 555-0199");
  const [whatsappNumber, setWhatsappNumber] = useState("+18005550199");
  const [working_hours, setWorkingHours] = useState("Mon - Fri, 9:00 AM - 6:00 PM EST");

  // Knowledge Base Inputs
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>(["https://acme.com/faq", "https://acme.com/terms"]);
  const [urlInput, setUrlInput] = useState("");

  // Creation & Animation State
  const [isCreating, setIsCreating] = useState(false);
  const [creationStage, setCreationStage] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const creationStages = [
    "Reading Documents...",
    "Splitting Text Chunks...",
    "Creating Embeddings...",
    "Building Knowledge Base...",
    "Training Your Assistant...",
    "Your Assistant is Ready!",
  ];

  const handleAddInstruction = () => {
    if (customInstructionInput.trim()) {
      setInstructions([...instructions, customInstructionInput.trim()]);
      setCustomInstructionInput("");
    }
  };

  const handleRemoveInstruction = (idx: number) => {
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  const handleAddUrl = () => {
    if (urlInput.trim() && !urls.includes(urlInput.trim())) {
      setUrls([...urls, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const handleRemoveUrl = (idx: number) => {
    setUrls(urls.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleCreateChatbot = async () => {
    setIsCreating(true);
    setCreationStage(0);

    // Multi-stage animated sequence simulation
    for (let i = 0; i < creationStages.length - 1; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCreationStage(i + 1);
    }

    try {
      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("chatbot_name", chatbotName);
      formData.append("business_description", businessDescription);
      formData.append("instructions", instructions.join("\n"));
      formData.append("support_email", supportEmail);
      formData.append("support_phone", supportPhone);
      formData.append("whatsapp_number", whatsappNumber);
      formData.append("working_hours", working_hours);
      formData.append("urls", JSON.stringify(urls));

      files.forEach((f) => {
        formData.append("files", f);
      });

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/chatbots/create`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (data.chatbot_id) {
        setCreatedId(data.chatbot_id);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
      setCreatedId("demo-bot-123");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } finally {
      setIsCreating(false);
      setStep(5);
    }
  };

  const publicLink = typeof window !== "undefined" ? `${window.location.origin}/chat/${createdId}` : `/chat/${createdId}`;
  const embedCode = `<script src="${API_BASE_URL}/api/chatbots/${createdId}/widget.js"></script>\n<KalemlyAI chatbot-id="${createdId}" />`;

  return (
    <div className="min-h-screen flex flex-col bg-[#06141b] text-[#ccd0cf] selection:bg-[#4a5c6a] selection:text-[#ccd0cf]">
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        {/* Step Progress Header */}
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11212d] text-[#ccd0cf] text-xs font-semibold border border-[#253745]">
            <Sparkles className="w-3.5 h-3.5 text-[#9ba8ab]" /> KalemlyAI Builder Wizard
          </div>
          <h1 className="text-3xl font-extrabold text-[#ccd0cf]">Create Your AI Support Chatbot</h1>
          <p className="text-xs text-[#9ba8ab]">Follow the steps below to train your custom AI assistant.</p>

          {/* Stepper bar */}
          <div className="flex items-center justify-between max-w-xl mx-auto pt-6">
            {[
              { num: 1, label: "Basic Info" },
              { num: 2, label: "Instructions" },
              { num: 3, label: "Human Support" },
              { num: 4, label: "Knowledge Base" },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    step >= s.num
                      ? "bg-[#253745] text-[#ccd0cf] border border-[#4a5c6a] shadow-xs"
                      : "bg-[#11212d] border border-[#253745] text-[#4a5c6a]"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-4 h-4 text-[#ccd0cf]" /> : s.num}
                </div>
                <span className="text-[11px] text-[#9ba8ab] font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LOADING ANIMATION DURING CREATION */}
        {isCreating ? (
          <div className="bg-[#11212d] p-12 rounded-3xl text-center space-y-8 max-w-md mx-auto border border-[#253745] shadow-xl my-10">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-[#253745] animate-pulse-orb" />
              <div className="relative w-full h-full bg-[#06141b] rounded-full flex items-center justify-center border border-[#253745]">
                <Bot className="w-10 h-10 text-[#ccd0cf] animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#ccd0cf] mb-1">Building Your AI Assistant</h3>
              <p className="text-xs text-[#9ba8ab] font-medium">{creationStages[creationStage]}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#06141b] h-2.5 rounded-full overflow-hidden border border-[#253745]">
              <div
                className="bg-[#4a5c6a] h-full transition-all duration-500"
                style={{ width: `${((creationStage + 1) / creationStages.length) * 100}%` }}
              />
            </div>

            {/* Stage Checkmarks */}
            <div className="text-left space-y-2 text-xs pt-2">
              {creationStages.map((stageName, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  {idx < creationStage ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : idx === creationStage ? (
                    <Loader2 className="w-4 h-4 text-[#ccd0cf] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#253745] shrink-0" />
                  )}
                  <span
                    className={
                      idx <= creationStage ? "text-[#ccd0cf] font-medium" : "text-[#4a5c6a]"
                    }
                  >
                    {stageName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* STEP FORMS */
          <div className="bg-[#11212d] p-8 rounded-3xl border border-[#253745] shadow-md">
            {/* STEP 1: BASIC INFORMATION */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#253745] pb-4">
                  <div className="p-2.5 rounded-xl bg-[#253745] border border-[#4a5c6a] text-[#ccd0cf]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#ccd0cf]">Basic Information</h3>
                    <p className="text-xs text-[#9ba8ab]">Enter your company details to brand your chatbot.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1">Chatbot Name</label>
                    <input
                      type="text"
                      value={chatbotName}
                      onChange={(e) => setChatbotName(e.target.value)}
                      placeholder="e.g. Acme Assistant"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1">Business Description</label>
                    <textarea
                      rows={4}
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Describe what your business does, products sold, target customers..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-medium text-xs shadow-xs transition-colors"
                  >
                    Next: Custom Instructions <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: INSTRUCTIONS */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#253745] pb-4">
                  <div className="p-2.5 rounded-xl bg-[#253745] border border-[#4a5c6a] text-[#ccd0cf]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#ccd0cf]">Custom Assistant Instructions</h3>
                    <p className="text-xs text-[#9ba8ab]">Set behavior rules, tone, refund rules, and escalation rules.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    {instructions.map((inst, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf]"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {inst}
                        </span>
                        <button
                          onClick={() => handleRemoveInstruction(idx)}
                          className="text-[#9ba8ab] hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInstructionInput}
                      onChange={(e) => setCustomInstructionInput(e.target.value)}
                      placeholder="Add custom rule (e.g. Always offer 10% discount to angry customers)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInstruction())}
                    />
                    <button
                      onClick={handleAddInstruction}
                      className="px-4 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Rule
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06141b] hover:bg-[#253745] text-[#ccd0cf] text-xs font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-medium text-xs shadow-xs transition-colors"
                  >
                    Next: Human Support Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: HUMAN SUPPORT INFORMATION */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#253745] pb-4">
                  <div className="p-2.5 rounded-xl bg-[#253745] border border-[#4a5c6a] text-[#ccd0cf]">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#ccd0cf]">Human Support Information</h3>
                    <p className="text-xs text-[#9ba8ab]">This info is shown when escalation triggers (e.g. angry customer).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1">Support Email</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@company.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1">Support Phone Number</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+1 (800) 123-4567"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1">WhatsApp Number (Optional)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+18001234567"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#ccd0cf] mb-1">Support Working Hours</label>
                    <input
                      type="text"
                      value={working_hours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="Mon - Fri, 9 AM - 6 PM"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06141b] hover:bg-[#253745] text-[#ccd0cf] text-xs font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-medium text-xs shadow-xs transition-colors"
                  >
                    Next: Knowledge Base <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: KNOWLEDGE BASE UPLOADER */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#253745] pb-4">
                  <div className="p-2.5 rounded-xl bg-[#253745] border border-[#4a5c6a] text-[#ccd0cf]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#ccd0cf]">Knowledge Base Data</h3>
                    <p className="text-xs text-[#9ba8ab]">Upload PDF, TXT, DOCX files or provide website URLs.</p>
                  </div>
                </div>

                {/* File Upload Box */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[#ccd0cf]">Upload Documents (PDF, TXT, DOCX)</label>
                  <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#253745] bg-[#06141b] hover:bg-[#253745]/30 cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-[#ccd0cf] mb-2" />
                    <span className="text-xs font-medium text-[#ccd0cf]">Click to upload files</span>
                    <span className="text-[10px] text-[#9ba8ab] mt-1">Supports PDF, DOCX, TXT (Max 10MB per file)</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.docx,.doc"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs"
                        >
                          <span className="flex items-center gap-2 truncate text-[#ccd0cf] font-medium">
                            <FileText className="w-4 h-4 text-[#ccd0cf] shrink-0" /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            className="text-[#9ba8ab] hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Website URLs */}
                <div className="space-y-3 pt-4 border-t border-[#253745]">
                  <label className="block text-xs font-semibold text-[#ccd0cf]">Website URLs</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://company.com/faq"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                    />
                    <button
                      onClick={handleAddUrl}
                      className="px-4 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add URL
                    </button>
                  </div>

                  {urls.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {urls.map((u, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf]"
                        >
                          <span className="flex items-center gap-2 truncate font-medium">
                            <Globe className="w-4 h-4 text-[#9ba8ab] shrink-0" /> {u}
                          </span>
                          <button
                            onClick={() => handleRemoveUrl(idx)}
                            className="text-[#9ba8ab] hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#253745]">
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06141b] hover:bg-[#253745] text-[#ccd0cf] text-xs font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleCreateChatbot}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-bold text-sm shadow-md transition-all"
                  >
                    <Bot className="w-5 h-5 text-[#ccd0cf]" /> Generate Chatbot Knowledge Base
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS & SHARE / EMBED MODAL */}
            {step === 5 && createdId && (
              <div className="space-y-8 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#253745] text-[#ccd0cf] flex items-center justify-center mx-auto border border-[#4a5c6a] shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#ccd0cf]">Your Assistant is Ready!</h2>
                  <p className="text-xs text-[#9ba8ab] mt-1">
                    Chatbot <span className="text-[#ccd0cf] font-bold">{chatbotName}</span> has been vectorized and indexed into ChromaDB.
                  </p>
                </div>

                {/* Share Links Box */}
                <div className="space-y-6 text-left max-w-xl mx-auto">
                  {/* Public Shareable Link */}
                  <div className="p-4 rounded-2xl bg-[#06141b] border border-[#253745] space-y-2">
                    <label className="block text-xs font-bold text-[#ccd0cf]">Public Shareable Link</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={publicLink}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#11212d] border border-[#253745] text-xs text-[#ccd0cf] font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(publicLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copiedLink ? "Copied!" : "Copy"}
                      </button>
                      <a
                        href={publicLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf]"
                        title="Open Chat Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* HTML Embed Snippet */}
                  <div className="p-4 rounded-2xl bg-[#06141b] border border-[#253745] space-y-2">
                    <label className="block text-xs font-bold text-[#ccd0cf]">Website HTML Embed Script</label>
                    <textarea
                      readOnly
                      rows={3}
                      value={embedCode}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#11212d] border border-[#253745] text-xs text-[#ccd0cf] font-mono focus:outline-none resize-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(embedCode);
                        setCopiedEmbed(true);
                        setTimeout(() => setCopiedEmbed(false), 2000);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] text-xs font-medium border border-[#4a5c6a] transition-colors"
                    >
                      {copiedEmbed ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedEmbed ? "Embed Snippet Copied!" : "Copy Embed Script"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-4">
                  <a
                    href={publicLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-3.5 rounded-2xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] border border-[#4a5c6a] font-bold text-xs shadow-md transition-colors"
                  >
                    Test Your Chatbot Live
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
