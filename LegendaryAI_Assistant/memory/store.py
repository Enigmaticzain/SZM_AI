import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

class MemoryStore:
    def __init__(self, storage_path: str = "./memory_store"):
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
        self.short_term = []
        self.long_term_index = {}
        self.max_short_term = 50
        
    def add_short_term(self, key: str, value: Any, metadata: Optional[Dict] = None):
        entry = {
            "key": key,
            "value": value,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.short_term.append(entry)
        
        if len(self.short_term) > self.max_short_term:
            self.short_term.pop(0)
    
    def get_short_term(self, key: str) -> Optional[Any]:
        for entry in reversed(self.short_term):
            if entry["key"] == key:
                return entry["value"]
        return None
    
    def save_long_term(self, category: str, data: Dict[str, Any]):
        file_path = os.path.join(self.storage_path, f"{category}.json")
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)
        self.long_term_index[category] = file_path
    
    def load_long_term(self, category: str) -> Optional[Dict]:
        file_path = os.path.join(self.storage_path, f"{category}.json")
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                return json.load(f)
        return None
    
    def search_context(self, query: str, limit: int = 5) -> List[Dict]:
        results = []
        query_lower = query.lower()
        
        for entry in reversed(self.short_term):
            if query_lower in str(entry["value"]).lower():
                results.append(entry)
                if len(results) >= limit:
                    break
        
        return results
    
    def get_context_summary(self) -> str:
        if not self.short_term:
            return "No recent context"
        
        recent = self.short_term[-5:]
        summary = "Recent context:\n"
        for entry in recent:
            summary += f"- {entry['key']}: {str(entry['value'])[:100]}\n"
        return summary
