import Link from "next/link";
import Footer from "@/components/Footer";
import DemoWidget from "@/components/DemoWidget";
import {
  Sparkles,
  Bot,
  Brain,
  ArrowRight,
  Code2,
  Share2,
  Zap,
  FileText,
  Globe,
  Headphones,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#06141b] text-[#ccd0cf] selection:bg-[#4a5c6a] selection:text-[#ccd0cf]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-24">
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center text-center pt-8 pb-12 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#11212d] border border-[#253745] text-xs font-semibold text-[#ccd0cf]">
            <Sparkles className="w-3.5 h-3.5 text-[#9ba8ab]" />
            AI Customer Support Chatbot Builder with RAG & Groq LLM
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] text-[#ccd0cf]">
            Build Custom AI Support Chatbots Trained on Your{" "}
            <span className="text-[#9ba8ab] underline decoration-[#253745] underline-offset-8">
              Company Data
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-[#9ba8ab] max-w-2xl leading-relaxed">
            Upload PDFs, website links, and instructions. KalemlyAI utilizes Retrieval-Augmented Generation (RAG), LangChain Chains, and Human Escalation to deliver accurate, non-hallucinating responses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href="/create"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#253745] text-[#ccd0cf] font-bold text-base shadow-md hover:bg-[#4a5c6a] hover:scale-105 transition-all border border-[#4a5c6a]"
            >
              <Bot className="w-5 h-5 text-[#ccd0cf]" /> Build Your Chatbot Now
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#11212d] border border-[#253745] text-[#ccd0cf] font-semibold text-base shadow-2xs hover:bg-[#253745] transition-colors"
            >
              Try Live Demo <ArrowRight className="w-4 h-4 text-[#9ba8ab]" />
            </a>
          </div>

          {/* Stats / Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-[#253745] max-w-3xl w-full text-left">
            <div>
              <p className="text-2xl font-extrabold text-[#ccd0cf]">100%</p>
              <p className="text-xs text-[#9ba8ab]">RAG Data Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#ccd0cf]">4 Chains</p>
              <p className="text-xs text-[#9ba8ab]">LangChain Workflow</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#ccd0cf]">Groq LLM</p>
              <p className="text-xs text-[#9ba8ab]">Ultra-Fast Inference</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#ccd0cf]">Embeddable</p>
              <p className="text-xs text-[#9ba8ab]">Single Script Tag</p>
            </div>
          </div>
        </section>

        {/* DEMO CHATBOT SECTION */}
        <section id="demo" className="scroll-mt-28 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11212d] text-[#ccd0cf] text-xs font-semibold border border-[#253745]">
            <Zap className="w-3.5 h-3.5 text-[#9ba8ab]" /> Interactive Preview
          </div>
          <h2 className="text-3xl font-extrabold text-[#ccd0cf]">Experience KalemlyAI in Action</h2>
          <p className="text-[#9ba8ab] text-sm max-w-xl mx-auto">
            Test the RAG retrieval speed, intent classification, thinking animations, and human escalation triggers.
          </p>

          <div className="pt-4">
            <DemoWidget />
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="scroll-mt-28 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11212d] text-[#ccd0cf] text-xs font-semibold border border-[#253745]">
              <Brain className="w-3.5 h-3.5 text-[#9ba8ab]" /> Cutting-Edge AI Architecture
            </div>
            <h2 className="text-3xl font-extrabold text-[#ccd0cf]">Built for Enterprise Precision</h2>
            <p className="text-[#9ba8ab] text-sm max-w-xl mx-auto">
              Everything your business needs to build, deploy, and manage zero-hallucination customer support assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#11212d] p-6 rounded-3xl border border-[#253745] shadow-xs space-y-3 hover:border-[#4a5c6a] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#253745] flex items-center justify-center text-[#ccd0cf] border border-[#4a5c6a]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#ccd0cf]">Knowledge Ingestion (RAG)</h3>
              <p className="text-xs text-[#9ba8ab] leading-relaxed">
                Upload PDFs, TXT, DOCX files or crawl website URLs. Documents are chunked and vectorized in ChromaDB for instant, accurate retrieval.
              </p>
            </div>

            <div className="bg-[#11212d] p-6 rounded-3xl border border-[#253745] shadow-xs space-y-3 hover:border-[#4a5c6a] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#253745] flex items-center justify-center text-[#ccd0cf] border border-[#4a5c6a]">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#ccd0cf]">Multi-Turn Memory</h3>
              <p className="text-xs text-[#9ba8ab] leading-relaxed">
                Remembers previous context across turns. Rewrites follow-up questions intelligently while preserving complete conversation history.
              </p>
            </div>

            <div className="bg-[#11212d] p-6 rounded-3xl border border-[#253745] shadow-xs space-y-3 hover:border-[#4a5c6a] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#253745] flex items-center justify-center text-[#ccd0cf] border border-[#4a5c6a]">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#ccd0cf]">Human Escalation</h3>
              <p className="text-xs text-[#9ba8ab] leading-relaxed">
                Automatically detects angry customers, legal complaints, or low confidence answers and presents phone, email, and support options.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="scroll-mt-28 space-y-12 bg-[#11212d] border border-[#253745] rounded-3xl p-8 md:p-12 shadow-xs">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-[#ccd0cf]">How KalemlyAI Works</h2>
            <p className="text-[#9ba8ab] text-sm max-w-xl mx-auto">
              From raw documents to an active AI widget on your site in under 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: Globe, title: "1. Add Data", desc: "Upload PDFs, company docs, and paste support URLs." },
              { step: "02", icon: Brain, title: "2. Vectorize", desc: "KalemlyAI chunks text, generates embeddings, and indexes knowledge into ChromaDB." },
              { step: "03", icon: Code2, title: "3. Embed Code", desc: "Copy your single <KalemlyAI /> HTML script snippet." },
              { step: "04", icon: Share2, title: "4. Live Support", desc: "Your bot answers queries in English and Arabic 24/7." },
            ].map((st) => (
              <div key={st.step} className="p-5 rounded-2xl bg-[#06141b] border border-[#253745] space-y-3">
                <span className="text-xs font-mono font-bold text-[#9ba8ab]">{st.step}</span>
                <st.icon className="w-6 h-6 text-[#ccd0cf]" />
                <h4 className="text-sm font-bold text-[#ccd0cf]">{st.title}</h4>
                <p className="text-xs text-[#9ba8ab] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="bg-[#11212d] border border-[#253745] text-[#ccd0cf] rounded-3xl p-10 md:p-14 text-center space-y-6 shadow-md">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#ccd0cf]">Ready to Build Your AI Assistant?</h2>
          <p className="text-[#9ba8ab] text-sm max-w-xl mx-auto">
            Get started for free today and create custom RAG support bots for your business in minutes.
          </p>
          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#253745] hover:bg-[#4a5c6a] text-[#ccd0cf] font-bold text-sm shadow-md transition-colors border border-[#4a5c6a]"
            >
              <Bot className="w-5 h-5 text-[#ccd0cf]" /> Create Free Chatbot
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
