import { app, BrowserWindow, Menu } from "electron";

function createWindow() {
  // Remove application menu
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,

    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Remove menu from this window
  win.removeMenu();

  win.loadURL("http://localhost:5173");

  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);