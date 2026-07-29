import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db").strip()
DATABASE_URL = os.getenv("DATABASE_URL", "./kalemly.db").strip()
PORT = int(os.getenv("PORT", "8000"))
