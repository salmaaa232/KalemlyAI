from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any

class SupportInfo(BaseModel):
    support_email: str = Field(default="", description="Support Email Address")
    support_phone: str = Field(default="", description="Support Phone Number")
    whatsapp_number: Optional[str] = Field(default="", description="WhatsApp Number")
    working_hours: str = Field(default="", description="Support Working Hours")

class ChatbotCreateRequest(BaseModel):
    company_name: str
    chatbot_name: str
    business_description: str
    instructions: str
    support_email: str
    support_phone: str
    whatsapp_number: Optional[str] = ""
    working_hours: str
    urls: List[str] = []

class ChunkInfo(BaseModel):
    source: str = Field(description="Filename or URL source of document chunk")
    content: str = Field(description="Extracted text chunk content")

class StructuredChatOutput(BaseModel):
    answer: str = Field(description="The response answer to the user query")
    confidence: float = Field(description="Confidence percentage score from 0 to 100")
    need_human_support: bool = Field(description="Whether human escalation is required")
    category: str = Field(description="Query intent category: product_inquiry, refund, complaint, technical_support, order_info, general, human_support, unknown")
    suggested_action: str = Field(description="Next suggested step or action for the user")
    is_lead: bool = Field(default=False, description="Whether potential lead contact information was detected")
    lead_name: Optional[str] = Field(default=None, description="Extracted lead name if any")
    lead_email: Optional[str] = Field(default=None, description="Extracted lead email if any")
    lead_phone: Optional[str] = Field(default=None, description="Extracted lead phone if any")

class ChatRequest(BaseModel):
    session_id: str
    message: str

class LeadRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    notes: Optional[str] = ""

class ChatbotResponse(BaseModel):
    id: str
    company_name: str
    chatbot_name: str
    business_description: str
    instructions: str
    support_info: SupportInfo
    doc_count: int
    created_at: str

# ── Auth Schemas ─────────────────────────────────────────────────────────────────

class UserSignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="User's full name")
    email: str = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str
    email: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    created_at: str

# ── Chatbot Update Schema ─────────────────────────────────────────────────────────

class ChatbotUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    chatbot_name: Optional[str] = None
    business_description: Optional[str] = None
    instructions: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    working_hours: Optional[str] = None
