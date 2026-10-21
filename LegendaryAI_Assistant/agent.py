import json
import requests
from typing import Dict, Any, Optional
from core_ai.llm_engine import CoreAI
from memory.store import MemoryStore
from executor.task_runner import TaskExecutor
from device_control.system_monitor import DeviceControl

class LegendaryAgent:
    def __init__(self, model: str = "llama2", enable_web_search: bool = True, unsloth_url: str = "http://localhost:8000"):
        self.llm = CoreAI(model=model)
        self.memory = MemoryStore()
        self.executor = TaskExecutor(safe_mode=True)
        self.device = DeviceControl()
        self.max_iterations = 5
        self.current_iteration = 0
        self.enable_web_search = enable_web_search
        self.unsloth_url = unsloth_url
        
    def check_unsloth_server(self) -> Dict[str, Any]:
        """Check if Unsloth training server is available"""
        try:
            response = requests.get(f"{self.unsloth_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "status": data.get("status"),
                    "unsloth_available": data.get("unsloth_available", False)
                }
            else:
                return {"success": False, "error": f"Server responded with {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": f"Connection failed: {str(e)}"}
    
    def prepare_training_data_for_unsloth(self) -> Dict[str, Any]:
        """Convert memory data to Unsloth training format"""
        try:
            training_data = []
            
            # Get recent memory entries
            recent_entries = self.memory.short_term[-50:]  # Last 50 entries
            
            for entry in recent_entries:
                if entry["key"] in ["task_result", "execution", "web_search"]:
                    # Create instruction-response pairs
                    if entry["key"] == "task_result":
                        training_data.append({
                            "instruction": "Complete the given task efficiently",
                            "input": "Task execution request",
                            "output": str(entry["value"])
                        })
                    elif entry["key"] == "execution":
                        exec_data = entry["value"]
                        if isinstance(exec_data, dict) and exec_data.get("success"):
                            training_data.append({
                                "instruction": "Execute the given command",
                                "input": exec_data.get("command", ""),
                                "output": exec_data.get("output", "")[:500]  # Limit output length
                            })
                    elif entry["key"] == "web_search":
                        training_data.append({
                            "instruction": "Provide current information from web search",
                            "input": "Web search query",
                            "output": str(entry["value"])[:500]
                        })
            
            return {
                "success": True,
                "data": training_data,
                "count": len(training_data)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def start_unsloth_training(self, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """Start Unsloth fine-tuning with agent's memory data"""
        try:
            # Check server availability
            server_check = self.check_unsloth_server()
            if not server_check["success"]:
                return {"success": False, "error": f"Unsloth server not available: {server_check['error']}"}
            
            # Prepare training data
            data_prep = self.prepare_training_data_for_unsloth()
            if not data_prep["success"] or data_prep["count"] == 0:
                return {"success": False, "error": "No suitable training data available"}
            
            # Prepare dataset on server
            dataset_response = requests.post(
                f"{self.unsloth_url}/prepare-dataset",
                json={"data": data_prep["data"], "format": "alpaca"},
                timeout=30
            )
            
            if dataset_response.status_code != 200:
                return {"success": False, "error": "Dataset preparation failed"}
            
            dataset_info = dataset_response.json()
            
            # Default training config
            default_config = {
                "model_name": "unsloth/llama-2-7b-bnb-4bit",
                "max_seq_length": 2048,
                "learning_rate": 2e-4,
                "num_train_epochs": 1,
                "per_device_train_batch_size": 2,
                "max_steps": min(60, data_prep["count"] * 2),  # Adaptive steps
                "output_dir": "./szm_unsloth_outputs"
            }
            
            if config:
                default_config.update(config)
            
            # Start training
            training_response = requests.post(
                f"{self.unsloth_url}/start-training",
                json={
                    "config": default_config,
                    "dataset_id": dataset_info["dataset_id"]
                },
                timeout=30
            )
            
            if training_response.status_code != 200:
                return {"success": False, "error": "Training start failed"}
            
            training_info = training_response.json()
            
            # Store training info in memory
            self.memory.add_short_term("unsloth_training", {
                "training_id": training_info["training_id"],
                "dataset_id": dataset_info["dataset_id"],
                "config": default_config,
                "started_at": json.dumps({"timestamp": "now"})
            })
            
            return {
                "success": True,
                "training_id": training_info["training_id"],
                "dataset_size": dataset_info["size"],
                "config": default_config
            }
            
        except Exception as e:
            return {"success": False, "error": f"Training initiation failed: {str(e)}"}
    
    def get_unsloth_training_status(self, training_id: str = None) -> Dict[str, Any]:
        """Get status of Unsloth training"""
        try:
            if not training_id:
                # Get from memory
                training_info = self.memory.get_short_term("unsloth_training")
                if not training_info or not isinstance(training_info, dict):
                    return {"success": False, "error": "No active training session found"}
                training_id = training_info.get("training_id")
            
            response = requests.get(f"{self.unsloth_url}/training-status/{training_id}", timeout=10)
            
            if response.status_code == 200:
                return {"success": True, "status": response.json()}
            else:
                return {"success": False, "error": f"Status check failed: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"Status check error: {str(e)}"}
        
    def web_search(self, query: str) -> Dict[str, Any]:
        """Perform web search using DuckDuckGo API"""
        if not self.enable_web_search:
            return {"success": False, "error": "Web search disabled"}
            
        try:
            search_url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
            response = requests.get(search_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = []
                
                if data.get("Answer"):
                    results.append({
                        "title": "Instant Answer",
                        "content": data["Answer"],
                        "url": data.get("AnswerURL", "")
                    })
                
                if data.get("Abstract"):
                    results.append({
                        "title": data.get("Heading", "Abstract"),
                        "content": data["Abstract"],
                        "url": data.get("AbstractURL", "")
                    })
                
                # Add related topics
                for topic in data.get("RelatedTopics", [])[:3]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        results.append({
                            "title": topic["Text"].split(" - ")[0],
                            "content": topic["Text"],
                            "url": topic.get("FirstURL", "")
                        })
                
                return {"success": True, "results": results}
            else:
                return {"success": False, "error": f"Search failed: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"Search error: {str(e)}"}
    
    def execute_task(self, task: str, debug: bool = False) -> Dict[str, Any]:
        self.current_iteration = 0
        self.llm.clear_context()
        
        if debug:
            print(f"[AGENT] Starting task: {task}")

        # Auto web search for current information
        web_context = ""
        if self.enable_web_search and any(keyword in task.lower() for keyword in ["latest", "current", "new", "update", "recent", "train", "unsloth"]):
            if debug:
                print("[AGENT] Performing web search for current information")
            search_result = self.web_search(task)
            if search_result["success"]:
                web_context = "\n".join([f"{r['title']}: {r['content']}" for r in search_result["results"]])
                self.memory.add_short_term("web_search", web_context)

        # Check for Unsloth training requests
        if any(keyword in task.lower() for keyword in ["train", "fine-tune", "unsloth", "model training"]):
            if debug:
                print("[AGENT] Detected training request, checking Unsloth availability")
            
            unsloth_status = self.check_unsloth_server()
            if unsloth_status["success"]:
                if "start" in task.lower() or "begin" in task.lower():
                    training_result = self.start_unsloth_training()
                    if training_result["success"]:
                        return {
                            "success": True,
                            "result": f"Unsloth training started successfully. Training ID: {training_result['training_id']}, Dataset size: {training_result['dataset_size']} examples",
                            "iterations": 1,
                            "training_info": training_result
                        }
                elif "status" in task.lower() or "progress" in task.lower():
                    status_result = self.get_unsloth_training_status()
                    if status_result["success"]:
                        status = status_result["status"]
                        return {
                            "success": True,
                            "result": f"Training status: {status['status']}, Progress: {status['progress']:.1f}%, Step: {status['current_step']}/{status['total_steps']}",
                            "iterations": 1,
                            "training_status": status
                        }

        try:
            while self.current_iteration < self.max_iterations:
                self.current_iteration += 1
                
                if debug:
                    print(f"\n[ITERATION {self.current_iteration}]")
                
                if not self.device.can_execute_task():
                    return {
                        "success": False,
                        "error": "System resources exhausted",
                        "resources": self.device.get_resource_status()
                    }
                
                context = self.memory.get_context_summary()
                system_prompt = f"""You are Legendary AI, an autonomous agent with advanced capabilities:
- Ollama integration for local AI models
- Web search for current information  
- Unsloth integration for model fine-tuning
- Memory persistence and learning

Current system resources:
{json.dumps(self.device.get_resource_status(), indent=2)}

{context}

{f"Web search results: {web_context}" if web_context else ""}

Available actions: reason, execute, complete, error, web_search, train_model

Respond in JSON format with:
{{"action": "reason|execute|complete|error|web_search|train_model", "content": "...", "command": "..." (if execute), "query": "..." (if web_search)}}"""

                response = self.llm.reason(task, system_prompt)
                
                if debug:
                    print(f"[LLM] {response.content[:200]}")
                
                try:
                    action_data = self.llm.parse_json_response(response)
                except:
                    action_data = {"action": "error", "content": response.content}
                
                action = action_data.get("action", "error")
                
                if action == "complete":
                    self.memory.add_short_term("task_result", action_data.get("content"))
                    return {
                        "success": True,
                        "result": action_data.get("content"),
                        "iterations": self.current_iteration
                    }
                
                elif action == "train_model":
                    if debug:
                        print("[AGENT] Starting Unsloth training")
                    training_result = self.start_unsloth_training()
                    if training_result["success"]:
                        self.memory.add_short_term("training_started", training_result)
                        task = f"Unsloth training started: {training_result}. Continue with task: {task}"
                    else:
                        task = f"Training failed: {training_result['error']}. Continue with task: {task}"
                
                elif action == "web_search":
                    query = action_data.get("query", task)
                    if debug:
                        print(f"[WEB_SEARCH] {query}")
                    
                    search_result = self.web_search(query)
                    if search_result["success"]:
                        web_info = "\n".join([f"{r['title']}: {r['content']}" for r in search_result["results"]])
                        self.memory.add_short_term("web_search", web_info)
                        task = f"Web search results: {web_info}. Continue with task: {task}"
                    else:
                        task = f"Web search failed: {search_result['error']}. Continue with task: {task}"
                
                elif action == "execute":
                    command = action_data.get("command", "")
                    if debug:
                        print(f"[EXECUTE] {command}")
                    
                    result = self.executor.execute_command(command)
                    self.memory.add_short_term("execution", {
                        "command": command,
                        "success": result.success,
                        "output": result.output[:500]
                    })
                    
                    if debug:
                        print(f"[RESULT] Exit: {result.exit_code}, Output: {result.output[:100]}")
                    
                    task = f"Previous command result: {result.output if result.success else result.error}. Continue with task: {task}"
                
                elif action == "error":
                    return {
                        "success": False,
                        "error": action_data.get("content"),
                        "iterations": self.current_iteration
                    }
                
                else:
                    task = f"Agent reasoning: {action_data.get('content')}. Continue with task: {task}"
        except Exception as error:
            return {
                "success": False,
                "error": str(error),
                "iterations": self.current_iteration
            }

        return {
            "success": False,
            "error": "Max iterations reached",
            "iterations": self.current_iteration
        }
    
    def get_status(self) -> Dict[str, Any]:
        # Check Unsloth server status
        unsloth_status = self.check_unsloth_server()
        
        return {
            "resources": self.device.get_resource_status(),
            "context_size": len(self.memory.short_term),
            "execution_history": len(self.executor.execution_history),
            "web_search_enabled": self.enable_web_search,
            "ollama_model": self.llm.model,
            "unsloth_server": unsloth_status["success"],
            "unsloth_available": unsloth_status.get("unsloth_available", False) if unsloth_status["success"] else False
        }
