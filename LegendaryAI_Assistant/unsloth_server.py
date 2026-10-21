#!/usr/bin/env python3
"""
Unsloth Training Server for SZM AI Assistant
Provides REST API for fine-tuning models with Unsloth
"""

import os
import json
import uuid
import asyncio
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path

try:
    from fastapi import FastAPI, HTTPException, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
except ImportError:
    print("Installing required packages...")
    os.system("pip install fastapi uvicorn pydantic")
    from fastapi import FastAPI, HTTPException, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn

# Try to import Unsloth
try:
    from unsloth import FastLanguageModel
    from unsloth.chat_templates import get_chat_template
    from datasets import Dataset
    import torch
    from transformers import TrainingArguments
    from trl import SFTTrainer
    UNSLOTH_AVAILABLE = True
except ImportError:
    print("Unsloth not available. Install with: pip install unsloth")
    UNSLOTH_AVAILABLE = False
    # Mock classes for development
    class Dataset:
        @classmethod
        def from_list(cls, data):
            return cls()
        def map(self, func, batched=True):
            return self

app = FastAPI(title="SZM Unsloth Training Server", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class TrainingConfig(BaseModel):
    model_name: str = "unsloth/llama-2-7b-bnb-4bit"
    max_seq_length: int = 2048
    dtype: str = "float16"
    load_in_4bit: bool = True
    learning_rate: float = 2e-4
    num_train_epochs: int = 1
    per_device_train_batch_size: int = 2
    gradient_accumulation_steps: int = 4
    warmup_steps: int = 5
    max_steps: int = 60
    logging_steps: int = 1
    save_steps: int = 20
    output_dir: str = "./unsloth_outputs"

class TrainingData(BaseModel):
    instruction: str
    input: str
    output: str

class DatasetRequest(BaseModel):
    data: List[TrainingData]
    format: str = "alpaca"

class TrainingRequest(BaseModel):
    config: TrainingConfig
    dataset_id: str

@dataclass
class TrainingStatus:
    status: str = "idle"  # idle, preparing, training, completed, error
    progress: float = 0.0
    current_step: int = 0
    total_steps: int = 0
    loss: float = 0.0
    eta: str = "00:00:00"
    error: Optional[str] = None

# Global state
training_sessions: Dict[str, TrainingStatus] = {}
datasets: Dict[str, Dataset] = {}
models: Dict[str, Any] = {}

# Available models
AVAILABLE_MODELS = [
    "unsloth/llama-2-7b-bnb-4bit",
    "unsloth/mistral-7b-bnb-4bit",
    "unsloth/codellama-7b-bnb-4bit",
    "unsloth/tinyllama-bnb-4bit",
    "unsloth/gemma-7b-bnb-4bit",
]

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "unsloth_available": UNSLOTH_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/models")
async def get_models():
    return {"models": AVAILABLE_MODELS}

@app.post("/prepare-dataset")
async def prepare_dataset(request: DatasetRequest):
    if not UNSLOTH_AVAILABLE:
        raise HTTPException(status_code=500, detail="Unsloth not available")
    
    dataset_id = str(uuid.uuid4())
    
    try:
        # Convert to Alpaca format
        alpaca_data = []
        for item in request.data:
            alpaca_data.append({
                "instruction": item.instruction,
                "input": item.input,
                "output": item.output,
            })
        
        # Create dataset
        dataset = Dataset.from_list(alpaca_data)
        datasets[dataset_id] = dataset
        
        return {
            "dataset_id": dataset_id,
            "size": len(alpaca_data),
            "format": request.format
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset preparation failed: {str(e)}")

@app.post("/start-training")
async def start_training(request: TrainingRequest, background_tasks: BackgroundTasks):
    if not UNSLOTH_AVAILABLE:
        raise HTTPException(status_code=500, detail="Unsloth not available")
    
    if request.dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    training_id = str(uuid.uuid4())
    training_sessions[training_id] = TrainingStatus(status="preparing")
    
    # Start training in background
    background_tasks.add_task(run_training, training_id, request.config, request.dataset_id)
    
    return {"training_id": training_id}

@app.get("/training-status/{training_id}")
async def get_training_status(training_id: str):
    if training_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Training session not found")
    
    return asdict(training_sessions[training_id])

@app.post("/stop-training/{training_id}")
async def stop_training(training_id: str):
    if training_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Training session not found")
    
    training_sessions[training_id].status = "stopped"
    return {"message": "Training stopped"}

@app.post("/export-model")
async def export_model(request: dict):
    training_id = request.get("training_id")
    format_type = request.get("format", "gguf")
    
    if training_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Training session not found")
    
    if training_sessions[training_id].status != "completed":
        raise HTTPException(status_code=400, detail="Training not completed")
    
    try:
        # Export model (simplified for demo)
        output_dir = f"./exports/{training_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        if training_id in models:
            model = models[training_id]
            
            if format_type == "gguf":
                # Export to GGUF format
                model.save_pretrained_gguf(output_dir, tokenizer=None)
                filename = f"{training_id}.gguf"
            elif format_type == "safetensors":
                # Export to SafeTensors
                model.save_pretrained(output_dir, safe_serialization=True)
                filename = f"{training_id}_safetensors.zip"
            else:
                # Export to PyTorch
                model.save_pretrained(output_dir)
                filename = f"{training_id}_pytorch.zip"
            
            download_url = f"/download/{training_id}/{filename}"
            return {"download_url": download_url}
        else:
            raise HTTPException(status_code=404, detail="Model not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

def format_alpaca_prompt(instruction: str, input_text: str, output: str) -> str:
    """Format data in Alpaca style"""
    if input_text:
        return f"""Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Input:
{input_text}

### Response:
{output}"""
    else:
        return f"""Below is an instruction that describes a task. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Response:
{output}"""

def run_training(training_id: str, config: TrainingConfig, dataset_id: str):
    """Run Unsloth training in background"""
    try:
        status = training_sessions[training_id]
        status.status = "preparing"
        
        if not UNSLOTH_AVAILABLE:
            status.status = "error"
            status.error = "Unsloth not available"
            return
        
        # Load model and tokenizer
        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name=config.model_name,
            max_seq_length=config.max_seq_length,
            dtype=getattr(torch, config.dtype) if hasattr(torch, config.dtype) else None,
            load_in_4bit=config.load_in_4bit,
        )
        
        # Configure for training
        model = FastLanguageModel.get_peft_model(
            model,
            r=16,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                          "gate_proj", "up_proj", "down_proj"],
            lora_alpha=16,
            lora_dropout=0,
            bias="none",
            use_gradient_checkpointing="unsloth",
            random_state=3407,
            use_rslora=False,
            loftq_config=None,
        )
        
        # Prepare dataset
        dataset = datasets[dataset_id]
        
        def formatting_prompts_func(examples):
            instructions = examples["instruction"]
            inputs = examples["input"]
            outputs = examples["output"]
            texts = []
            for instruction, input_text, output in zip(instructions, inputs, outputs):
                text = format_alpaca_prompt(instruction, input_text, output)
                texts.append(text)
            return {"text": texts}
        
        dataset = dataset.map(formatting_prompts_func, batched=True)
        
        # Training arguments
        training_args = TrainingArguments(
            per_device_train_batch_size=config.per_device_train_batch_size,
            gradient_accumulation_steps=config.gradient_accumulation_steps,
            warmup_steps=config.warmup_steps,
            max_steps=config.max_steps,
            learning_rate=config.learning_rate,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=config.logging_steps,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="linear",
            seed=3407,
            output_dir=config.output_dir,
            save_steps=config.save_steps,
        )
        
        # Create trainer
        trainer = SFTTrainer(
            model=model,
            tokenizer=tokenizer,
            train_dataset=dataset,
            dataset_text_field="text",
            max_seq_length=config.max_seq_length,
            dataset_num_proc=2,
            packing=False,
            args=training_args,
        )
        
        # Update status
        status.status = "training"
        status.total_steps = config.max_steps
        
        # Custom callback for progress tracking
        class ProgressCallback:
            def __init__(self, training_status):
                self.training_status = training_status
            
            def on_log(self, args, state, control, model=None, **kwargs):
                if state.log_history:
                    latest_log = state.log_history[-1]
                    self.training_status.current_step = state.global_step
                    self.training_status.progress = (state.global_step / state.max_steps) * 100
                    if 'train_loss' in latest_log:
                        self.training_status.loss = latest_log['train_loss']
                    
                    # Calculate ETA
                    if state.global_step > 0:
                        steps_per_second = state.global_step / (state.log_history[-1].get('train_runtime', 1))
                        remaining_steps = state.max_steps - state.global_step
                        eta_seconds = remaining_steps / max(steps_per_second, 0.001)
                        hours = int(eta_seconds // 3600)
                        minutes = int((eta_seconds % 3600) // 60)
                        seconds = int(eta_seconds % 60)
                        self.training_status.eta = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        
        trainer.add_callback(ProgressCallback(status))
        
        # Start training
        trainer.train()
        
        # Save model
        models[training_id] = model
        status.status = "completed"
        status.progress = 100.0
        
    except Exception as e:
        status.status = "error"
        status.error = str(e)
        print(f"Training error: {e}")

if __name__ == "__main__":
    print("🚀 Starting SZM Unsloth Training Server...")
    print("📋 Features:")
    print("   - Fine-tune models with Unsloth")
    print("   - Real-time training progress")
    print("   - Multiple export formats")
    print("   - Integration with SZM AI Assistant")
    print(f"🔧 Unsloth Available: {UNSLOTH_AVAILABLE}")
    
    if not UNSLOTH_AVAILABLE:
        print("\n⚠️  To enable Unsloth training, install:")
        print("   pip install unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git")
        print("   pip install --no-deps trl peft accelerate bitsandbytes")
    
    print("\n🌐 Server starting on http://localhost:8000")
    print("📖 API docs available at http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)