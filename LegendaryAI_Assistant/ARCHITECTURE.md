# Legendary AI - Architecture Documentation

## System Overview

Legendary AI is a fully autonomous, offline AI agent that runs on system RAM and CPU. It combines:
- Local LLM inference (Ollama + GGUF models)
- Agentic reasoning loop
- Memory management
- Safe task execution
- Resource monitoring

## Core Components

### 1. Core AI Engine (`core_ai/llm_engine.py`)

**Purpose**: Interface with local Ollama LLM for reasoning

**Key Classes**:
- `CoreAI` - Main LLM interface
- `AIResponse` - Structured response format

**Features**:
- Connects to Ollama server
- Maintains context window (last 10 exchanges)
- Handles timeouts and errors
- Parses JSON responses

**Flow**:
```
User Prompt
    ↓
Add to Context Window
    ↓
Send to Ollama API
    ↓
Parse Response
    ↓
Update Context
    ↓
Return AIResponse
```

### 2. Memory System (`memory/store.py`)

**Purpose**: Store and retrieve context efficiently

**Key Classes**:
- `MemoryStore` - Unified memory interface

**Two-Tier Architecture**:

**Short-term Memory**:
- In-memory list (max 50 entries)
- Fast access
- Lost on restart
- Used for current task context

**Long-term Memory**:
- JSON files on disk
- Persistent across sessions
- Organized by category
- Used for knowledge base

**Operations**:
```python
# Short-term
memory.add_short_term(key, value, metadata)
memory.get_short_term(key)
memory.search_context(query, limit=5)

# Long-term
memory.save_long_term(category, data)
memory.load_long_term(category)
```

### 3. Task Executor (`executor/task_runner.py`)

**Purpose**: Execute commands safely with resource limits

**Key Classes**:
- `TaskExecutor` - Command execution engine
- `ExecutionResult` - Structured execution output

**Safety Features**:
- Safe mode (whitelist allowed commands)
- Timeout protection (30s default)
- Output truncation (5000 chars)
- Execution history tracking

**Execution Flow**:
```
Command Request
    ↓
Check Safe Mode
    ↓
Execute with Timeout
    ↓
Capture Output/Error
    ↓
Store in History
    ↓
Return ExecutionResult
```

### 4. Device Control (`device_control/system_monitor.py`)

**Purpose**: Monitor and manage system resources

**Key Classes**:
- `DeviceControl` - Resource monitoring
- `SystemStats` - System metrics

**Monitored Resources**:
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Process count

**Resource Limits** (configurable):
- Max CPU: 80%
- Max Memory: 85%
- Max Processes: 500

**Decision Making**:
```
Task Request
    ↓
Check Resources
    ↓
All OK? → Execute
    ↓
Over Limit? → Reject
    ↓
Return Status
```

### 5. Agent Orchestrator (`agent.py`)

**Purpose**: Coordinate all components in agentic loop

**Key Classes**:
- `LegendaryAgent` - Main orchestrator

**Agentic Loop**:
```
1. UNDERSTAND
   - Parse task
   - Retrieve context
   - Check resources

2. REASON
   - Send to LLM
   - Get action plan
   - Parse response

3. EXECUTE
   - Run commands
   - Monitor output
   - Store results

4. VALIDATE
   - Check success
   - Update memory
   - Adjust if needed

5. LOOP
   - Repeat until complete
   - Max 5 iterations
   - Timeout protection
```

**State Management**:
```python
agent.execute_task(task, debug=False)
    ↓
Returns: {
    "success": bool,
    "result": str,
    "iterations": int,
    "error": str (if failed)
}
```

### 6. CLI Interface (`gui/cli.py`)

**Purpose**: User interaction layer

**Modes**:
- Interactive: `python gui/cli.py`
- Command-line: `python gui/cli.py "task description"`
- Debug: `python gui/cli.py --debug "task"`

**Commands**:
```
task <description>     - Execute task
debug <description>    - Execute with debug output
status                 - Show system status
help                   - Show help
exit                   - Exit program
```

## Data Flow

### Task Execution Flow

```
┌─────────────────────────────────────────────────────────┐
│ User Input (CLI)                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│ Agent.execute_task()                                    │
│ - Clear context                                         │
│ - Check resources                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
        ┌────────────────────┐
        │ Iteration Loop     │
        │ (Max 5)            │
        └────────┬───────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│ LLM Reasoning                                           │
│ - Build system prompt                                   │
│ - Add context                                           │
│ - Send to Ollama                                        │
│ - Parse JSON response                                   │
└────────────────┬────────────────────────────────────────┘
                 │
         ┌───────┴────────┬──────────────┐
         │                │              │
         ↓                ↓              ↓
    ┌────────┐      ┌─────────┐    ┌────────┐
    │ REASON │      │ EXECUTE │    │COMPLETE│
    └────────┘      └────┬────┘    └────────┘
         │                │              │
         │                ↓              │
         │         ┌──────────────┐      │
         │         │ TaskExecutor │      │
         │         │ - Run cmd    │      │
         │         │ - Capture    │      │
         │         │ - Store      │      │
         │         └──────┬───────┘      │
         │                │              │
         │                ↓              │
         │         ┌──────────────┐      │
         │         │ MemoryStore  │      │
         │         │ - Add result │      │
         │         └──────────────┘      │
         │                │              │
         └────────┬───────┴──────────────┘
                  │
                  ↓
         ┌────────────────────┐
         │ Loop Complete?     │
         │ Success/Max Iter   │
         └────────┬───────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Return Result                                           │
│ {success, result, iterations, error}                    │
└─────────────────────────────────────────────────────────┘
```

## Context Management

### Context Window

The LLM maintains a sliding context window:

```
Exchange 1: User → AI → Response
Exchange 2: User → AI → Response
...
Exchange 10: User → AI → Response
(Oldest exchanges dropped)
```

**Benefits**:
- Maintains conversation continuity
- Prevents token explosion
- Efficient memory usage
- Fits in 4GB RAM

### Memory Hierarchy

```
┌─────────────────────────────────────┐
│ Current Task Context                │
│ (In LLM context window)             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Short-term Memory                   │
│ (Last 50 entries, in RAM)           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Long-term Memory                    │
│ (JSON files on disk)                │
└─────────────────────────────────────┘
```

## Resource Management

### CPU/Memory Constraints

```
Task Request
    ↓
Check Current Usage
    ↓
CPU < 80% AND Memory < 85%?
    ├─ YES → Execute
    └─ NO → Reject with status
```

### Execution Limits

| Resource | Limit | Purpose |
|----------|-------|---------|
| CPU | 80% | Prevent system freeze |
| Memory | 85% | Prevent OOM |
| Processes | 500 | Prevent fork bomb |
| Timeout | 30s | Prevent hanging |
| Output | 5000 chars | Prevent memory bloat |
| Iterations | 5 | Prevent infinite loops |

## Model Selection

### Recommended Models

| Model | Size | Speed | Quality | RAM |
|-------|------|-------|---------|-----|
| mistral | 7B | Fast | Good | 4GB |
| neural-chat | 7B | Fast | Good | 4GB |
| llama2 | 7B | Medium | Good | 4GB |
| dolphin-mixtral | 8x7B | Slow | Excellent | 16GB |

### Model Loading

```
ollama pull mistral
    ↓
Download GGUF file
    ↓
Store in ~/.ollama/models
    ↓
Load on first inference
    ↓
Keep in memory for reuse
```

## Error Handling

### Error Types

1. **LLM Errors**
   - Connection failed
   - Model not found
   - Timeout
   - Invalid response

2. **Execution Errors**
   - Command failed
   - Timeout
   - Permission denied
   - Resource exhausted

3. **Resource Errors**
   - CPU overload
   - Memory exhausted
   - Disk full
   - Process limit

### Recovery Strategy

```
Error Detected
    ↓
Log Error
    ↓
Store in Memory
    ↓
Adjust Context
    ↓
Retry or Fail
    ↓
Return Error Status
```

## Performance Characteristics

### Latency

| Operation | Time |
|-----------|------|
| Model load | 5-10s |
| First inference | 10-30s |
| Subsequent | 5-15s |
| Command execution | 1-5s |
| Memory lookup | <1ms |

### Memory Usage

| Component | RAM |
|-----------|-----|
| Ollama server | 2-4GB |
| Model (mistral) | 4GB |
| Agent + context | 100-500MB |
| Total | 6-8GB |

### Throughput

- Tasks/hour: 10-20 (depends on task complexity)
- Commands/task: 1-5 (average)
- Context exchanges: 1-10 (per task)

## Extension Points

### Adding Custom Tools

```python
# In executor/task_runner.py
self.allowed_commands.add("custom_tool")

# In agent.py
if action == "custom_action":
    result = self.custom_handler()
```

### Adding Memory Categories

```python
# Store domain-specific knowledge
agent.memory.save_long_term("domain_knowledge", {
    "concepts": [...],
    "rules": [...],
    "examples": [...]
})
```

### Custom LLM Models

```python
agent = LegendaryAgent(model="custom-model")
# Ollama will load from ~/.ollama/models
```

## Security Considerations

### Safe Mode

- Whitelist of allowed commands
- Blocks dangerous operations (rm -rf, sudo, etc.)
- Output sanitization
- Timeout protection

### Sandboxing

- Execution in current directory
- No privilege escalation
- Resource limits enforced
- History tracking

### Data Privacy

- All data stored locally
- No external API calls
- No telemetry
- User controls all data

## Deployment Scenarios

### Local Development
- Single machine
- 4GB+ RAM
- CPU-based inference
- Interactive mode

### Server/Headless
- No GUI
- Command-line interface
- Batch task processing
- Programmatic API

### Embedded
- Limited resources
- Smaller models
- Optimized inference
- Minimal memory footprint

---

**Legendary AI** - Autonomous intelligence, running locally, no internet required.
