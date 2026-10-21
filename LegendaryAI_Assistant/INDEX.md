# Legendary AI - Project Index

## Quick Navigation

### Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[README.md](README.md)** - Full documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design details

### Core Files

#### Entry Points
- **[gui/cli.py](gui/cli.py)** - Main CLI interface
  - Interactive mode
  - Command-line execution
  - Debug mode
  - Status monitoring

- **[agent.py](agent.py)** - Main orchestrator
  - Agentic loop implementation
  - Task execution coordination
  - Status reporting

- **[demo.py](demo.py)** - Demo script
  - Shows all capabilities
  - Interactive demo menu
  - Example tasks

- **[test_system.py](test_system.py)** - System validation
  - Tests all components
  - Checks dependencies
  - Validates Ollama connection

#### Core Modules

**Core AI** (`core_ai/`)
- **[llm_engine.py](core_ai/llm_engine.py)** - LLM interface
  - Ollama connection
  - Context management
  - Response parsing
  - Token counting

**Memory** (`memory/`)
- **[store.py](memory/store.py)** - Memory management
  - Short-term storage
  - Long-term persistence
  - Context search
  - Summary generation

**Executor** (`executor/`)
- **[task_runner.py](executor/task_runner.py)** - Command execution
  - Safe command execution
  - Timeout handling
  - Output capture
  - Execution history

**Device Control** (`device_control/`)
- **[system_monitor.py](device_control/system_monitor.py)** - Resource monitoring
  - CPU/Memory tracking
  - Disk usage monitoring
  - Process counting
  - Resource limits

#### Configuration
- **[config.ini](config.ini)** - Configuration file
  - LLM settings
  - Agent parameters
  - Resource limits
  - Command whitelist

#### Dependencies
- **[requirements.txt](requirements.txt)** - Python dependencies
  - ollama
  - requests
  - numpy
  - python-dotenv
  - pydantic

#### Setup
- **[setup.sh](setup.sh)** - Installation script
  - Virtual environment setup
  - Dependency installation
  - Ollama verification

## File Structure

```
LegendaryAI_Assistant/
├── README.md                    # Main documentation
├── QUICKSTART.md               # Quick start guide
├── ARCHITECTURE.md             # Architecture details
├── INDEX.md                    # This file
├── requirements.txt            # Python dependencies
├── config.ini                  # Configuration
├── setup.sh                    # Setup script
├── agent.py                    # Main orchestrator
├── demo.py                     # Demo script
├── test_system.py              # System tests
│
├── core_ai/                    # LLM reasoning engine
│   ├── __init__.py
│   └── llm_engine.py          # Ollama interface
│
├── memory/                     # Context management
│   ├── __init__.py
│   └── store.py               # Memory store
│
├── executor/                   # Task execution
│   ├── __init__.py
│   └── task_runner.py         # Command executor
│
├── device_control/             # Resource monitoring
│   ├── __init__.py
│   └── system_monitor.py      # System monitor
│
├── gui/                        # User interface
│   ├── __init__.py
│   └── cli.py                 # CLI interface
│
└── memory_store/               # Persistent memory (created at runtime)
    └── *.json                 # Long-term memory files
```

## Usage Patterns

### Interactive Mode
```bash
python gui/cli.py
```
Best for: Exploration, testing, interactive tasks

### Command Line
```bash
python gui/cli.py "your task here"
```
Best for: Single tasks, scripting, automation

### Debug Mode
```bash
python gui/cli.py --debug "your task"
```
Best for: Troubleshooting, understanding flow

### Programmatic
```python
from agent import LegendaryAgent
agent = LegendaryAgent()
result = agent.execute_task("task")
```
Best for: Integration, automation, custom workflows

### Testing
```bash
python test_system.py
```
Best for: Validation, diagnostics

### Demo
```bash
python demo.py
```
Best for: Learning, showcasing capabilities

## Key Concepts

### Agentic Loop
The core reasoning cycle:
1. Understand task
2. Reason about approach
3. Execute commands
4. Validate results
5. Loop until complete

### Context Window
Maintains last 10 exchanges with LLM for continuity

### Memory Hierarchy
- Short-term: In-memory (fast, volatile)
- Long-term: Disk storage (persistent)

### Resource Management
- CPU limit: 80%
- Memory limit: 85%
- Timeout: 30 seconds
- Max iterations: 5

### Safe Mode
- Whitelist of allowed commands
- Blocks dangerous operations
- Output sanitization

## Common Tasks

### Create a Python Script
```
task create a python script that [description]
```

### Analyze Code
```
task analyze [file] and suggest improvements
```

### Find Files
```
task find all [pattern] files in [directory]
```

### System Operations
```
task [operation] on [target]
```

### Development
```
task create unit tests for [function]
task fix the error in [file]
```

## Troubleshooting Guide

### Issue: "Ollama not running"
**Solution**: Start Ollama in another terminal
```bash
ollama serve
```

### Issue: Slow responses
**Solution**: 
- Check system resources: `status` command
- Close background apps
- Use faster model: `ollama pull neural-chat`

### Issue: Out of memory
**Solution**:
- Reduce background processes
- Use smaller model
- Increase swap space

### Issue: Command blocked
**Solution**: Check safe mode settings in `config.ini`

## Performance Tips

1. **Use Mistral** - Best balance of speed/quality
2. **Allocate RAM** - More RAM = faster inference
3. **Close Apps** - Free up system resources
4. **SSD Storage** - Faster model loading
5. **CPU Cores** - More cores = parallel processing

## Development Guide

### Adding a New Module
1. Create directory in root
2. Add `__init__.py`
3. Implement module
4. Import in `agent.py`
5. Add tests in `test_system.py`

### Extending the Agent
1. Add method to `LegendaryAgent` class
2. Update agentic loop if needed
3. Add to CLI commands
4. Test with `test_system.py`

### Custom Tools
1. Add to `allowed_commands` in `executor/task_runner.py`
2. Implement handler in `agent.py`
3. Update system prompt
4. Test execution

## API Reference

### LegendaryAgent
```python
agent = LegendaryAgent(model="mistral")
result = agent.execute_task(task, debug=False)
status = agent.get_status()
```

### CoreAI
```python
llm = CoreAI(model="mistral")
response = llm.reason(prompt, system_prompt)
llm.clear_context()
```

### MemoryStore
```python
memory = MemoryStore()
memory.add_short_term(key, value)
memory.get_short_term(key)
memory.save_long_term(category, data)
memory.load_long_term(category)
```

### TaskExecutor
```python
executor = TaskExecutor(safe_mode=True)
result = executor.execute_command(command)
history = executor.get_history()
```

### DeviceControl
```python
device = DeviceControl()
stats = device.get_system_stats()
can_run = device.can_execute_task()
status = device.get_resource_status()
```

## Resources

- **Ollama**: https://ollama.ai
- **Models**: https://ollama.ai/library
- **Python**: https://python.org
- **Documentation**: See README.md

## Support

For issues:
1. Check QUICKSTART.md
2. Review ARCHITECTURE.md
3. Run test_system.py
4. Check config.ini
5. Review code comments

---

**Legendary AI** - Autonomous intelligence, running locally, no internet required.
