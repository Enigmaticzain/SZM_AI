import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from agent import LegendaryAgent

class CLIInterface:
    def __init__(self):
        self.agent = LegendaryAgent()
        self.running = True
    
    def print_banner(self):
        print("""
╔═══════════════════════════════════════════════════════════╗
║         LEGENDARY AI - Offline Agentic System             ║
║     Running on System RAM & CPU (No Internet Required)    ║
╚═══════════════════════════════════════════════════════════╝
        """)
    
    def print_status(self):
        status = self.agent.get_status()
        print("\n[SYSTEM STATUS]")
        print(f"CPU Usage: {status['resources']['cpu']['usage']:.1f}%")
        print(f"Memory: {status['resources']['memory']['usage']:.1f}% ({status['resources']['memory']['available_mb']:.0f}MB available)")
        print(f"Disk: {status['resources']['disk']['usage']:.1f}%")
        print(f"Context Size: {status['context_size']}")
    
    def run_task(self, task: str, debug: bool = False):
        print(f"\n[TASK] {task}")
        print("[PROCESSING...]")
        
        result = self.agent.execute_task(task, debug=debug)
        
        print("\n[RESULT]")
        if result.get("success"):
            print(f"✓ Task completed in {result.get('iterations')} iterations")
            print(f"Output: {result.get('result')}")
        else:
            print(f"✗ Task failed: {result.get('error')}")
        
        return result
    
    def interactive_mode(self):
        self.print_banner()
        print("Type 'help' for commands, 'exit' to quit\n")
        
        while self.running:
            try:
                user_input = input("legendary-ai> ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() == "exit":
                    print("Goodbye!")
                    self.running = False
                
                elif user_input.lower() == "help":
                    self.print_help()
                
                elif user_input.lower() == "status":
                    self.print_status()
                
                elif user_input.lower().startswith("debug "):
                    task = user_input[6:].strip()
                    self.run_task(task, debug=True)
                
                elif user_input.lower().startswith("task "):
                    task = user_input[5:].strip()
                    self.run_task(task, debug=False)
                
                else:
                    self.run_task(user_input, debug=False)
            
            except KeyboardInterrupt:
                print("\n\nInterrupted. Type 'exit' to quit.")
            except Exception as e:
                print(f"Error: {str(e)}")
    
    def print_help(self):
        print("""
Commands:
  task <description>     - Execute a task
  debug <description>    - Execute task with debug output
  status                 - Show system status
  help                   - Show this help
  exit                   - Exit the program

Examples:
  task create a python script that prints hello world
  debug list all files in current directory
  status
        """)

def main():
    cli = CLIInterface()

    args = sys.argv[1:]

    if not args:
        cli.interactive_mode()
        return

    debug = False
    if "--debug" in args:
        debug = True
        args = [arg for arg in args if arg != "--debug"]

    command = " ".join(args).strip()

    if not command:
        cli.print_help()
        return

    normalized_command = command.lower()
    if normalized_command == "status":
        cli.print_status()
        return

    if normalized_command == "help":
        cli.print_help()
        return

    result = cli.run_task(command, debug=debug)
    sys.exit(0 if result.get("success") else 1)

if __name__ == "__main__":
    main()
