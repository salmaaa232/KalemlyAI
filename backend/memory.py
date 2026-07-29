from typing import Dict, List, Any
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage

class ConversationMemoryManager:
    def __init__(self, max_messages: int = 10):
        self.memories: Dict[str, List[BaseMessage]] = {}
        self.max_messages = max_messages

    def get_history(self, session_id: str) -> List[BaseMessage]:
        return self.memories.get(session_id, [])

    def add_user_message(self, session_id: str, message: str):
        if session_id not in self.memories:
            self.memories[session_id] = []
        self.memories[session_id].append(HumanMessage(content=message))
        self._trim_history(session_id)

    def add_ai_message(self, session_id: str, message: str):
        if session_id not in self.memories:
            self.memories[session_id] = []
        self.memories[session_id].append(AIMessage(content=message))
        self._trim_history(session_id)

    def _trim_history(self, session_id: str):
        if len(self.memories[session_id]) > self.max_messages * 2:
            self.memories[session_id] = self.memories[session_id][-self.max_messages * 2:]

    def format_history_string(self, session_id: str) -> str:
        messages = self.get_history(session_id)
        formatted = []
        for msg in messages:
            role = "User" if isinstance(msg, HumanMessage) else "Assistant"
            formatted.append(f"{role}: {msg.content}")
        return "\n".join(formatted)

memory_manager = ConversationMemoryManager()
