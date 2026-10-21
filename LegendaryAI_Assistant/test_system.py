#!/usr/bin/env python3
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    print("[TEST] Checking imports...")
    try:
        from core_ai.llm_engine import CoreAI
        from memory.store import MemoryStore
        from executor.task_runner import TaskExecutor
        from device_control.system_monitor import DeviceControl
        from agent import LegendaryAgent
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_memory():
    print("\n[TEST] Testing memory system...")
    try:
        from memory.store import MemoryStore
        mem = MemoryStore()
        mem.add_short_term("test_key", "test_value")
        result = mem.get_short_term("test_key")
        assert result == "test_value", "Memory retrieval failed"
        print("✓ Memory system working")
        return True
    except Exception as e:
        print(f"✗ Memory test failed: {e}")
        return False

def test_executor():
    print("\n[TEST] Testing executor...")
    try:
        from executor.task_runner import TaskExecutor
        executor = TaskExecutor()
        result = executor.execute_command("echo 'test'")
        assert result.success, "Command execution failed"
        assert "test" in result.output, "Command output incorrect"
        print("✓ Executor working")
        return True
    except Exception as e:
        print(f"✗ Executor test failed: {e}")
        return False

def test_device_control():
    print("\n[TEST] Testing device control...")
    try:
        from device_control.system_monitor import DeviceControl
        device = DeviceControl()
        stats = device.get_system_stats()
        assert stats.cpu_percent >= 0, "CPU stats invalid"
        assert stats.memory_percent >= 0, "Memory stats invalid"
        print(f"✓ Device control working")
        print(f"  CPU: {stats.cpu_percent:.1f}%")
        print(f"  Memory: {stats.memory_percent:.1f}%")
        print(f"  Available RAM: {stats.memory_available_mb:.0f}MB")
        return True
    except Exception as e:
        print(f"✗ Device control test failed: {e}")
        return False

def test_ollama_connection():
    print("\n[TEST] Testing Ollama connection...")
    try:
        from core_ai.llm_engine import CoreAI
        ai = CoreAI()
        if ai._check_ollama():
            print("✓ Ollama is running")
            return True
        else:
            print("⚠ Ollama not running at http://localhost:11434")
            print("  Start it with: ollama serve")
            return False
    except Exception as e:
        print(f"✗ Ollama test failed: {e}")
        return False

def main():
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║         LEGENDARY AI - System Validation                  ║")
    print("╚═══════════════════════════════════════════════════════════╝\n")
    
    tests = [
        test_imports,
        test_memory,
        test_executor,
        test_device_control,
        test_ollama_connection
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"✗ Test error: {e}")
            results.append(False)
    
    print("\n" + "="*60)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✓ All systems operational!")
        print("\nNext steps:")
        print("1. Start Ollama: ollama serve")
        print("2. Pull a model: ollama pull mistral")
        print("3. Run the agent: python gui/cli.py")
    else:
        print("⚠ Some tests failed. Check the output above.")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
