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
            theme_mode TEXT DEFAULT 'dark',
            primary_color TEXT DEFAULT '#253745',
            welcome_message TEXT DEFAULT '',
            doc_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    for col_def in [
        ("user_id", "TEXT"),
        ("theme_mode", "TEXT DEFAULT 'dark'"),
        ("primary_color", "TEXT DEFAULT '#253745'"),
        ("welcome_message", "TEXT DEFAULT ''"),
    ]:
        try:
            cursor.execute(f"ALTER TABLE chatbots ADD COLUMN {col_def[0]} {col_def[1]}")
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
         "+18005550199", "Mon-Fri 9AM-6PM", 5, "dark", "#253745", "Hello! Welcome to Acme Support Bot. How can I help you today?"),
        ("demo-bot", "KalemlyAI Demo", "Kalemly AI Assistant", "AI Chatbot Builder SaaS Platform",
         "Always answer accurately based on company documents.", "support@kalemly.ai",
         "+1 (800) 123-4567", "+18001234567", "Mon-Sun 24/7", 10, "dark", "#253745", "Hello! Welcome to KalemlyAI Demo Assistant. Ask me anything about our features or return policy!")
    ]
    for bot in demo_bots:
        cursor.execute("SELECT id FROM chatbots WHERE id = ?", (bot[0],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO chatbots (id, user_id, company_name, chatbot_name, business_description,
                    instructions, support_email, support_phone, whatsapp_number, working_hours,
                    doc_count, theme_mode, primary_color, welcome_message, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (bot[0], None, bot[1], bot[2], bot[3], bot[4], bot[5], bot[6], bot[7], bot[8],
                  bot[9], bot[10], bot[11], bot[12], datetime.utcnow().isoformat()))

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
            theme_mode, primary_color, welcome_message, doc_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        data.get("theme_mode", "dark"),
        data.get("primary_color", "#253745"),
        data.get("welcome_message", ""),
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
        res = dict(row)
        if not res.get("theme_mode"): res["theme_mode"] = "dark"
        if not res.get("primary_color"): res["primary_color"] = "#253745"
        return res
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
        "theme_mode": "dark",
        "primary_color": "#253745",
        "welcome_message": "Hello! How can I assist you today?",
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
    res_list = []
    for r in rows:
        d = dict(r)
        if not d.get("theme_mode"): d["theme_mode"] = "dark"
        if not d.get("primary_color"): d["primary_color"] = "#253745"
        res_list.append(d)
    return res_list

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
            theme_mode = ?,
            primary_color = ?,
            welcome_message = ?,
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
        data.get("theme_mode", "dark"),
        data.get("primary_color", "#253745"),
        data.get("welcome_message", ""),
        data.get("doc_count", 0),
        chatbot_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0
