const { app, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const { spawn } = require("child_process");
const http = require("http");

const isDev = !app.isPackaged;
let serverProcess = null;

/* ── IPC: 窗口控件 ── */

function setupIPC() {
  ipcMain.on("window-minimize", (e) => {
    BrowserWindow.fromWebContents(e.sender)?.minimize();
  });
  ipcMain.on("window-maximize", (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });
  ipcMain.on("window-close", (e) => {
    BrowserWindow.fromWebContents(e.sender)?.close();
  });
}

/* ── 等待 Next.js 就绪（dev/prod 统一轮询） ── */

function waitForServer(url, maxAttempts = 120) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(poll);
          resolve();
        }
      }).on("error", () => {
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          reject(new Error("Server did not start in time"));
        }
      });
    }, 500);
  });
}

async function ensureServerReady() {
  if (isDev) {
    // Dev: 验证 dev server 已在运行
    await waitForServer("http://localhost:3000", 30);
  } else {
    // Production: 启动 next start 并等待就绪
    const serverPath = join(__dirname, "..");
    serverProcess = spawn(
      "node",
      [join(serverPath, "node_modules", "next", "dist", "bin", "next"), "start", "-p", "3000"],
      { cwd: serverPath, env: Object.assign({}, process.env, { NODE_ENV: "production" }), stdio: "pipe" }
    );
    await waitForServer("http://localhost:3000", 120);
  }
}

/* ── 窗口创建 ── */

async function createWindow() {
  setupIPC();

  const iconPath = join(__dirname, "..", "assets", "icon.png");

  // Splash
  const splash = new BrowserWindow({
    width: 500,
    height: 360,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    center: true,
  });
  splash.loadFile(join(__dirname, "..", "public", "splash.html"));

  await ensureServerReady();

  // Main window
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: "Yiy-Note",
    icon: iconPath,
    frame: false,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL("http://localhost:3000");

  win.webContents.on("did-finish-load", () => {
    // 淡出 splash 后显示主窗口
    splash.webContents.executeJavaScript("document.body.style.opacity='0'");
    setTimeout(() => {
      splash.close();
      win.show();
    }, 400);
  });

  if (isDev) win.webContents.openDevTools();

  win.on("closed", () => {
    if (serverProcess) { serverProcess.kill(); serverProcess = null; }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
