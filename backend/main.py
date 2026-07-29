import json
import os
import re
import sys
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

# Force UTF-8 output on Windows (avoids UnicodeEncodeError from PDF special chars)
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from config import PORT
from database import (
    init_db, save_chatbot, get_chatbot, save_lead, get_leads,
    create_user, get_user_by_email, get_user_by_id,
    get_chatbots_by_user, update_chatbot, delete_chatbot,
    get_or_create_active_conversation, add_messages_to_conversation,
    get_conversations_by_chatbot, get_conversation_with_messages,
    get_chatbot_conversation_stats, get_dashboard_stats
)
from schemas import (
    ChatRequest, LeadRequest, StructuredChatOutput,
    UserSignupRequest, UserLoginRequest, TokenResponse, UserOut, ChatbotUpdateRequest
)
from auth import hash_password, verify_password, create_access_token, get_current_user, require_current_user
from rag_engine import rag_engine
from chains import chains_pipeline
from memory import memory_manager

app = FastAPI(
    title="KalemlyAI RAG Customer Support API",
    description="FastAPI Backend for KalemlyAI SaaS Chatbot Builder (Conversation-Based Architecture)",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    print("✅ Database initialized successfully with Conversation-Based schema.")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "KalemlyAI API v2.1 (Conversation Architecture)"}

# ════════════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(req: UserSignupRequest):
    existing = get_user_by_email(req.email.lower().strip())
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    pw_hash = hash_password(req.password)
    user_id = create_user(req.full_name.strip(), req.email.lower().strip(), pw_hash)
    
    token = create_access_token({"sub": user_id})
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        full_name=req.full_name.strip(),
        email=req.email.lower().strip()
    )

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: UserLoginRequest):
    user = get_user_by_email(req.email.lower().strip())
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_access_token({"sub": user["id"]})
    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        full_name=user["full_name"],
        email=user["email"]
    )

@app.get("/api/auth/me", response_model=UserOut)
async def get_me(current_user: Dict = Depends(require_current_user)):
    return UserOut(
        id=current_user["id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

# ════════════════════════════════════════════════════════════════════════════════
# CHATBOT CREATE & MANAGE
# ════════════════════════════════════════════════════════════════════════════════

@app.post("/api/chatbots/create")
async def create_chatbot_endpoint(
    company_name: str = Form(...),
    chatbot_name: str = Form(...),
    business_description: str = Form(""),
    instructions: str = Form(""),
    support_email: str = Form(""),
    support_phone: str = Form(""),
    whatsapp_number: Optional[str] = Form(""),
    working_hours: str = Form(""),
    urls: Optional[str] = Form("[]"),
    files: List[UploadFile] = File(default=[]),
    current_user: Optional[Dict] = Depends(get_current_user)
):
    try:
        try:
            parsed_urls = json.loads(urls) if urls else []
        except Exception:
            parsed_urls = [u.strip() for u in urls.split(",") if u.strip()]

        file_objs = []
        for file in files:
            content = await file.read()
            file_objs.append({"filename": file.filename, "content": content})

        text_contents = []
        if business_description.strip():
            text_contents.append(f"Business Overview for {company_name}:\n{business_description}")
        if instructions.strip():
            text_contents.append(f"Chatbot Rules & Custom Instructions:\n{instructions}")

        data = {
            "company_name": company_name,
            "chatbot_name": chatbot_name,
            "business_description": business_description,
            "instructions": instructions,
            "support_email": support_email,
            "support_phone": support_phone,
            "whatsapp_number": whatsapp_number or "",
            "working_hours": working_hours,
            "doc_count": len(file_objs) + len(parsed_urls)
        }

        user_id = current_user["id"] if current_user else None
        chatbot_id = save_chatbot(data, user_id=user_id)

        chunk_count = rag_engine.process_and_store_documents(
            chatbot_id=chatbot_id,
            files=file_objs,
            urls=parsed_urls,
            text_contents=text_contents
        )

        return {
            "success": True,
            "chatbot_id": chatbot_id,
            "doc_chunks": chunk_count,
            "message": f"Chatbot '{chatbot_name}' created successfully with {chunk_count} knowledge chunks!"
        }
    except Exception as e:
        print(f"Error creating chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chatbots/{chatbot_id}")
def get_chatbot_endpoint(chatbot_id: str):
    bot = get_chatbot(chatbot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    return {
        "id": bot["id"],
        "company_name": bot["company_name"],
        "chatbot_name": bot["chatbot_name"],
        "business_description": bot["business_description"],
        "instructions": bot["instructions"],
        "support_info": {
            "support_email": bot["support_email"],
            "support_phone": bot["support_phone"],
            "whatsapp_number": bot["whatsapp_number"],
            "working_hours": bot["working_hours"],
        },
        "doc_count": bot["doc_count"],
        "created_at": bot["created_at"]
    }

@app.put("/api/chatbots/{chatbot_id}")
async def update_chatbot_endpoint(
    chatbot_id: str,
    company_name: str = Form(""),
    chatbot_name: str = Form(""),
    business_description: str = Form(""),
    instructions: str = Form(""),
    support_email: str = Form(""),
    support_phone: str = Form(""),
    whatsapp_number: Optional[str] = Form(""),
    working_hours: str = Form(""),
    urls: Optional[str] = Form("[]"),
    files: List[UploadFile] = File(default=[]),
    current_user: Dict = Depends(require_current_user)
):
    bot = get_chatbot(chatbot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    if bot.get("user_id") and bot.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You don't own this chatbot.")

    try:
        parsed_urls = json.loads(urls) if urls else []
    except Exception:
        parsed_urls = [u.strip() for u in urls.split(",") if u.strip()]

    file_objs = []
    for file in files:
        content = await file.read()
        file_objs.append({"filename": file.filename, "content": content})

    text_contents = []
    if business_description.strip():
        text_contents.append(f"Business Overview for {company_name}:\n{business_description}")
    if instructions.strip():
        text_contents.append(f"Chatbot Rules & Custom Instructions:\n{instructions}")

    data = {
        "company_name": company_name or bot["company_name"],
        "chatbot_name": chatbot_name or bot["chatbot_name"],
        "business_description": business_description or bot["business_description"],
        "instructions": instructions or bot["instructions"],
        "support_email": support_email or bot["support_email"],
        "support_phone": support_phone or bot["support_phone"],
        "whatsapp_number": whatsapp_number or bot["whatsapp_number"],
        "working_hours": working_hours or bot["working_hours"],
        "doc_count": len(file_objs) + len(parsed_urls)
    }
    update_chatbot(chatbot_id, data)

    if file_objs or parsed_urls or text_contents:
        rag_engine.process_and_store_documents(
            chatbot_id=chatbot_id,
            files=file_objs,
            urls=parsed_urls,
            text_contents=text_contents
        )

    return {"success": True, "message": "Chatbot updated successfully."}

@app.delete("/api/chatbots/{chatbot_id}")
def delete_chatbot_endpoint(chatbot_id: str, current_user: Dict = Depends(require_current_user)):
    bot = get_chatbot(chatbot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    if bot.get("user_id") and bot.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You don't own this chatbot.")
    delete_chatbot(chatbot_id)
    return {"success": True, "message": "Chatbot deleted."}

# ════════════════════════════════════════════════════════════════════════════════
# CHAT ENDPOINT (Conversation-Based Grouping with 30-min Inactivity Expiry)
# ════════════════════════════════════════════════════════════════════════════════

@app.post("/api/chatbots/{chatbot_id}/chat")
def chat_endpoint(chatbot_id: str, req: ChatRequest):
    bot = get_chatbot(chatbot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")

    session_id = req.session_id
    user_message = req.message

    # 1. Format PRIOR chat history from memory
    chat_history_str = memory_manager.format_history_string(session_id)

    # 2. Contextualization Chain
    standalone_query = chains_pipeline.contextualize_question(user_message, chat_history_str)

    # 3. Dual-Query Hybrid RAG Retrieval (Search both standalone query AND original user message)
    chunks_standalone = rag_engine.retrieve_chunk_objects(chatbot_id, standalone_query, k=3)
    chunks_original = rag_engine.retrieve_chunk_objects(chatbot_id, user_message, k=3) if standalone_query.strip().lower() != user_message.strip().lower() else []
    
    # Combine & deduplicate chunk objects
    chunk_objs = []
    seen_contents = set()
    for chunk in (chunks_standalone + chunks_original):
        content_key = chunk["content"].strip()
        if content_key not in seen_contents:
            seen_contents.add(content_key)
            chunk_objs.append(chunk)

    context = "\n\n".join([f"[Source: {c['source']}]\n{c['content']}" for c in chunk_objs]) if chunk_objs else ""

    # 4. Save current user message to memory manager
    memory_manager.add_user_message(session_id, user_message)

    # 5. Response Generation Chain
    response: StructuredChatOutput = chains_pipeline.run_pipeline(
        user_query=user_message,
        standalone_query=standalone_query,
        context=context,
        instructions=bot["instructions"],
        company_name=bot["company_name"],
        chat_history=chat_history_str
    )

    # 6. Save AI Response into Memory
    memory_manager.add_ai_message(session_id, response.answer)

    # 7. Conversation-Based Data Model Grouping (30-minute inactivity window)
    try:
        active_conv = get_or_create_active_conversation(
            chatbot_id=chatbot_id,
            session_id=session_id,
            initial_user_message=user_message,
            category=response.category
        )

        summary_info = chains_pipeline.generate_conversation_summary(
            user_query=user_message,
            bot_response=response.answer,
            category=response.category
        )

        add_messages_to_conversation(
            conversation_id=active_conv["id"],
            user_msg=user_message,
            bot_msg=response.answer,
            category=response.category,
            confidence=response.confidence,
            need_escalation=response.need_human_support,
            summary=summary_info["summary"],
            title=summary_info["title"]
        )
    except Exception as e:
        print(f"Non-critical: conversation persistence error: {e}")

    # 8. Handle Lead auto-capture
    if response.is_lead and (response.lead_email or response.lead_phone):
        save_lead(
            chatbot_id=chatbot_id,
            name=response.lead_name or "Auto Captured Lead",
            email=response.lead_email or "N/A",
            phone=response.lead_phone or "",
            notes=f"Query: {user_message}"
        )

    return {
        "answer": response.answer,
        "confidence": response.confidence,
        "need_human_support": response.need_human_support,
        "category": response.category,
        "suggested_action": response.suggested_action,
        "is_lead": response.is_lead,
        "has_context": bool(context),
        "retrieved_chunks": chunk_objs,
        "standalone_question": standalone_query,
        "support_info": {
            "support_email": bot["support_email"],
            "support_phone": bot["support_phone"],
            "whatsapp_number": bot["whatsapp_number"],
            "working_hours": bot["working_hours"],
        } if response.need_human_support else None
    }

# ════════════════════════════════════════════════════════════════════════════════
# CONVERSATIONS & HISTORY ENDPOINTS (CONVERSATION-BASED)
# ════════════════════════════════════════════════════════════════════════════════

@app.get("/api/chatbots/{chatbot_id}/conversations")
def list_chatbot_conversations(
    chatbot_id: str,
    category: Optional[str] = None,
    escalated_only: bool = False,
    search: Optional[str] = None,
    current_user: Dict = Depends(require_current_user),
    limit: int = 100
):
    bot = get_chatbot(chatbot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    if bot.get("user_id") and bot.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    conversations = get_conversations_by_chatbot(
        chatbot_id=chatbot_id,
        category=category,
        escalated_only=escalated_only,
        search=search,
        limit=limit
    )
    stats = get_chatbot_conversation_stats(chatbot_id)
    return {"conversations": conversations, "stats": stats, "total": len(conversations)}

@app.get("/api/conversations/{conversation_id}")
def get_single_conversation(conversation_id: str, current_user: Dict = Depends(require_current_user)):
    conv = get_conversation_with_messages(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    bot = get_chatbot(conv["chatbot_id"])
    if bot and bot.get("user_id") and bot.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return conv

@app.get("/api/chatbots/{chatbot_id}/history")
def get_chat_history_legacy_alias(
    chatbot_id: str,
    category: Optional[str] = None,
    current_user: Dict = Depends(require_current_user),
    limit: int = 100
):
    return list_chatbot_conversations(
        chatbot_id=chatbot_id,
        category=category,
        current_user=current_user,
        limit=limit
    )

# ════════════════════════════════════════════════════════════════════════════════
# USER & DASHBOARD ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════════

@app.get("/api/users/me/chatbots")
def list_my_chatbots(current_user: Dict = Depends(require_current_user)):
    bots = get_chatbots_by_user(current_user["id"])
    return {"chatbots": bots}

@app.get("/api/users/me/stats")
def get_my_stats(current_user: Dict = Depends(require_current_user)):
    stats = get_dashboard_stats(current_user["id"])
    return stats

# ════════════════════════════════════════════════════════════════════════════════
# LEADS & WIDGET
# ════════════════════════════════════════════════════════════════════════════════

@app.post("/api/chatbots/{chatbot_id}/leads")
def submit_lead_endpoint(chatbot_id: str, req: LeadRequest):
    bot = get_chatbot(chatbot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    lead_id = save_lead(chatbot_id, req.name, req.email, req.phone, req.notes)
    return {"success": True, "lead_id": lead_id}

@app.get("/api/chatbots/{chatbot_id}/leads")
def list_leads_endpoint(chatbot_id: str):
    leads = get_leads(chatbot_id)
    return {"leads": leads}

@app.get("/api/chatbots/{chatbot_id}/widget.js")
def get_widget_script(chatbot_id: str, host: str = "http://localhost:3000"):
    script = f"""
(function() {{
    if (document.getElementById('kalemly-widget-iframe')) return;
    var container = document.createElement('div');
    container.id = 'kalemly-widget-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;';
    var iframe = document.createElement('iframe');
    iframe.id = 'kalemly-widget-iframe';
    iframe.src = '{host}/embed/{chatbot_id}';
    iframe.style.cssText = 'width:420px;height:680px;border:none;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.3);';
    container.appendChild(iframe);
    document.body.appendChild(container);
}})();
"""
    return Response(content=script, media_type="application/javascript")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
