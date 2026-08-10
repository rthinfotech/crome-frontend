import {
  BrowserWindow,
  screen,
} from "electron";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let menuWindow = null;
let targetContents = null;
let inspectX = 0;
let inspectY = 0;

export function setupGlobalContextMenu(app) {
  app.on("web-contents-created", (_event, contents) => {
    contents.on("context-menu", (_event, params) => {
      targetContents = contents;

      inspectX = params.x;
      inspectY = params.y;

      showContextMenu(contents, params);
    });
  });
}

function showContextMenu(contents, params) {
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.close();
  }

  const ownerWindow = contents.getOwnerBrowserWindow();

  if (!ownerWindow) return;

  menuWindow = new BrowserWindow({
    width: 260,
    height: 180,

    frame: false,
    transparent: true,
    resizable: false,

    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,

    webPreferences: {
      preload: path.join(
        __dirname,
        "contextMenuPreload.cjs"
      ),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  menuWindow.setMenu(null);

  menuWindow.loadFile(
    path.join(__dirname, "contextMenu.html")
  );

  menuWindow.webContents.once(
    "did-finish-load",
    () => {
      if (
        !menuWindow ||
        menuWindow.isDestroyed()
      ) {
        return;
      }

      menuWindow.webContents.send(
        "context-menu-data",
        {
          canGoBack: contents.canGoBack(),
          canGoForward: contents.canGoForward(),
          selectionText: params.selectionText || "",
        }
      );

      positionMenu(
        menuWindow,
        ownerWindow,
        params
      );

      menuWindow.show();
    }
  );

  menuWindow.on("blur", () => {
    closeMenu();
  });
}

function positionMenu(
  menu,
  ownerWindow,
  params
) {
  // Content area, not the outer window
  const bounds =
    ownerWindow.getContentBounds();

  let x = bounds.x + params.x;
  let y = bounds.y + params.y;

  const display =
    screen.getDisplayNearestPoint({
      x,
      y,
    });

  const area = display.workArea;

  const width = 260;
  const height = 180;

  if (x + width > area.x + area.width) {
    x =
      area.x +
      area.width -
      width -
      8;
  }

  if (y + height > area.y + area.height) {
    y =
      area.y +
      area.height -
      height -
      8;
  }

  menu.setPosition(
    Math.round(x),
    Math.round(y)
  );
}

export function handleContextMenuAction(
  action
) {
  if (
    !targetContents ||
    targetContents.isDestroyed()
  ) {
    return;
  }

  switch (action) {
    case "back":
      if (targetContents.canGoBack()) {
        targetContents.goBack();
      }
      break;

    case "forward":
      if (targetContents.canGoForward()) {
        targetContents.goForward();
      }
      break;

    case "reload":
      targetContents.reload();
      break;

    case "inspect":
      targetContents.inspectElement(
        inspectX,
        inspectY
      );

      if (!targetContents.isDevToolsOpened()) {
        targetContents.openDevTools();
      }
      break;
  }

  closeMenu();
}

function closeMenu() {
  if (
    menuWindow &&
    !menuWindow.isDestroyed()
  ) {
    menuWindow.close();
    menuWindow = null;
  }
}