# Quick Start Guide - Legendary AI

## 5-Minute Setup

### Step 1: Install Ollama
Download and install from https://ollama.ai

### Step 2: Setup Project
```bash
cd /mnt/D/projects/LegendaryAI_Assistant
chmod +x setup.sh
./setup.sh
```

### Step 3: Start Ollama (Terminal 1)
```bash
ollama serve
```

### Step 4: Pull Model (Terminal 2)
```bash
ollama pull mistral
```

### Step 5: Run Agent (Terminal 2)
```bash
cd /mnt/D/projects/LegendaryAI_Assistant
source venv/bin/activate
python gui/cli.py
```

## First Commands

```
legendary-ai> status
legendary-ai> task create a python script that prints hello world
legendary-ai> debug list all files in current directory
legendary-ai> help
```

## What's Happening

1. **Ollama** - Local LLM server running on your CPU
2. **Mistral** - 7B parameter model (fits in 4GB RAM)
3. **Agent** - Autonomous reasoning loop
4. **Memory** - Context management
5. **Executor** - Safe command execution

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 8GB+ |
| CPU | 2 cores | 4+ cores |
| Disk | 2GB | 5GB+ |
| OS | Linux/Mac/Windows | Linux |

## Performance

- **First inference**: 10-30 seconds (model loading)
- **Subsequent**: 5-15 seconds per response
- **Depends on**: CPU cores, RAM speed, model size

## Troubleshooting

**Q: "Ollama not running" error**
A: Start Ollama in another terminal: `ollama serve`

**Q: Very slow responses**
A: 
- Check CPU usage: `status` command
- Close other apps
- Use smaller model: `ollama pull neural-chat`

**Q: Out of memory**
A:
- Reduce background processes
- Use 4GB model instead of 8GB
- Increase swap space

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [examples](#examples) below
3. Customize in `agent.py`

## Examples

### Create Files
```
task create a python script that reads a CSV and prints statistics
```

### Analyze Code
```
task analyze /path/to/file.py and suggest improvements
```

### System Tasks
```
task find all .py files larger than 1MB
task create a backup of all .txt files
```

### Development
```
task create unit tests for the fibonacci function
task fix the syntax error in my script
```

## Architecture Overview

```
User Input
    ↓
CLI Interface (gui/cli.py)
    ↓
Agent Orchestrator (agent.py)
    ├→ LLM Engine (core_ai/llm_engine.py)
    │   └→ Ollama Server (local)
    ├→ Memory Store (memory/store.py)
    ├→ Task Executor (executor/task_runner.py)
    └→ Device Monitor (device_control/system_monitor.py)
    ↓
Result
```

## Key Features

✓ **100% Offline** - No internet, no cloud
✓ **Autonomous** - Reasons and executes independently
✓ **Safe** - Resource limits and command sandboxing
✓ **Fast** - CPU-optimized inference
✓ **Modular** - Easy to extend and customize

---

**Ready to go!** Start with `python gui/cli.py` and give it a task.
