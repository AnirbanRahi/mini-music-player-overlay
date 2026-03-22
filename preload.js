const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getSongsPath: () => ipcRenderer.invoke('get-songs-path'),
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    updateLibrary: (folder) => ipcRenderer.invoke('update-library', folder)
});