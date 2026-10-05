const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
  isElectron: true,
  print: () => window.print(),
  downloadUpdate: (url) => ipcRenderer.invoke('download-update', url),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  cancelDownloadUpdate: () => ipcRenderer.invoke('cancel-download-update'),
  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  }
});
