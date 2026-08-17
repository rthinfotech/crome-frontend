import { app, BrowserWindow, Menu, ipcMain } from "electron";
import {
  setupGlobalContextMenu,
  handleContextMenuAction,
} from "./electron/context-menu/contextMenu.js";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



function createWindow() {

  const iconPath = path.join(
  __dirname,
  "assets",
  "chrome-logo.ico"
);

console.log("ICON PATH:", iconPath);

  // Remove application menu
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,

  // icon: iconPath,
  icon: path.join(
  __dirname,
  "assets",
  "chrome-logo.ico"
),


    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });


  win.webContents.on(
  "will-attach-webview",
  (event, webPreferences) => {
    webPreferences.preload = path.join(
      __dirname,
      "electron",
      "webviewPreload.cjs"
    );

    console.log(
      "🔥 WEBVIEW PRELOAD:",
      webPreferences.preload
    );
  }
);

win.webContents.on("did-attach-webview", (event, webContents) => {

    webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/151.0.0.0 Safari/537.36"
  );
  console.log("🔥 DID ATTACH WEBVIEW");
  console.log("WEBVIEW ID:", webContents.id);

  // Capture console.log() from the website inside the webview
 webContents.on(
  "console-message",
  (event, level, message) => {
    console.log("🌐 WEBVIEW:", message);
  }
);

  webContents.setWindowOpenHandler(({ url }) => {
    console.log("🔥🔥 TARGET BLANK URL:", url);

    return {
      action: "deny",
    };
  });
});

  // Remove menu from this window
  win.removeMenu();

if (app.isPackaged) {
  win.loadFile(
    path.join(__dirname, "renderer", "index.html")
  );
} else {
  win.loadURL("http://localhost:5173");
}

}



app.whenReady().then(() => {
  setupGlobalContextMenu(app);

  ipcMain.on(
    "context-menu-action",
    (_event, action) => {
      handleContextMenuAction(action);
    }
  );

  createWindow();
});