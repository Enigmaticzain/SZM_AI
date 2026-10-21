#!/usr/bin/env python3
"""
Test script to verify SZM Forge integration with Unsloth server
"""

import json
import time
from agent import LegendaryAgent

def test_szm_unsloth_integration():
    print("🔧 Testing SZM Forge <-> Unsloth Integration")
    print("=" * 50)
    
    # Initialize agent
    agent = LegendaryAgent()
    
    # Test 1: Check Unsloth server connection
    print("\n1. Testing Unsloth Server Connection...")
    server_status = agent.check_unsloth_server()
    print(f"   Status: {server_status}")
    
    if not server_status['success']:
        print("❌ Unsloth server not available!")
        return False
    
    print("✅ Unsloth server is connected!")
    
    # Test 2: Check system status
    print("\n2. Checking System Status...")
    system_status = agent.get_status()
    print(f"   System Status: {json.dumps(system_status, indent=2)}")
    
    # Test 3: Prepare mock training data
    print("\n3. Testing Training Data Preparation...")
    
    # Add some mock data to memory
    agent.memory.add_short_term("task_result", "Successfully completed file analysis task")
    agent.memory.add_short_term("execution", {
        "command": "ls -la",
        "success": True,
        "output": "total 48\ndrwxr-xr-x 2 user user 4096 May 24 12:00 ."
    })
    agent.memory.add_short_term("web_search", "Latest AI training techniques for 2026")
    
    training_data = agent.prepare_training_data_for_unsloth()
    print(f"   Training Data: {training_data}")
    
    if training_data['success'] and training_data['count'] > 0:
        print(f"✅ Successfully prepared {training_data['count']} training examples!")
    else:
        print("❌ Failed to prepare training data")
        return False
    
    # Test 4: Test task execution with Unsloth awareness
    print("\n4. Testing Task Execution with Unsloth Integration...")
    
    task_result = agent.execute_task("Check Unsloth training status", debug=True)
    print(f"   Task Result: {task_result}")
    
    if task_result['success']:
        print("✅ Task execution successful!")
    else:
        print(f"❌ Task execution failed: {task_result.get('error', 'Unknown error')}")
    
    # Test 5: Test web search integration
    print("\n5. Testing Web Search Integration...")
    
    search_result = agent.web_search("Unsloth fine-tuning tutorial")
    print(f"   Search Result: {search_result}")
    
    if search_result['success']:
        print("✅ Web search integration working!")
    else:
        print(f"❌ Web search failed: {search_result.get('error', 'Unknown error')}")
    
    print("\n" + "=" * 50)
    print("🎉 SZM Forge <-> Unsloth Integration Test Complete!")
    
    return True

if __name__ == "__main__":
    test_szm_unsloth_integration()