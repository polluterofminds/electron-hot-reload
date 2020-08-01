const { app, BrowserWindow, ipcMain } = require("electron");

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
};

ipcMain.on("re-render", () => {
  win.loadFile("index.html");
});

app.whenReady().then(createWindow);
