import subprocess
import os
import json
from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass

@dataclass
class ExecutionResult:
    success: bool
    output: str
    error: str
    exit_code: int
    execution_time: float

class TaskExecutor:
    def __init__(self, safe_mode: bool = True):
        self.safe_mode = safe_mode
        self.execution_history = []
        self.allowed_commands = {
            "python", "pip", "ls", "cat", "echo", "mkdir", "rm", "cp", "mv",
            "grep", "find", "git", "npm", "node", "bash", "sh"
        }
    
    def execute_command(self, command: str, cwd: Optional[str] = None, timeout: int = 30) -> ExecutionResult:
        if self.safe_mode and not self._is_safe_command(command):
            return ExecutionResult(
                success=False,
                output="",
                error=f"Command blocked in safe mode: {command}",
                exit_code=1,
                execution_time=0
            )
        
        try:
            import time
            start = time.time()
            
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd or os.getcwd(),
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            execution_time = time.time() - start
            
            exec_result = ExecutionResult(
                success=result.returncode == 0,
                output=result.stdout[:5000],
                error=result.stderr[:5000],
                exit_code=result.returncode,
                execution_time=execution_time
            )
            
            self.execution_history.append({
                "command": command,
                "result": exec_result.__dict__,
                "cwd": cwd
            })
            
            return exec_result
        
        except subprocess.TimeoutExpired:
            return ExecutionResult(
                success=False,
                output="",
                error=f"Command timeout after {timeout}s",
                exit_code=-1,
                execution_time=timeout
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                output="",
                error=str(e),
                exit_code=-1,
                execution_time=0
            )
    
    def execute_python(self, code: str, cwd: Optional[str] = None) -> ExecutionResult:
        return self.execute_command(f"python -c '{code}'", cwd)
    
    def _is_safe_command(self, command: str) -> bool:
        cmd_name = command.split()[0].lower()
        return cmd_name in self.allowed_commands
    
    def get_history(self) -> list:
        return self.execution_history[-10:]
