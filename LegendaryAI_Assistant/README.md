# Legendary AI - Offline Agentic Code Intelligence System

An autonomous AI agent that runs entirely offline on your system's RAM and CPU. No internet required, no cloud dependencies.

## Features

- **100% Offline** - Runs locally using Ollama + GGUF models
- **Agentic Loop** - Autonomous reasoning, planning, and execution
- **System-Aware** - Monitors CPU, RAM, and disk usage
- **Context Management** - Efficient short-term and long-term memory
- **Safe Execution** - Sandboxed command execution with resource limits
- **Modular Architecture** - Clean separation of concerns

## Architecture

```
LegendaryAI_Assistant/
├── core_ai/           # LLM reasoning engine
├── memory/            # Context & knowledge store
├── executor/          # Task execution & validation
├── device_control/    # System resource monitoring
├── gui/               # CLI interface
└── agent.py           # Main orchestrator
```

## Prerequisites

- Python 3.8+
- Ollama (https://ollama.ai)
- 4GB+ RAM (recommended 8GB+)
- 2GB+ disk space for models

## Installation

### 1. Install Ollama

Download from https://ollama.ai and install for your OS.

### 2. Setup Legendary AI

```bash
cd /mnt/D/projects/LegendaryAI_Assistant
chmod +x setup.sh
./setup.sh
```

### 3. Start Ollama Server

In a terminal:
```bash
ollama serve
```

### 4. Pull a Model

In another terminal:
```bash
ollama pull mistral
```

Available models:
- `mistral` - 7B, fast, good reasoning (recommended)
- `neural-chat` - 7B, optimized for chat
- `llama2` - 7B, general purpose
- `dolphin-mixtral` - 8x7B, more capable (requires more RAM)

## Usage

### Interactive Mode

```bash
source venv/bin/activate
python gui/cli.py
```

Then type commands:
```
legendary-ai> task create a python script that calculates fibonacci
legendary-ai> debug list all python files in current directory
legendary-ai> status
legendary-ai> help
```

### Command Line

```bash
python gui/cli.py "create a python script that prints hello world"
python gui/cli.py --debug "list all files"
```

### Programmatic Usage

```python
from agent import LegendaryAgent

agent = LegendaryAgent(model="mistral")
result = agent.execute_task("create a python script that prints hello world", debug=True)
print(result)
```

## How It Works

### Agent Loop

1. **Understand** - Parse the task and context
2. **Reason** - LLM analyzes the task and decides next action
3. **Plan** - Break down into executable steps
4. **Execute** - Run commands safely with resource monitoring
5. **Validate** - Check results and adjust if needed
6. **Loop** - Repeat until task complete or max iterations reached

### Memory System

- **Short-term** - Recent context (last 50 entries)
- **Long-term** - Persistent storage in JSON files
- **Search** - Vector-like search across memory

### Resource Management

- CPU limit: 80% (configurable)
- Memory limit: 85% (configurable)
- Process limit: 500 (configurable)
- Automatic throttling when limits approached

## Configuration

Edit `agent.py` to customize:

```python
# Max iterations per task
self.max_iterations = 5

# Resource limits
self.device.resource_limits = {
    "max_cpu_percent": 80,
    "max_memory_percent": 85,
    "max_processes": 500
}

# LLM parameters
self.llm = CoreAI(model="mistral", ollama_url="http://localhost:11434")
```

## Examples

### Create a Python Script

```
task create a python script that reads a CSV file and prints statistics
```

### Analyze Code

```
task analyze the code in /path/to/file.py and suggest improvements
```

### System Tasks

```
task find all python files larger than 1MB in the current directory
task create a backup of all .txt files
```

### Development

```
task create a unit test for the fibonacci function
task fix the syntax error in my python script
```

## Troubleshooting

### Ollama Connection Error

```
Error: Ollama not running at http://localhost:11434
```

**Solution:** Start Ollama server in another terminal:
```bash
ollama serve
```

### Out of Memory

```
Error: System resources exhausted
```

**Solution:** 
- Close other applications
- Use a smaller model (mistral instead of dolphin-mixtral)
- Reduce `max_memory_percent` in agent.py

### Model Not Found

```
Error: Model 'mistral' not found
```

**Solution:** Pull the model:
```bash
ollama pull mistral
```

### Slow Responses

- Use a faster model (neural-chat)
- Increase available RAM
- Close background processes
- Check CPU usage with `status` command

## Performance Tips

1. **Use Mistral** - Best balance of speed and capability
2. **Allocate RAM** - More RAM = faster inference
3. **Close Apps** - Free up system resources
4. **SSD Storage** - Faster model loading
5. **CPU Cores** - More cores = parallel processing

## Limitations

- Inference speed depends on CPU/RAM
- Context window limited to 10 exchanges
- No internet access (by design)
- Safe mode blocks certain commands
- Max 5 iterations per task (configurable)

## Future Enhancements

- [ ] Vector embeddings for better context retrieval
- [ ] Multi-model support (switch models per task)
- [ ] Web UI dashboard
- [ ] Task scheduling and automation
- [ ] Integration with local databases
- [ ] Custom tool plugins
- [ ] Persistent learning across sessions

## License

MIT

## Support

For issues or questions, check the troubleshooting section or review the code comments.

---

**Legendary AI** - Autonomous intelligence, running locally, no internet required.
