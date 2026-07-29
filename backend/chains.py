import json
import re
from typing import Dict, Any, Optional, List
from config import GROQ_API_KEY
from schemas import StructuredChatOutput

try:
    from langchain_groq import ChatGroq
    from langchain_core.prompts import PromptTemplate
    HAS_LANGCHAIN_GROQ = True
except Exception:
    HAS_LANGCHAIN_GROQ = False

GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
]

class KalemlyChainsPipeline:
    def __init__(self, api_key: str = GROQ_API_KEY):
        self.api_key = api_key.strip() if api_key else ""
        self.llm_instances: List[Any] = []
        
        if HAS_LANGCHAIN_GROQ and self.api_key:
            for model_name in GROQ_MODELS:
                try:
                    llm = ChatGroq(
                        groq_api_key=self.api_key,
                        model_name=model_name,
                        temperature=0.2
                    )
                    self.llm_instances.append(llm)
                except Exception as e:
                    print(f"Error initializing ChatGroq for model {model_name}: {e}")

    def _invoke_llm(self, formatted_prompt: str) -> Optional[str]:
        """Tries invoking primary model; falls back to alternate models on rate limit or error."""
        for idx, llm in enumerate(self.llm_instances):
            try:
                res = llm.invoke(formatted_prompt)
                if res and res.content and res.content.strip():
                    return res.content.strip()
            except Exception as e:
                err_msg = str(e).lower()
                print(f"[LLM FALLBACK WARNING] Model #{idx+1} ({getattr(llm, 'model_name', 'LLM')}) failed: {e}")
                if "rate limit" in err_msg or "429" in err_msg:
                    continue  # Try next fallback model
        return None

    # CHAIN 1: Contextualization Chain (Standalone Question Generator)
    def contextualize_question(self, user_query: str, chat_history: str = "") -> str:
        if not chat_history or not chat_history.strip():
            return user_query

        if self.llm_instances:
            prompt_str = """Given a conversation history and a follow-up user message, rephrase the follow-up message into a standalone question that can be understood WITHOUT the conversation history. Do NOT answer the question, just reformulate it to be self-contained and clear.

Conversation History:
{chat_history}

Follow-up User Message: {user_query}

Standalone Question:"""
            try:
                prompt = PromptTemplate(
                    template=prompt_str,
                    input_variables=["chat_history", "user_query"]
                )
                formatted = prompt.format(chat_history=chat_history, user_query=user_query)
                res_text = self._invoke_llm(formatted)
                if res_text:
                    standalone = res_text.strip()
                    if standalone and len(standalone) > 3:
                        return standalone
            except Exception as e:
                print(f"Contextualization chain exception: {e}")

        # Fallback Heuristic Rewriter
        lower_q = user_query.lower()
        if any(w in lower_q for w in ["it", "them", "they", "this", "that", "these", "those", "pass", "after", "days", "exceed"]):
            history_lines = [l.replace("User:", "").strip() for l in chat_history.split("\n") if l.startswith("User:")]
            if history_lines:
                return f"{history_lines[-1]} - {user_query}"
        return user_query

    # CHAIN 2: Intent Classification Chain
    def classify_intent(self, user_query: str) -> str:
        query_lower = user_query.lower()
        if any(k in query_lower for k in ["refund", "money back", "return", "cancel order", "reimbursement", "استرجاع", "إلغاء"]):
            return "refund"
        elif any(k in query_lower for k in ["human", "agent", "support", "person", "talk to representative", "manager", "دعم", "موظف"]):
            return "human_support"
        elif any(k in query_lower for k in ["price", "cost", "how much", "buy", "plan", "pricing", "سعر", "تكلفة"]):
            return "product_inquiry"
        elif any(k in query_lower for k in ["broken", "error", "issue", "bug", "not working", "fail", "مشكلة", "خطأ"]):
            return "technical_support"
        elif any(k in query_lower for k in ["track", "shipment", "delivery", "status", "shipped", "تتبع", "توصيل"]):
            return "order_info"
        elif any(k in query_lower for k in ["scam", "sue", "lawyer", "terrible", "worst", "angry", "hate"]):
            return "complaint"
        else:
            return "general"

    # CHAIN 3: Escalation Chain
    def evaluate_escalation(self, user_query: str, confidence: float, category: str, answer: str) -> bool:
        query_lower = user_query.lower()
        escalation_triggers = ["talk to human", "manager", "sue", "lawyer", "unacceptable", "scam", "report you", "تحدث مع موظف", "مدير", "شكوى رسمية"]
        if any(trig in query_lower for trig in escalation_triggers):
            return True
        if confidence < 50.0:
            return True
        if category in ["complaint", "human_support"]:
            return True
        if "unable to find that information" in answer.lower():
            return True
        return False

    # CHAIN 4: Lead Detection Chain
    def detect_lead(self, user_query: str) -> Dict[str, Any]:
        query_lower = user_query.lower()
        is_lead = any(k in query_lower for k in ["quote", "price", "demo", "buy", "enterprise", "contact me", "اشتراك", "شراء"])
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', user_query)
        phone_match = re.search(r'\+?\d[\d\s-]{7,}\d', user_query)
        
        return {
            "is_lead": is_lead or bool(email_match or phone_match),
            "lead_name": None,
            "lead_email": email_match.group(0) if email_match else None,
            "lead_phone": phone_match.group(0) if phone_match else None
        }

    # CHAIN 5: Conversation Summary & Title Chain
    def generate_conversation_summary(self, user_query: str, bot_response: str, category: str = "general") -> Dict[str, str]:
        default_title = f"{category.replace('_', ' ').title()} Inquiry"
        default_summary = f"Customer asked: '{user_query[:80]}'. Assistant responded: '{bot_response[:100]}'."
        
        if not self.llm_instances:
            return {"title": default_title, "summary": default_summary}

        try:
            prompt_str = """Summarize the following customer interaction into a concise title (max 5 words) and a 1-2 sentence summary explaining the customer's topic and resolution.

Customer Question: {user_query}
Assistant Response: {bot_response}

Output ONLY valid JSON:
{{"title": "Short Title", "summary": "1-2 sentence summary of the interaction."}}"""
            prompt = PromptTemplate(
                template=prompt_str,
                input_variables=["user_query", "bot_response"]
            )
            formatted = prompt.format(user_query=user_query, bot_response=bot_response)
            res_text = self._invoke_llm(formatted)
            if res_text:
                match = re.search(r'\{.*\}', res_text, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                    return {
                        "title": data.get("title", default_title),
                        "summary": data.get("summary", default_summary)
                    }
        except Exception as e:
            print(f"Conversation summary chain exception: {e}")

        return {"title": default_title, "summary": default_summary}

    # Combined Multi-Chain Execution Pipeline
    def run_pipeline(
        self,
        user_query: str,
        standalone_query: str,
        context: str,
        instructions: str,
        company_name: str,
        chat_history: str = ""
    ) -> StructuredChatOutput:
        category = self.classify_intent(standalone_query)

        # Filter out raw PDF headers
        clean_context = ""
        if context:
            valid_lines = [l for l in context.split("\n") if not l.strip().startswith("%PDF")]
            clean_context = "\n".join(valid_lines).strip()

        # 1. Use Groq LLM Response Chain with Multi-Model Fallbacks
        if self.llm_instances:
            prompt_str = """You are the friendly, helpful AI Customer Support Assistant for {company_name}.

Custom Instructions:
{instructions}

Knowledge Base Context (Retrieved Documents):
{context}

Conversation History:
{chat_history}

Current User Message: {user_query}
Contextualized Question: {standalone_query}

CRITICAL REASONING & RESPONSE RULES:
1. MULTI-TURN CONVERSATION & LOGICAL REASONING:
   - Inherit context from Conversation History. Follow-up questions (e.g., "What if 31 days pass?", "What about after two months?", "Can I still exchange it?") refer to previously discussed topics.
   - Perform logical and numerical reasoning over facts in Knowledge Base Context and Conversation History.
     - Example: If policy says "Returns allowed within 30 days" and user asks "What if 31 days pass?", infer that 31 > 30, so answer: "No. According to the company's return policy, items can only be returned within 30 days of purchase. If 31 days have passed, the item is no longer eligible for return."
2. ACCURACY & CONVERSATIONAL NATURALNESS:
   - Formulate complete, helpful, natural sentences. Do NOT copy raw fragments.
   - If the user asks a company question not answered by Knowledge Base Context or Conversation History, state:
     "I'm unable to find that information in the company's knowledge base."
   - Respond in the language used by the user (Arabic or English).

OUTPUT FORMAT:
Respond with ONLY a single valid JSON object in this EXACT structure:
{{
  "answer": "Your complete, helpful response here.",
  "confidence": 90.0,
  "need_human_support": false,
  "category": "{category}",
  "suggested_action": "No further action required."
}}"""

            prompt = PromptTemplate(
                template=prompt_str,
                input_variables=["company_name", "instructions", "context", "chat_history", "user_query", "standalone_query", "category"]
            )

            formatted_prompt = prompt.format(
                company_name=company_name,
                instructions=instructions,
                context=clean_context if clean_context else "No context available.",
                chat_history=chat_history if chat_history else "No prior history.",
                user_query=user_query,
                standalone_query=standalone_query,
                category=category
            )

            res_text = self._invoke_llm(formatted_prompt)
            if res_text:
                try:
                    match = re.search(r'\{.*\}', res_text, re.DOTALL)
                    if match:
                        data = json.loads(match.group(0))
                        if "answer" in data and data["answer"]:
                            lead_info = self.detect_lead(user_query)
                            return StructuredChatOutput(
                                answer=data.get("answer", "").strip(),
                                confidence=float(data.get("confidence", 90.0)),
                                need_human_support=bool(data.get("need_human_support", False)),
                                category=str(data.get("category", category)),
                                suggested_action=str(data.get("suggested_action", "No further action required.")),
                                is_lead=lead_info["is_lead"],
                                lead_name=lead_info["lead_name"],
                                lead_email=lead_info["lead_email"],
                                lead_phone=lead_info["lead_phone"]
                            )
                except Exception as parse_err:
                    print(f"JSON parse error from LLM response: {parse_err}")

        # 2. Polished Heuristic Fallback (Runs if all LLM models rate limit or fail)
        lead_info = self.detect_lead(user_query)
        
        if not clean_context or "No context available" in clean_context:
            if category in ["product_inquiry", "refund", "order_info", "technical_support"]:
                answer = "I'm unable to find that information in the company's knowledge base."
                confidence = 35.0
            else:
                answer = f"Hello! Welcome to {company_name}. How can I assist you today?"
                confidence = 85.0
        else:
            lines = [line.strip() for line in clean_context.split("\n") if line.strip() and not line.startswith("[Source:") and not line.startswith("%PDF")]
            if lines:
                summary_snippet = " ".join(lines[:3])
                answer = f"According to our company knowledge base: {summary_snippet}"
                confidence = 85.0
            else:
                answer = "I'm unable to find that information in the company's knowledge base."
                confidence = 30.0

        need_human_support = self.evaluate_escalation(user_query, confidence, category, answer)
        suggested_action = "Please contact our support team if you require further assistance." if need_human_support else "No further action required."

        return StructuredChatOutput(
            answer=answer,
            confidence=confidence,
            need_human_support=need_human_support,
            category=category,
            suggested_action=suggested_action,
            is_lead=lead_info["is_lead"],
            lead_name=lead_info["lead_name"],
            lead_email=lead_info["lead_email"],
            lead_phone=lead_info["lead_phone"]
        )

chains_pipeline = KalemlyChainsPipeline()
