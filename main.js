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