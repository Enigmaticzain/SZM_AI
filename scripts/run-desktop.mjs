import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";
const electronBin = path.join(
  rootDir,
  "node_modules",
  ".bin",
  isWindows ? "electron.cmd" : "electron"
);
const electronEnv = { ...process.env };

delete electronEnv.ELECTRON_RUN_AS_NODE;
delete electronEnv.ELECTRON_NO_ATTACH_CONSOLE;

const electronProcess = spawn(electronBin, ["--no-sandbox", "--disable-gpu", "."], {
  cwd: rootDir,
  stdio: "inherit",
  env: electronEnv,
});

electronProcess.on("exit", (code) => {
  process.exit(code ?? 0);
});
