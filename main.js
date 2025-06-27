const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let win;
let tray;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.setIgnoreMouseEvents(false);
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Göster', click: () => win.show() },
    { label: 'Gizle', click: () => win.hide() },
    { label: 'Çıkış', click: () => app.quit() }
  ]);
  tray.setToolTip('Sivas Kalem');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

ipcMain.on('hide-window', () => win.hide());
ipcMain.on('quit-app', () => app.quit());
