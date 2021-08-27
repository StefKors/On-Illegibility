const { app, BrowserWindow } = require("electron");
const serve = require("electron-serve");
const path = require("path");

const loadURL = serve({ directory: "renderer" });

let mainWindow;

(async () => {
  await app.whenReady();

  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "./icon.icns"),
  });

  await loadURL(mainWindow);

  try {
    require("electron-reloader")(module);
  } catch {}

  app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
  });
})();
