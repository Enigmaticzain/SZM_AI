#!/usr/bin/env python3
"""
Legendary AI - Enhanced Demo Script
Shows web search, Ollama integration, and training capabilities
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent import LegendaryAgent
from core_ai.llm_engine import CoreAI

def demo_web_search():
    print("\n" + "="*60)
    print("DEMO 1: Web Search Integration")
    print("="*60)
    
    agent = LegendaryAgent(model="llama2", enable_web_search=True)
    
    # Test web search functionality
    print("\nTesting direct web search...")
    search_result = agent.web_search("latest AI developments 2024")
    
    if search_result["success"]:
        print(f"✓ Found {len(search_result['results'])} results")
        for i, result in enumerate(search_result["results"][:2]):
            print(f"  {i+1}. {result['title']}: {result['content'][:100]}...")
    else:
        print(f"✗ Search failed: {search_result['error']}")

def demo_ollama_integration():
    print("\n" + "="*60)
    print("DEMO 2: Ollama Integration")
    print("="*60)
    
    llm = CoreAI(model="llama2")
    
    # Check available models
    print("\nChecking available Ollama models...")
    models = llm.get_available_models()
    
    if models:
        print(f"✓ Available models: {', '.join(models[:3])}")
        
        # Test simple generation
        try:
            print("\nTesting simple generation...")
            response = llm.generate_simple("What is artificial intelligence in one sentence?")
            print(f"✓ Response: {response[:200]}...")
        except Exception as e:
            print(f"✗ Generation error: {e}")
    else:
        print("✗ No Ollama models found. Make sure Ollama is running.")

def demo_training_integration():
    print("\n" + "="*60)
    print("DEMO 3: Training Data Integration")
    print("="*60)
    
    llm = CoreAI(model="llama2")
    
    # Add training data
    print("\nAdding training data...")
    training_examples = [
        ("What is machine learning?", "Machine learning is a subset of AI that enables computers to learn from data.", "AI education"),
        ("Explain neural networks", "Neural networks are computing systems inspired by biological neural networks.", "Deep learning"),
        ("What is Ollama?", "Ollama is a tool for running large language models locally on your machine.", "Local AI tools")
    ]
    
    for prompt, response, context in training_examples:
        llm.add_training_data(prompt, response, context)
    
    print(f"✓ Added {len(training_examples)} training examples")
    
    # Show training context
    training_context = llm.get_training_context()
    print(f"✓ Training context length: {len(training_context)} characters")
    print(f"Sample context: {training_context[:200]}...")

def demo_enhanced_agent():
    print("\n" + "="*60)
    print("DEMO 4: Enhanced Agent with Web Search")
    print("="*60)
    
    agent = LegendaryAgent(model="llama2", enable_web_search=True)
    
    # Test task that should trigger web search
    task = "Find current information about Ollama and summarize its features"
    print(f"\nTask: {task}")
    
    try:
        result = agent.execute_task(task, debug=True)
        
        if result.get("success"):
            print(f"✓ Success in {result.get('iterations')} iterations")
            print(f"Result: {result.get('result')[:300]}...")
        else:
            print(f"✗ Failed: {result.get('error')}")
    except Exception as e:
        print(f"✗ Agent execution error: {e}")

def demo_system_status():
    print("\n" + "="*60)
    print("DEMO 5: Enhanced System Status")
    print("="*60)
    
    agent = LegendaryAgent(model="llama2", enable_web_search=True)
    status = agent.get_status()
    
    print("\nSystem Resources:")
    print(f"  CPU: {status['resources']['cpu']['usage']:.1f}%")
    print(f"  Memory: {status['resources']['memory']['usage']:.1f}%")
    print(f"  Available RAM: {status['resources']['memory']['available_mb']:.0f}MB")
    print(f"  Disk: {status['resources']['disk']['usage']:.1f}%")
    
    print(f"\nAgent Configuration:")
    print(f"  Context Size: {status['context_size']}")
    print(f"  Execution History: {status['execution_history']}")
    print(f"  Web Search: {'Enabled' if status['web_search_enabled'] else 'Disabled'}")
    print(f"  Ollama Model: {status['ollama_model']}")

def demo_github_simulation():
    print("\n" + "="*60)
    print("DEMO 6: GitHub Skills Simulation")
    print("="*60)
    
    print("\nSimulating GitHub skills import...")
    print("✓ Would fetch from: https://github.com/user/ai-skills")
    print("✓ Would import: README.md, training_data.json, skills.txt")
    print("✓ Would convert to training format")
    print("✓ Would add to local model training")
    print("\nNote: Full GitHub integration available in web interface")

def main():
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║         LEGENDARY AI - Enhanced Demo Script               ║")
    print("║   Web Search + Ollama + Training + GitHub Integration     ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    
    demos = [
        ("Web Search Integration", demo_web_search),
        ("Ollama Integration", demo_ollama_integration),
        ("Training Data Integration", demo_training_integration),
        ("Enhanced Agent", demo_enhanced_agent),
        ("System Status", demo_system_status),
        ("GitHub Skills (Simulation)", demo_github_simulation),
    ]
    
    print("\nAvailable Demos:")
    for i, (name, _) in enumerate(demos, 1):
        print(f"  {i}. {name}")
    print(f"  {len(demos)+1}. Run All")
    print(f"  0. Exit")
    
    print("\nPrerequisites:")
    print("  - Ollama installed and running (ollama serve)")
    print("  - Internet connection for web search")
    print("  - Python requests library")
    
    try:
        choice = input(f"\nSelect demo (0-{len(demos)+1}): ").strip()
        
        if choice == "0":
            print("Goodbye!")
            return
        
        choice = int(choice)
        
        if choice == len(demos) + 1:
            for name, demo_func in demos:
                try:
                    demo_func()
                except Exception as e:
                    print(f"✗ Demo '{name}' error: {e}")
        elif 1 <= choice <= len(demos):
            demos[choice - 1][1]()
        else:
            print("Invalid choice")
    
    except KeyboardInterrupt:
        print("\n\nInterrupted.")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*60)
    print("FEATURES IMPLEMENTED:")
    print("✓ Removed 'Reset Memory' button from UI")
    print("✓ Added automatic web search capability")
    print("✓ Integrated Ollama for local AI training")
    print("✓ Added GitHub repository skills importing")
    print("✓ Enhanced console with multi-source AI")
    print("✓ Tabbed training interface")
    print("="*60)

if __name__ == "__main__":
    main()
