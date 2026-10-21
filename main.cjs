const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs/promises");
const path = require("path");

const rendererUrl = process.env.ELECTRON_RENDERER_URL;
const textFileExtensions = new Set([
  ".txt",
  ".md",
  ".json",
  ".csv",
  ".log",
  ".ini",
  ".yaml",
  ".yml",
  ".xml",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
]);

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".txt":
    case ".md":
    case ".log":
    case ".ini":
    case ".yaml":
    case ".yml":
    case ".xml":
    case ".js":
    case ".jsx":
    case ".ts":
    case ".tsx":
    case ".py":
    case ".c":
    case ".cpp":
    case ".h":
    case ".hpp":
      return "text/plain";
    case ".json":
      return "application/json";
    case ".csv":
      return "text/csv";
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    default:
      return "application/octet-stream";
  }
}

async function serializeTrainingFile(filePath) {
  const stats = await fs.stat(filePath);
  const mimeType = getMimeType(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const header = [
    `File: ${path.basename(filePath)}`,
    `Type: ${mimeType}`,
    `Path: ${filePath}`,
    `Size: ${(stats.size / 1024).toFixed(2)} KB`,
  ].join("\n");

  let content = header;

  if (textFileExtensions.has(extension)) {
    const text = await fs.readFile(filePath, "utf8");
    content = text.slice(0, 250000);
  }

  return {
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
    mimeType,
    content,
  };
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#020617",
    autoHideMenuBar: true,
    title: "SZM Autonomous Offline System",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
}

ipcMain.handle("training:pick-files", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Select training data",
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Training files",
        extensions: [
          "txt",
          "md",
          "json",
          "csv",
          "log",
          "ini",
          "yaml",
          "yml",
          "xml",
          "js",
          "jsx",
          "ts",
          "tsx",
          "py",
          "c",
          "cpp",
          "h",
          "hpp",
          "pdf",
          "png",
          "jpg",
          "jpeg",
          "gif",
          "webp",
          "mp4",
          "webm",
          "mp3",
          "wav",
          "ogg",
        ],
      },
      { name: "All files", extensions: ["*"] },
    ],
  });

  if (canceled || filePaths.length === 0) {
    return [];
  }

  return Promise.all(filePaths.map((filePath) => serializeTrainingFile(filePath)));
});

ipcMain.handle("knowledge:export", async (_event, payload) => {
  const suggestedName =
    typeof payload?.suggestedName === "string" && payload.suggestedName.trim()
      ? payload.suggestedName
      : "szm-knowledge-base.json";
  const data = typeof payload?.data === "string" ? payload.data : "";
  const defaultPath = path.join(app.getPath("downloads"), suggestedName);

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Export knowledge base",
    defaultPath,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  await fs.writeFile(filePath, data, "utf8");
  return { canceled: false, path: filePath };
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
