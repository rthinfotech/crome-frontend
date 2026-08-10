const { ipcRenderer } = require("electron");

console.log("🔥🔥 WEBVIEW PRELOAD LOADED");

document.addEventListener(
  "click",
  (event) => {
    const element = event.target.closest("a");

    if (!element) return;

    const target = element.getAttribute("target");
    const href = element.href;

    if (target === "_blank" && href) {
      console.log(
        "🔥🔥 PRELOAD TARGET BLANK:",
        href
      );

      event.preventDefault();

      ipcRenderer.sendToHost(
        "target-blank",
        href
      );
    }
  },
  true
);