import sqlite3
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List

DB_PATH = "kalemly.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # ── Users table ─────────────────────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # ── Chatbots table ──────────────────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chatbots (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            company_name TEXT NOT NULL,
            chatbot_name TEXT NOT NULL,
            business_description TEXT,
            instructions TEXT,
            support_email TEXT,
            support_phone TEXT,
            whatsapp_number TEXT,
            working_hours TEXT,
            doc_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    try:
        cursor.execute("ALTER TABLE chatbots ADD COLUMN user_id TEXT")
    except Exception:
        pass

    # ── Leads table ─────────────────────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            chatbot_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (chatbot_id) REFERENCES chatbots (id)
        )
    """)

    # Check if existing conversations table is from old flat message-based schema
    cursor.execute("PRAGMA table_info(conversations)")
    cols = [r[1] for r in cursor.fetchall()]
    if "user_message" in cols:
        cursor.execute("DROP TABLE conversations")

    # ── Conversations table (Grouped customer sessions) ──────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            chatbot_id TEXT NOT NULL,
            session_id TEXT NOT NULL,
            title TEXT,
            summary TEXT,
            category TEXT DEFAULT 'general',
            total_messages INTEGER DEFAULT 0,
            confidence REAL DEFAULT 0.0,
            need_escalation INTEGER DEFAULT 0,
            started_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (chatbot_id) REFERENCES chatbots (id)
        )
    """)

    # ── Messages table (Child turns within a conversation) ─────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT,
            confidence REAL,
            need_escalation INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
    """)

    # Seed default demo bots
    demo_bots = [
        ("demo-bot-123", "Acme Corp", "Acme Support Bot", "Acme Corp SaaS Solutions",
         "Speak Arabic & English politely.", "support@acme.com", "+1 (800) 555-0199",
         "+18005550199", "Mon-Fri 9AM-6PM", 5),
        ("demo-bot", "KalemlyAI Demo", "Kalemly AI Assistant", "AI Chatbot Builder SaaS Platform",
         "Always answer accurately based on company documents.", "support@kalemly.ai",
         "+1 (800) 123-4567", "+18001234567", "Mon-Sun 24/7", 10)
    ]
    for bot in demo_bots:
        cursor.execute("SELECT id FROM chatbots WHERE id = ?", (bot[0],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO chatbots (id, user_id, company_name, chatbot_name, business_description,
                    instructions, support_email, support_phone, whatsapp_number, working_hours,
                    doc_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (bot[0], None, bot[1], bot[2], bot[3], bot[4], bot[5], bot[6], bot[7], bot[8],
                  bot[9], datetime.utcnow().isoformat()))

    conn.commit()
    conn.close()

# ── User CRUD ────────────────────────────────────────────────────────────────────

def create_user(full_name: str, email: str, password_hash: str) -> str:
    user_id = str(uuid.uuid4())
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (id, full_name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, full_name, email, password_hash, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return user_id

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# ── Chatbot CRUD ─────────────────────────────────────────────────────────────────

def save_chatbot(data: dict, user_id: Optional[str] = None) -> str:
    chatbot_id = str(uuid.uuid4())[:8]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO chatbots (id, user_id, company_name, chatbot_name, business_description,
            instructions, support_email, support_phone, whatsapp_number, working_hours,
            doc_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        chatbot_id,
        user_id,
        data.get("company_name"),
        data.get("chatbot_name"),
        data.get("business_description"),
        data.get("instructions"),
        data.get("support_email"),
        data.get("support_phone"),
        data.get("whatsapp_number", ""),
        data.get("working_hours"),
        data.get("doc_count", 0),
        datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()
    return chatbot_id

def get_chatbot(chatbot_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chatbots WHERE id = ?", (chatbot_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "id": chatbot_id, "user_id": None,
        "company_name": "Kalemly Customer Care",
        "chatbot_name": "AI Support Assistant",
        "business_description": "AI Customer Care Solutions",
        "instructions": "Always reply professionally.",
        "support_email": "support@kalemly.ai",
        "support_phone": "+1 (800) 555-0199",
        "whatsapp_number": "+18005550199",
        "working_hours": "Mon-Fri 9:00 AM - 6:00 PM",
        "doc_count": 0,
        "created_at": datetime.utcnow().isoformat()
    }

def get_chatbots_by_user(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM chatbots WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_chatbot(chatbot_id: str, data: dict) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE chatbots SET
            company_name = ?,
            chatbot_name = ?,
            business_description = ?,
            instructions = ?,
            support_email = ?,
            support_phone = ?,
            whatsapp_number = ?,
            working_hours = ?,
            doc_count = ?
        WHERE id = ?
    """, (
        data.get("company_name"),
        data.get("chatbot_name"),
        data.get("business_description"),
        data.get("instructions"),
        data.get("support_email"),
        data.get("support_phone"),
        data.get("whatsapp_number", ""),
        data.get("working_hours"),
        data.get("doc_count", 0),
        chatbot_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_chatbot(chatbot_id: str) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chatbots WHERE id = ?", (chatbot_id,))
    cursor.execute("DELETE FROM conversations WHERE chatbot_id = ?", (chatbot_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

# ── Conversation & Messages CRUD (Conversation-Based Model) ───────────────────

def get_or_create_active_conversation(
    chatbot_id: str,
    session_id: str,
    initial_user_message: str,
    category: str = "general"
) -> Dict[str, Any]:
    """Finds an active conversation for (chatbot_id, session_id) active within 30 min (1800s), else creates a new one."""
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow()
    now_iso = now.isoformat()
    
    cursor.execute("""
        SELECT * FROM conversations
        WHERE chatbot_id = ? AND session_id = ?
        ORDER BY updated_at DESC LIMIT 1
    """, (chatbot_id, session_id))
    row = cursor.fetchone()
    
    if row:
        conv = dict(row)
        try:
            last_time_str = conv.get("updated_at") or conv.get("started_at")
            if last_time_str:
                last_time = datetime.fromisoformat(last_time_str.replace("Z", ""))
                diff_seconds = (now - last_time).total_seconds()
                # Active within 30 minutes (1800s) -> reuse conversation
                if diff_seconds < 1800:
                    conn.close()
                    return conv
        except Exception as e:
            print(f"Error parsing timestamp for session active check: {e}")

    # Create NEW conversation
    conv_id = f"conv_{str(uuid.uuid4())[:12]}"
    title = f"{category.replace('_', ' ').title()} Inquiry"
    summary = f"Customer inquired about: {initial_user_message[:60]}"
    
    cursor.execute("""
        INSERT INTO conversations (
            id, chatbot_id, session_id, title, summary, category,
            total_messages, confidence, need_escalation, started_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0.0, 0, ?, ?)
    """, (conv_id, chatbot_id, session_id, title, summary, category, now_iso, now_iso))
    
    conn.commit()
    cursor.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
    new_conv = dict(cursor.fetchone())
    conn.close()
    return new_conv

def add_messages_to_conversation(
    conversation_id: str,
    user_msg: str,
    bot_msg: str,
    category: str = "general",
    confidence: float = 0.0,
    need_escalation: bool = False,
    summary: Optional[str] = None,
    title: Optional[str] = None
):
    """Appends user and bot messages to messages table and updates conversation metadata."""
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat()
    
    # 1. Insert user message
    user_msg_id = f"msg_{str(uuid.uuid4())[:12]}"
    cursor.execute("""
        INSERT INTO messages (id, conversation_id, sender, content, category, confidence, need_escalation, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_msg_id, conversation_id, "user", user_msg, category, confidence, 0, now_iso))
    
    # 2. Insert bot response message
    bot_msg_id = f"msg_{str(uuid.uuid4())[:12]}"
    esc_flag = 1 if need_escalation else 0
    cursor.execute("""
        INSERT INTO messages (id, conversation_id, sender, content, category, confidence, need_escalation, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (bot_msg_id, conversation_id, "bot", bot_msg, category, confidence, esc_flag, now_iso))
    
    # 3. Update parent conversation metadata
    cursor.execute("SELECT total_messages, need_escalation, title, summary, category FROM conversations WHERE id = ?", (conversation_id,))
    conv_row = cursor.fetchone()
    
    current_count = conv_row["total_messages"] if conv_row and conv_row["total_messages"] is not None else 0
    current_esc = conv_row["need_escalation"] if conv_row and conv_row["need_escalation"] is not None else 0
    
    new_count = current_count + 2
    new_esc = max(current_esc, esc_flag)
    
    cat_to_save = category if category != "general" else (conv_row["category"] if conv_row and conv_row["category"] else "general")
    update_title = title if title else (conv_row["title"] if conv_row and conv_row["title"] else f"{cat_to_save.replace('_', ' ').title()} Inquiry")
    update_summary = summary if summary else (conv_row["summary"] if conv_row and conv_row["summary"] else f"Customer message: {user_msg[:60]}")
    
    cursor.execute("""
        UPDATE conversations SET
            total_messages = ?,
            need_escalation = ?,
            category = ?,
            confidence = ?,
            updated_at = ?,
            title = ?,
            summary = ?
        WHERE id = ?
    """, (new_count, new_esc, cat_to_save, confidence, now_iso, update_title, update_summary, conversation_id))
    
    conn.commit()
    conn.close()

def get_conversations_by_chatbot(
    chatbot_id: str,
    category: Optional[str] = None,
    escalated_only: bool = False,
    search: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM conversations WHERE chatbot_id = ?"
    params: List[Any] = [chatbot_id]
    
    if category and category != "all":
        if category == "escalated":
            query += " AND need_escalation = 1"
        else:
            query += " AND category = ?"
            params.append(category)
            
    if escalated_only and category != "escalated":
        query += " AND need_escalation = 1"
        
    if search and search.strip():
        query += " AND (title LIKE ? OR summary LIKE ?)"
        params.extend([f"%{search.strip()}%", f"%{search.strip()}%"])
        
    query += " ORDER BY updated_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_conversation_with_messages(conversation_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
    conv_row = cursor.fetchone()
    if not conv_row:
        conn.close()
        return None
        
    conv = dict(conv_row)
    
    cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", (conversation_id,))
    msg_rows = cursor.fetchall()
    conn.close()
    
    conv["messages"] = [dict(r) for r in msg_rows]
    return conv

def get_chatbot_conversation_stats(chatbot_id: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM conversations WHERE chatbot_id = ?", (chatbot_id,))
    total = cursor.fetchone()[0]

    today = datetime.utcnow().date().isoformat()
    cursor.execute("""
        SELECT COUNT(*) FROM conversations
        WHERE chatbot_id = ? AND (updated_at LIKE ? OR started_at LIKE ?)
    """, (chatbot_id, f"{today}%", f"{today}%"))
    today_cnt = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM conversations WHERE chatbot_id = ? AND category = 'refund'", (chatbot_id,))
    refund_cnt = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM conversations WHERE chatbot_id = ? AND category = 'complaint'", (chatbot_id,))
    complaint_cnt = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM conversations WHERE chatbot_id = ? AND need_escalation = 1", (chatbot_id,))
    escalations = cursor.fetchone()[0]

    cursor.execute("""
        SELECT category, COUNT(*) as cnt FROM conversations
        WHERE chatbot_id = ?
        GROUP BY category ORDER BY cnt DESC LIMIT 1
    """, (chatbot_id,))
    top_cat_row = cursor.fetchone()
    most_asked_category = top_cat_row["category"].replace("_", " ").title() if top_cat_row and top_cat_row["category"] else "General Inquiry"

    cursor.execute("SELECT AVG(total_messages) FROM conversations WHERE chatbot_id = ?", (chatbot_id,))
    avg_msgs = cursor.fetchone()[0] or 0.0

    conn.close()
    return {
        "total_conversations": total,
        "today_conversations": today_cnt,
        "refund_requests": refund_cnt,
        "complaints": complaint_cnt,
        "human_escalations": escalations,
        "most_asked_category": most_asked_category,
        "avg_messages": round(avg_msgs, 1)
    }

def get_dashboard_stats(user_id: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM chatbots WHERE user_id = ?", (user_id,))
    total_bots = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM conversations
        WHERE chatbot_id IN (SELECT id FROM chatbots WHERE user_id = ?)
    """, (user_id,))
    total_conversations = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM conversations
        WHERE chatbot_id IN (SELECT id FROM chatbots WHERE user_id = ?)
        AND need_escalation = 1
    """, (user_id,))
    total_escalations = cursor.fetchone()[0]

    today = datetime.utcnow().date().isoformat()
    cursor.execute("""
        SELECT COUNT(*) FROM conversations
        WHERE chatbot_id IN (SELECT id FROM chatbots WHERE user_id = ?)
        AND (updated_at LIKE ? OR started_at LIKE ?)
    """, (user_id, f"{today}%", f"{today}%"))
    active_today = cursor.fetchone()[0]

    cursor.execute("""
        SELECT AVG(total_messages) FROM conversations
        WHERE chatbot_id IN (SELECT id FROM chatbots WHERE user_id = ?)
    """, (user_id,))
    avg_msgs = cursor.fetchone()[0] or 0.0

    cursor.execute("""
        SELECT category, COUNT(*) as cnt FROM conversations
        WHERE chatbot_id IN (SELECT id FROM chatbots WHERE user_id = ?)
        GROUP BY category ORDER BY cnt DESC LIMIT 1
    """, (user_id,))
    top_cat_row = cursor.fetchone()
    most_asked_category = top_cat_row["category"].replace("_", " ").title() if top_cat_row and top_cat_row["category"] else "General Inquiry"

    cursor.execute("""
        SELECT c.*, cb.chatbot_name, cb.company_name
        FROM conversations c
        JOIN chatbots cb ON c.chatbot_id = cb.id
        WHERE cb.user_id = ?
        ORDER BY c.updated_at DESC
        LIMIT 10
    """, (user_id,))
    recent_chats = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "total_bots": total_bots,
        "total_conversations": total_conversations,
        "total_escalations": total_escalations,
        "active_today": active_today,
        "avg_messages_per_conversation": round(avg_msgs, 1),
        "most_asked_category": most_asked_category,
        "recent_chats": recent_chats
    }

# ── Leads CRUD ───────────────────────────────────────────────────────────────────

def save_lead(chatbot_id: str, name: str, email: str, phone: str = "", notes: str = "") -> str:
    lead_id = str(uuid.uuid4())[:8]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO leads (id, chatbot_id, name, email, phone, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (lead_id, chatbot_id, name, email, phone, notes, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return lead_id

def get_leads(chatbot_id: str) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads WHERE chatbot_id = ? ORDER BY created_at DESC", (chatbot_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
