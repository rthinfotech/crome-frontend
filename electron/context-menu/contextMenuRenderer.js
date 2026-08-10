const api = window.contextMenuAPI;

api.onMenuData((data) => {
  document.getElementById("back").disabled =
    !data.canGoBack;

  document.getElementById("forward").disabled =
    !data.canGoForward;
});

document
  .getElementById("back")
  .addEventListener("click", () => {
    api.action("back");
  });

document
  .getElementById("forward")
  .addEventListener("click", () => {
    api.action("forward");
  });

document
  .getElementById("reload")
  .addEventListener("click", () => {
    api.action("reload");
  });

document
  .getElementById("inspect")
  .addEventListener("click", () => {
    api.action("inspect");
  });