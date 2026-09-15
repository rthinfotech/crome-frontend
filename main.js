// import { app, BrowserWindow, Menu, ipcMain, dialog } from "electron";
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import {
  setupGlobalContextMenu,
  handleContextMenuAction,
} from "./electron/context-menu/contextMenu.js";
import path from "path";
import { fileURLToPath } from "url";
// import pkg from "electron-updater";
// const { autoUpdater } = pkg;


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

//  to open dev tools code
if (!app.isPackaged) {
  win.webContents.openDevTools();
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

  
    // AUTO UPDATE APPLICATION
  // if (app.isPackaged) {
  //   autoUpdater.checkForUpdatesAndNotify();
  // }
// AUTO UPDATE APPLICATION
// if (app.isPackaged) {

//   autoUpdater.autoDownload = true;

//   autoUpdater.on("update-available", (info) => {
//     dialog.showMessageBox({
//       type: "info",
//       title: "Update Available",
//       message: `New version ${info.version} is available.`,
//       detail: "The update will be downloaded automatically.",
//     });
//   });

//   autoUpdater.on("update-downloaded", (info) => {
//     dialog.showMessageBox({
//       type: "info",
//       title: "Update Ready",
//       message: `Version ${info.version} has been downloaded.`,
//       detail: "Restart the application to install the update.",
//       buttons: ["Restart Now", "Later"],
//     }).then((result) => {
//       if (result.response === 0) {
//         autoUpdater.quitAndInstall();
//       }
//     });
//   });

//   autoUpdater.on("error", (error) => {
//     dialog.showErrorBox(
//       "Update Error",
//       error.message
//     );
//   });

//   autoUpdater.checkForUpdates();
// }


});