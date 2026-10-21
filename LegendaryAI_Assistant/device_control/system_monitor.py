import os
from typing import Dict, Any
from dataclasses import dataclass

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

@dataclass
class SystemStats:
    cpu_percent: float
    memory_percent: float
    memory_available_mb: float
    disk_percent: float
    process_count: int

class DeviceControl:
    def __init__(self):
        self.resource_limits = {
            "max_cpu_percent": 80,
            "max_memory_percent": 85,
            "max_processes": 500
        }
    
    def get_system_stats(self) -> SystemStats:
        if HAS_PSUTIL:
            return SystemStats(
                cpu_percent=psutil.cpu_percent(interval=1),
                memory_percent=psutil.virtual_memory().percent,
                memory_available_mb=psutil.virtual_memory().available / (1024 * 1024),
                disk_percent=psutil.disk_usage("/").percent,
                process_count=len(psutil.pids())
            )
        else:
            return SystemStats(
                cpu_percent=0.0,
                memory_percent=50.0,
                memory_available_mb=4096.0,
                disk_percent=50.0,
                process_count=100
            )
    
    def can_execute_task(self) -> bool:
        stats = self.get_system_stats()
        
        if stats.cpu_percent > self.resource_limits["max_cpu_percent"]:
            return False
        if stats.memory_percent > self.resource_limits["max_memory_percent"]:
            return False
        if stats.process_count > self.resource_limits["max_processes"]:
            return False
        
        return True
    
    def get_resource_status(self) -> Dict[str, Any]:
        stats = self.get_system_stats()
        return {
            "cpu": {
                "usage": stats.cpu_percent,
                "limit": self.resource_limits["max_cpu_percent"],
                "ok": stats.cpu_percent < self.resource_limits["max_cpu_percent"]
            },
            "memory": {
                "usage": stats.memory_percent,
                "available_mb": stats.memory_available_mb,
                "limit": self.resource_limits["max_memory_percent"],
                "ok": stats.memory_percent < self.resource_limits["max_memory_percent"]
            },
            "disk": {
                "usage": stats.disk_percent,
                "ok": stats.disk_percent < 90
            },
            "processes": {
                "count": stats.process_count,
                "limit": self.resource_limits["max_processes"],
                "ok": stats.process_count < self.resource_limits["max_processes"]
            }
        }
    
    def set_resource_limit(self, resource: str, limit: float):
        if resource in self.resource_limits:
            self.resource_limits[resource] = limit
