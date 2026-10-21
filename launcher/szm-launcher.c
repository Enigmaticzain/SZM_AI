#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

int main() {
    char html_path[1024];
    char browser_cmd[2048];
    
    // Get the directory where this executable is
    char exe_path[512];
    readlink("/proc/self/exe", exe_path, sizeof(exe_path) - 1);
    char *dir = dirname(exe_path);
    
    // Build path to HTML file
    snprintf(html_path, sizeof(html_path), "file://%s/dist/index.html", dir);
    
    // Try to open with default browser
    snprintf(browser_cmd, sizeof(browser_cmd), "xdg-open '%s' &", html_path);
    system(browser_cmd);
    
    // Also try firefox if available
    system("firefox /mnt/D/projects/szm-autonomous-offline-system/dist/index.html &");
    
    return 0;
}
