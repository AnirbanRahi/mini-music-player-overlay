const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getSongsPath: () => ipcRenderer.invoke('get-songs-path'),
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    updateLibrary: (folder) => ipcRenderer.invoke('update-library', folder),
    reloadWindow: () => ipcRenderer.send('reload-window'),
    getHotkey: () => ipcRenderer.invoke('get-hotkey'),
    updateHotkey: (key) => ipcRenderer.invoke('update-hotkey', key)
    
});