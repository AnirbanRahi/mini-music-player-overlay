const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const { generateLibrary } = require('./librarygenerator');
const defaultState = {
    sources: null,
    currentTrack: null,
    volume: 1,
    windowBounds: null
};

const isDev = !app.isPackaged;

const statePath = isDev
    ? path.join(__dirname, "appState.json")
    : path.join(app.getPath("userData"), "appState.json");

const outputDir = isDev
    ? __dirname
    : app.getPath("userData");

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

ipcMain.handle('get-state-path', () => statePath);

ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) return null;
    return filePaths[0];
});

ipcMain.on('reload-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.reload();   
});

ipcMain.handle('update-library', async (event, folderPath) => {
    console.log("Main process received path:", folderPath);

    // Reload fresh state (important)
    const currentState = ensureStateFile();

    currentState.sources = folderPath;

    saveState(currentState); // use your helper

    // Generate library
    await generateLibrary(folderPath, outputDir);

    return true;
});

ipcMain.handle('get-songs-path', () => {
    return path.join(outputDir, "songs.json");
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        frame: true,          // keep window controls
        transparent: false,   // must be false to see frame
        resizable: false,     // optional: prevent user resizing
        show: false,
        backgroundColor: '#000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
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

app.whenReady().then(async () => {
    appState = ensureStateFile();

    const songsFile = path.join(outputDir, "songs.json");
    if (!fs.existsSync(songsFile) || fs.statSync(songsFile).size === 0) {
        if (!appState.sources) {
            console.error("No source folder selected in app state. Cannot generate library.");
        } else {
            console.log("Generating library...");
            await generateLibrary(appState.sources, outputDir);
            console.log("Library generation complete.");
        }
    } else {
        console.log("songs.json exists, skipping library generation.");
    }

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});