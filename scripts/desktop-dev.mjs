import { spawn } from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";
const viteBin = path.join(rootDir, "node_modules", ".bin", isWindows ? "vite.cmd" : "vite");
const electronBin = path.join(
  rootDir,
  "node_modules",
  ".bin",
  isWindows ? "electron.cmd" : "electron"
);
const children = [];
const electronEnv = { ...process.env };

delete electronEnv.ELECTRON_RUN_AS_NODE;
delete electronEnv.ELECTRON_NO_ATTACH_CONSOLE;

function killChildren() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

function waitForServer(url, retries = 100) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (retries <= 0) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }

        retries -= 1;
        setTimeout(attempt, 300);
      });
    };

    attempt();
  });
}

process.on("SIGINT", () => {
  killChildren();
  process.exit(0);
});

process.on("SIGTERM", () => {
  killChildren();
  process.exit(0);
});

const viteProcess = spawn(viteBin, ["--host", "127.0.0.1", "--strictPort"], {
  cwd: rootDir,
  stdio: "inherit",
});

children.push(viteProcess);

viteProcess.on("exit", (code) => {
  if (code && code !== 0) {
    killChildren();
    process.exit(code);
  }
});

await waitForServer("http://127.0.0.1:5173");

const electronProcess = spawn(electronBin, ["--no-sandbox", "--disable-gpu", "."], {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...electronEnv,
    ELECTRON_RENDERER_URL: "http://127.0.0.1:5173",
  },
});

children.push(electronProcess);

electronProcess.on("exit", (code) => {
  killChildren();
  process.exit(code ?? 0);
});
