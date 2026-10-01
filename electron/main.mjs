import { app, BrowserWindow, BrowserView, ipcMain } from "electron";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLBAR_H = 56;
const CHATGPT = "https://chatgpt.com/";
const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const profile = path.join(os.tmpdir(), `incognito-chatgpt-${process.pid}`);
app.setName("Incognito ChatGPT");
app.setPath("userData", profile);
app.setPath("sessionData", profile);

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win;
let view;
let partitionId = 0;

app.on("second-instance", () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

function viewBounds() {
  const [width, height] = win.getContentSize();
  return {
    x: 0,
    y: TOOLBAR_H,
    width,
    height: Math.max(0, height - TOOLBAR_H),
  };
}

async function destroyView() {
  if (!view) return;
  const old = view;
  view = null;
  try {
    win.removeBrowserView(old);
  } catch {
    /* already gone */
  }
  const ses = old.webContents.session;
  try {
    old.webContents.destroy();
  } catch {
    /* already gone */
  }
  try {
    await ses.clearCache();
    await ses.clearStorageData();
  } catch {
    /* session already closed */
  }
}

async function attachChat() {
  await destroyView();
  partitionId += 1;
  view = new BrowserView({
    webPreferences: {
      partition: `incognito-${partitionId}`,
      contextIsolation: true,
      sandbox: true,
      javascript: true,
    },
  });
  view.webContents.setUserAgent(CHROME_UA);
  view.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.startsWith("https://chatgpt.com") ||
      url.startsWith("https://chat.openai.com") ||
      url.startsWith("https://auth.openai.com")
    ) {
      view.webContents.loadURL(url);
    }
    return { action: "deny" };
  });
  win.addBrowserView(view);
  view.setBounds(viewBounds());
  view.setAutoResize({ width: true, height: true });
  view.webContents.loadURL(CHATGPT);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 820,
    title: "Incognito ChatGPT",
    backgroundColor: "#212121",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, "toolbar.html"));
  win.once("ready-to-show", () => win.show());
  win.on("resize", () => {
    if (view) view.setBounds(viewBounds());
  });
  win.webContents.on("did-finish-load", () => {
    attachChat();
  });
}

ipcMain.on("start-over", () => {
  attachChat();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("quit", () => {
  try {
    fs.rmSync(profile, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});
