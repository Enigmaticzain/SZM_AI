# SZM AI Assistant - Unsloth Integration

## 🚀 Overview

The SZM AI Assistant now includes **Unsloth integration** for efficient fine-tuning of large language models directly within the application. Unsloth provides 2x faster training with 50% less memory usage compared to standard fine-tuning methods.

## ✨ Features

### 🔥 **Advanced Model Training**
- **Fine-tune popular models**: Llama 2, Mistral, CodeLlama, Gemma
- **Memory efficient**: 4-bit quantization support
- **Fast training**: Optimized with Unsloth acceleration
- **Real-time monitoring**: Live training progress and loss tracking
- **Multiple export formats**: GGUF, SafeTensors, PyTorch

### 🎯 **Seamless Integration**
- **Web interface**: Intuitive training controls in the SZM app
- **Automatic data conversion**: Converts SZM training data to Alpaca format
- **Background training**: Non-blocking training with status updates
- **Agent integration**: AI agent can start/monitor training automatically

### 📊 **Training Data Sources**
- **Text input**: Direct text training data
- **File uploads**: Documents, PDFs, code files
- **GitHub repositories**: Import skills from GitHub
- **Agent memory**: Use accumulated agent experience
- **Web search results**: Train on current information

## 🛠 Installation & Setup

### 1. **Install Unsloth Dependencies**

Run the automated setup script:
```bash
cd LegendaryAI_Assistant
chmod +x setup_unsloth.sh
./setup_unsloth.sh
```

Or install manually:
```bash
# Install PyTorch (CUDA version for GPU acceleration)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install Unsloth
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"

# Install supporting libraries
pip install --no-deps trl peft accelerate bitsandbytes transformers datasets
pip install fastapi uvicorn pydantic
```

### 2. **Start the Unsloth Server**

```bash
cd LegendaryAI_Assistant
python3 unsloth_server.py
```

The server will start on `http://localhost:8000` with:
- ✅ REST API for training operations
- ✅ Real-time training status
- ✅ Model export capabilities
- ✅ CORS enabled for web interface

### 3. **Verify Installation**

Check the server health:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "unsloth_available": true,
  "timestamp": "2024-01-01T12:00:00"
}
```

## 🎮 Usage Guide

### **Web Interface Training**

1. **Open SZM AI Assistant** in your browser
2. **Go to Train tab** → **Unsloth Training**
3. **Configure training parameters**:
   - Base model (Llama 2, Mistral, etc.)
   - Learning rate, epochs, batch size
   - Sequence length, training steps
4. **Start training** with your accumulated data
5. **Monitor progress** in real-time
6. **Export trained model** when complete

### **Agent-Controlled Training**

The AI agent can automatically manage training:

```python
# Start training via agent
agent = LegendaryAgent(enable_web_search=True)
result = agent.execute_task("Start Unsloth training with current data")

# Check training status
status = agent.execute_task("Check Unsloth training progress")

# The agent will automatically:
# - Convert memory data to training format
# - Start training with optimal parameters
# - Monitor progress and report status
```

### **API Usage**

Direct API calls for custom integration:

```python
import requests

# Prepare dataset
response = requests.post("http://localhost:8000/prepare-dataset", json={
    "data": [
        {
            "instruction": "Explain AI concepts",
            "input": "What is machine learning?",
            "output": "Machine learning is a subset of AI..."
        }
    ],
    "format": "alpaca"
})

dataset_id = response.json()["dataset_id"]

# Start training
training_response = requests.post("http://localhost:8000/start-training", json={
    "config": {
        "model_name": "unsloth/llama-2-7b-bnb-4bit",
        "max_seq_length": 2048,
        "learning_rate": 2e-4,
        "num_train_epochs": 1,
        "max_steps": 60
    },
    "dataset_id": dataset_id
})

training_id = training_response.json()["training_id"]

# Monitor progress
status_response = requests.get(f"http://localhost:8000/training-status/{training_id}")
print(status_response.json())
```

## ⚙️ Configuration Options

### **Training Parameters**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `model_name` | `unsloth/llama-2-7b-bnb-4bit` | Base model to fine-tune |
| `max_seq_length` | `2048` | Maximum sequence length |
| `learning_rate` | `2e-4` | Learning rate for training |
| `num_train_epochs` | `1` | Number of training epochs |
| `per_device_train_batch_size` | `2` | Batch size per device |
| `gradient_accumulation_steps` | `4` | Gradient accumulation steps |
| `max_steps` | `60` | Maximum training steps |
| `warmup_steps` | `5` | Warmup steps |
| `logging_steps` | `1` | Logging frequency |
| `save_steps` | `20` | Model save frequency |

### **Supported Models**

- **Llama 2**: `unsloth/llama-2-7b-bnb-4bit`, `unsloth/llama-2-13b-bnb-4bit`
- **Mistral**: `unsloth/mistral-7b-bnb-4bit`
- **CodeLlama**: `unsloth/codellama-7b-bnb-4bit`, `unsloth/codellama-13b-bnb-4bit`
- **Gemma**: `unsloth/gemma-7b-bnb-4bit`
- **TinyLlama**: `unsloth/tinyllama-bnb-4bit`

### **Export Formats**

- **GGUF**: Optimized for llama.cpp and Ollama
- **SafeTensors**: Safe serialization format
- **PyTorch**: Standard PyTorch format

## 🔧 Architecture

### **Component Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Interface │    │  Unsloth Server  │    │  Training Engine│
│                 │    │                  │    │                 │
│ • Training UI   │◄──►│ • REST API       │◄──►│ • Unsloth Core  │
│ • Progress View │    │ • Status Monitor │    │ • Model Loading │
│ • Export Tools  │    │ • Data Converter │    │ • Fine-tuning   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SZM Agent     │    │  Training Data   │    │  Model Storage  │
│                 │    │                  │    │                 │
│ • Auto Training │    │ • Text/Files     │    │ • Checkpoints   │
│ • Status Check  │    │ • GitHub Skills  │    │ • Exports       │
│ • Integration   │    │ • Agent Memory   │    │ • Artifacts     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Data Flow**

1. **Data Collection**: SZM app collects training data from multiple sources
2. **Format Conversion**: Data converted to Alpaca instruction format
3. **Dataset Preparation**: Unsloth server creates training dataset
4. **Model Loading**: Base model loaded with 4-bit quantization
5. **Fine-tuning**: Efficient training with LoRA adapters
6. **Progress Monitoring**: Real-time status updates via WebSocket/polling
7. **Model Export**: Trained model exported in desired format

## 🚨 System Requirements

### **Minimum Requirements**
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **Python**: 3.8 or higher
- **CUDA**: Optional but recommended for GPU acceleration

### **Recommended Setup**
- **GPU**: NVIDIA GPU with 8GB+ VRAM
- **RAM**: 32GB for larger models
- **Storage**: SSD with 50GB+ free space
- **CUDA**: 11.8 or 12.1

### **Performance Notes**
- **CPU-only**: Slower but functional for small models
- **GPU acceleration**: 5-10x faster training
- **4-bit quantization**: Reduces memory usage by ~75%
- **LoRA fine-tuning**: Efficient parameter updates

## 🐛 Troubleshooting

### **Common Issues**

**1. Unsloth Server Won't Start**
```bash
# Check Python version
python3 --version  # Should be 3.8+

# Install missing dependencies
pip install fastapi uvicorn

# Check for CUDA issues
python3 -c "import torch; print(torch.cuda.is_available())"
```

**2. Training Fails with Memory Error**
- Reduce `per_device_train_batch_size` to 1
- Increase `gradient_accumulation_steps` to 8
- Use smaller `max_seq_length` (1024 instead of 2048)
- Enable 4-bit quantization: `load_in_4bit: true`

**3. Model Loading Issues**
```bash
# Clear Hugging Face cache
rm -rf ~/.cache/huggingface/

# Reinstall transformers
pip install --upgrade transformers
```

**4. Connection Issues**
- Verify server is running: `curl http://localhost:8000/health`
- Check firewall settings
- Ensure port 8000 is not blocked

### **Debug Mode**

Enable debug logging:
```python
# In unsloth_server.py
import logging
logging.basicConfig(level=logging.DEBUG)

# In agent.py
result = agent.execute_task("start training", debug=True)
```

## 📈 Performance Optimization

### **Training Speed**
- **Use GPU**: 5-10x faster than CPU
- **Optimize batch size**: Balance memory and speed
- **Enable gradient checkpointing**: Reduces memory usage
- **Use mixed precision**: FP16/BF16 for faster training

### **Memory Optimization**
- **4-bit quantization**: Reduces model size by 75%
- **LoRA adapters**: Only train small parameter subset
- **Gradient accumulation**: Simulate larger batches
- **Sequence length**: Use shortest viable length

### **Quality Improvements**
- **More training data**: Better model performance
- **Diverse examples**: Improves generalization
- **Proper formatting**: Consistent instruction format
- **Validation data**: Monitor overfitting

## 🔮 Advanced Features

### **Custom Model Integration**
```python
# Add custom model to server
AVAILABLE_MODELS.append("custom/my-model-4bit")

# Use in training
config = {
    "model_name": "custom/my-model-4bit",
    "max_seq_length": 4096,
    # ... other parameters
}
```

### **Multi-GPU Training**
```python
# Enable data parallel training
training_args = TrainingArguments(
    per_device_train_batch_size=4,
    dataloader_num_workers=4,
    # ... other args
)
```

### **Custom Data Formats**
```python
def custom_formatting_func(examples):
    # Custom prompt formatting
    texts = []
    for instruction, input_text, output in zip(
        examples["instruction"], 
        examples["input"], 
        examples["output"]
    ):
        text = f"<|system|>You are a helpful assistant<|user|>{instruction}\n{input_text}<|assistant|>{output}"
        texts.append(text)
    return {"text": texts}
```

## 🎯 Integration Examples

### **1. Automated Training Pipeline**
```python
# Complete automated training
agent = LegendaryAgent()

# Collect data from multiple sources
agent.execute_task("Import GitHub repository skills")
agent.execute_task("Search web for latest AI developments")
agent.execute_task("Process uploaded documents")

# Start training automatically
result = agent.execute_task("Start Unsloth training with all collected data")
print(f"Training started: {result}")

# Monitor until completion
while True:
    status = agent.get_unsloth_training_status()
    if status["success"] and status["status"]["status"] == "completed":
        break
    time.sleep(30)

# Export trained model
agent.execute_task("Export trained model as GGUF format")
```

### **2. Continuous Learning**
```python
# Set up continuous learning loop
def continuous_learning_loop():
    agent = LegendaryAgent()
    
    while True:
        # Collect new data
        new_data = agent.memory.get_recent_entries(hours=24)
        
        if len(new_data) > 50:  # Enough new data
            # Start incremental training
            result = agent.start_unsloth_training({
                "num_train_epochs": 1,
                "max_steps": 20,  # Quick incremental update
                "learning_rate": 1e-5  # Lower LR for fine updates
            })
            
            if result["success"]:
                print(f"Incremental training started: {result['training_id']}")
        
        time.sleep(3600)  # Check every hour
```

### **3. Specialized Model Training**
```python
# Train specialized models for different domains
domains = {
    "coding": {
        "model": "unsloth/codellama-7b-bnb-4bit",
        "data_filter": lambda x: "code" in x or "programming" in x
    },
    "general": {
        "model": "unsloth/llama-2-7b-bnb-4bit", 
        "data_filter": lambda x: True
    }
}

for domain, config in domains.items():
    # Filter training data by domain
    filtered_data = filter_training_data(config["data_filter"])
    
    # Train domain-specific model
    result = agent.start_unsloth_training({
        "model_name": config["model"],
        "output_dir": f"./models/{domain}",
        # ... other config
    })
```

## 📚 Resources

### **Documentation**
- [Unsloth GitHub](https://github.com/unslothai/unsloth)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)

### **Model Repositories**
- [Unsloth Models](https://huggingface.co/unsloth)
- [Hugging Face Hub](https://huggingface.co/models)

### **Community**
- [Unsloth Discord](https://discord.gg/unsloth)
- [SZM AI Assistant Issues](https://github.com/your-repo/issues)

---

## 🎉 **Unsloth Integration Complete!**

Your SZM AI Assistant now has powerful fine-tuning capabilities with:

✅ **Efficient Training**: 2x faster, 50% less memory  
✅ **Multiple Models**: Llama 2, Mistral, CodeLlama, Gemma  
✅ **Real-time Monitoring**: Live progress tracking  
✅ **Multiple Export Formats**: GGUF, SafeTensors, PyTorch  
✅ **Agent Integration**: Automated training workflows  
✅ **Web Interface**: Intuitive training controls  

Start training your custom AI models today! 🚀