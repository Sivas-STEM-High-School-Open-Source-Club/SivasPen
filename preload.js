const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  hide: () => ipcRenderer.send('hide-window'),
  quit: () => ipcRenderer.send('quit-app')
});
