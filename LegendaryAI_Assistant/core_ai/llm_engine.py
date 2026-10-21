import requests
import json
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

@dataclass
class AIResponse:
    content: str
    reasoning: str
    tokens_used: int

class CoreAI:
    def __init__(self, model: str = "llama2", ollama_url: str = "http://localhost:11434"):
        self.model = model
        self.ollama_url = ollama_url
        self.context_window = []
        self.max_context = 10
        self.training_data = []
        
    def _check_ollama(self) -> bool:
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available Ollama models"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model["name"] for model in data.get("models", [])]
            return []
        except:
            return []
    
    def pull_model(self, model_name: str) -> bool:
        """Pull a new model from Ollama registry"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/pull",
                json={"name": model_name},
                timeout=300
            )
            return response.status_code == 200
        except:
            return False
    
    def add_training_data(self, prompt: str, response: str, context: str = ""):
        """Add training data for context-aware responses"""
        self.training_data.append({
            "prompt": prompt,
            "response": response,
            "context": context
        })
        
        # Keep only recent training data
        if len(self.training_data) > 100:
            self.training_data = self.training_data[-100:]
    
    def get_training_context(self) -> str:
        """Get formatted training context for prompts"""
        if not self.training_data:
            return ""
        
        context_lines = []
        for data in self.training_data[-10:]:  # Use last 10 training examples
            context_lines.append(f"Q: {data['prompt']}")
            context_lines.append(f"A: {data['response']}")
            if data['context']:
                context_lines.append(f"Context: {data['context']}")
            context_lines.append("")
        
        return "\n".join(context_lines)
    
    def reason(self, prompt: str, system_prompt: Optional[str] = None) -> AIResponse:
        if not self._check_ollama():
            raise RuntimeError(f"Ollama not running at {self.ollama_url}")
        
        messages = []
        
        # Add system prompt with training context
        training_context = self.get_training_context()
        enhanced_system_prompt = system_prompt or "You are a helpful AI assistant."
        
        if training_context:
            enhanced_system_prompt += f"\n\nPrevious training examples:\n{training_context}"
        
        messages.append({"role": "system", "content": enhanced_system_prompt})
        
        # Add conversation context
        messages.extend(self.context_window)
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_ctx": 4096
                    }
                },
                timeout=300
            )
            response.raise_for_status()
            data = response.json()
            
            content = data.get("message", {}).get("content", "")
            tokens = data.get("eval_count", 0)
            
            # Update context window
            self.context_window.append({"role": "user", "content": prompt})
            self.context_window.append({"role": "assistant", "content": content})
            
            # Trim context window
            if len(self.context_window) > self.max_context * 2:
                self.context_window = self.context_window[-self.max_context * 2:]
            
            return AIResponse(
                content=content,
                reasoning=content,
                tokens_used=tokens
            )
        except Exception as e:
            raise RuntimeError(f"LLM inference failed: {str(e)}")
    
    def generate_simple(self, prompt: str, max_tokens: int = 1000) -> str:
        """Simple generation without context management"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": 0.7
                    }
                },
                timeout=300
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            raise RuntimeError(f"Simple generation failed: {str(e)}")
    
    def parse_json_response(self, response: AIResponse) -> Dict[str, Any]:
        try:
            # Try to extract JSON from response
            content = response.content.strip()
            
            # Look for JSON blocks
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                if end != -1:
                    content = content[start:end].strip()
            elif "{" in content and "}" in content:
                start = content.find("{")
                end = content.rfind("}") + 1
                content = content[start:end]
            
            return json.loads(content)
        except:
            return {"raw": response.content}
    
    def clear_context(self):
        self.context_window = []
    
    def set_model(self, model_name: str):
        """Switch to a different Ollama model"""
        available_models = self.get_available_models()
        if model_name in available_models:
            self.model = model_name
            return True
        return False
