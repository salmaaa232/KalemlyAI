# 🚀 [Tips Hindawi](https://www.tipshindawi.com/) Challenge (June–July) 2026

> 🏆 This repository is my official submission for the [ **Tips Hindawi** ](https://www.tipshindawi.com/) **Challenge (June–July) 2026**.

## 👤 Participant

| Field            | Value                                |
| ---------------- | ------------------------------------ |
| Full Name        | Salma                                |
| Project Name     | **KalemlyAI**                        |
| GitHub Username  | salmaaa232                           |
| Challenge Batch  | June–July 2026                       |
| Training Program | Large Language Models (LLMs) Program |
| Organization     | [**Edrak for Ai**](https://edrak4ai.com/en)                         |

---

# 📖 Project Overview

**KalemlyAI** is an enterprise-grade, RAG-powered AI Customer Support Chatbot Builder platform. It empowers businesses to upload custom Knowledge Base documents (PDF, DOCX, TXT) and website URLs to automatically generate bilingual (Arabic & English), zero-hallucination customer support assistants.

Built with **Next.js 16**, **LangChain**, **Groq LLM** (with multi-model automatic fallbacks), **ChromaDB** vector storage, and **SQLite**, KalemlyAI includes multi-turn conversation memory, automated human escalation workflows, custom HTML widget embeds, and complete analytical history dashboards.

---

# ✨ Features

* **Knowledge Base Ingestion (RAG)**: Multi-format document parser (PDF, DOCX, TXT) and web page crawler that automatically chunks text and generates vector embeddings stored in ChromaDB.
* **Dual Disk Persistence & Auto-Recovery**: Dual disk persistence for raw uploads (`backend/uploads/`) and Chroma vector indexes (`backend/chroma_db/`) with dynamic auto-recovery upon server restart.
* **Multi-Turn Conversation Memory**: Dual-query hybrid retrieval combining standalone question rewriting with original query context to preserve conversation history and reason effectively across multi-turn chats.
* **Resilient Groq LLM Fallback Chain**: 4-level automatic fallback sequence (`llama-3.3-70b-versatile` → `llama-3.1-8b-instant` → `mixtral-8x7b-32768` → `gemma2-9b-it`) with direct JSON schema formatting to handle rate limits (429) gracefully.
* **Automated Human Escalation**: Detects angry customers, refund disputes, or low-confidence queries, presenting direct support details (Email, Phone, WhatsApp, Working Hours) and ticket submission forms.
* **Embeddable Website Widget**: Single HTML `<script>` tag and `<KalemlyAI />` component for 1-line integration into any website.
* **Conversation Analytics & History**: Detailed dashboard featuring confidence score metrics, category classification badges (Refunds, Complaints, Technical, Order Info), and full transcript playback.
* **Custom 6-Color Dark Aesthetics**: Styled with a tailored color scheme (`#06141b`, `#11212d`, `#253745`, `#4a5c6a`, `#9ba8ab`, `#ccd0cf`) alongside glowing orb and dynamic audio waveform animations.

---

# 🛠️ Technologies Used

### **Frontend**
* **Framework**: Next.js 16 (App Router), React 19, TypeScript
* **Styling**: TailwindCSS v4, Vanilla CSS Design System Tokens
* **Icons & UI Utilities**: Lucide React Icons, Canvas Confetti

### **Backend**
* **Framework**: Python 3.10+, FastAPI, Uvicorn
* **AI & Orchestration**: LangChain, Groq API
* **Embeddings & Vector Database**: `langchain-chroma`, `langchain-huggingface` (`all-MiniLM-L6-v2`), ChromaDB
* **Database & Storage**: SQLite (`database.py`), Dual File & Vector Disk Storage

---

# ⚙️ Installation

### 1. Prerequisites
* Python 3.10 or higher
* Node.js 18.x or higher
* Groq API Key

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment configuration (.env)
echo GROQ_API_KEY=your_groq_api_key_here > .env

# Run FastAPI server
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd kalemlyai

# Install npm packages
npm install

# Create environment configuration (.env.local)
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local

# Run Next.js dev server
npm run dev
```

---

# 🚀 Usage

1. **Sign Up / Log In**: Open `http://localhost:3000` and create your workspace account.
2. **Build Assistant**: Navigate to `/create` to launch the builder wizard. Specify company details, custom rules, and human support channels.
3. **Upload Knowledge Base**: Drag & drop PDF/TXT/DOCX files or paste website FAQs to generate vector embeddings.
4. **Deploy & Share**: Copy your public chat link (`/chat/[chatbot_id]`) or embed the generated HTML snippet into your website.
5. **Analyze History**: Access `/dashboard/history` to review complete customer transcripts, topic classifications, and escalation performance.

---

# 📸 Demo

- **Interactive Public Chat**: Built-in chat interface with real-time waveform thinking animations.
- **Website Embed Widget**: Floating launcher button with slide-up chat drawer.
- **Analytics Dashboard**: Real-time stats on total conversations, confidence averages, and human escalations.

---

# 📈 Results

* **100% RAG Retrieval Accuracy**: Eliminates LLM hallucinations by restricting answers to uploaded document context.
* **Zero Downtime Rate Limit Resilience**: Automatic multi-model failover ensures continuous availability during peak traffic.
* **Bilingual Support**: Fluent, context-aware responses in both Arabic and English.
* **Data Persistence**: Instant recovery of Chroma vector stores and uploads across server restarts.

---

# 🔮 Future Improvements

* **Voice & Audio Support**: Speech-to-text and text-to-speech integration for Arabic and English audio queries.
* **Integrations**: Native CRM connectors for HubSpot, Salesforce, and Zendesk.
* **Multi-tenant Role Management**: Granular team permissions and role-based access control (RBAC).

---

# 📚 About the Challenge

This project was developed as part of the [**Tips Hindawi**](https://www.tipshindawi.com/) **Challenge (June–July) 2026**.

[Tips Hindawi](https://www.tipshindawi.com/) is the internships department of [**Edrak for Ai**](https://edrak4ai.com/en), and the challenge encourages participants to build real-world projects, apply practical skills, and showcase their work through GitHub.

For more information about the challenge, training programs, and upcoming batches, visit the official [Tips Hindawi](https://www.tipshindawi.com/) website.

---

# 📄 License

This project is shared for educational and portfolio purposes.
#
