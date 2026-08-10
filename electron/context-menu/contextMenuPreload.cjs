const {
  contextBridge,
  ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld(
  "contextMenuAPI",
  {
    onMenuData: (callback) => {
      ipcRenderer.on(
        "context-menu-data",
        (_event, data) => {
          callback(data);
        }
      );
    },

    action: (action) => {
      ipcRenderer.send(
        "context-menu-action",
        action
      );
    },
  }
);