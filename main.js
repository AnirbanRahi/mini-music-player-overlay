const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const defaultState = {
    sources: [],
    currentTrack: null,
    volume: 1
};

const isDev = !app.isPackaged;

const statePath = isDev
    ? path.join(__dirname, "appState.json")   
    : path.join(app.getPath("userData"), "appState.json"); 

function ensureStateFile() {
    if (!fs.existsSync(statePath)) {
        fs.writeFileSync(statePath, JSON.stringify(defaultState, null, 2));
        return defaultState;
    }

    try {
        const data = fs.readFileSync(statePath, "utf-8");
        return { ...defaultState, ...JSON.parse(data) };
    } catch (err) {
        
        fs.writeFileSync(statePath, JSON.stringify(defaultState, null, 2));
        return defaultState;
    }
}

function saveState(state) {
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

let appState;

ipcMain.handle('get-state-path', () => {
    return statePath;
});

ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) return null;
    return filePaths[0];
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        frame: true,          // keep window controls
        transparent: false,   // must be false to see frame
        resizable: false,     // optional: prevent user resizing
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    
    mainWindow.loadFile('index.html');

    // Resize window to fit the .container after HTML loads
    mainWindow.webContents.on('did-finish-load', () => {
        setTimeout(() => {  // small delay to ensure CSS is applied
            mainWindow.webContents.executeJavaScript(`
                const container = document.querySelector('.container');
                const rect = container.getBoundingClientRect();
                ({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
            `).then(size => {
                mainWindow.setContentSize(size.width, size.height);
                mainWindow.center();
                mainWindow.show(); // show window after resizing
            });
        }, 50);
    });
}

app.whenReady().then(() => {
    
    appState = ensureStateFile();

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});