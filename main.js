const { app, BrowserWindow, Menu, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const { generateLibrary } = require('./librarygenerator');
const defaultState = {
    sources: null,
    windowBounds: null,
    hotkey:"Control+Alt+M"
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
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,          // keep window controls
        transparent: false,   // must be false to see frame
        resizable: false,     // optional: prevent user resizing
        show: false,
        skipTaskbar: true,
        alwaysOnTop: true,
        x: appState.windowBounds?.x, 
        y: appState.windowBounds?.y,
        backgroundColor: '#000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.on('blur', () => {
        mainWindow.hide();
    });


    mainWindow.loadFile('index.html');
    mainWindow.on('move', () => {
        const bounds = mainWindow.getBounds();
        appState.windowBounds = { x: bounds.x, y: bounds.y };
        saveState(appState);
    });
    // Resize window to fit the .container after HTML loads
    mainWindow.webContents.on('did-finish-load', () => {
        setTimeout(() => {  // small delay to ensure CSS is applied
            mainWindow.webContents.executeJavaScript(`
                const container = document.querySelector('.container');
                const rect = container.getBoundingClientRect();
                ({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
            `).then(size => {
                mainWindow.setContentSize(size.width, size.height);
                // mainWindow.center();
                mainWindow.show(); // show window after resizing
            });
        }, 50);
    });
}

let registeredHotkey;

function registerHotkey(hotkey) {
    if (registeredHotkey) {
        globalShortcut.unregister(registeredHotkey);
    }
    registeredHotkey = hotkey;
    globalShortcut.register(hotkey, () => {
        if (!mainWindow) return;
        mainWindow.show();
        mainWindow.focus();
    });
}

ipcMain.handle('get-hotkey', () => {
    return appState.hotkey;
});

ipcMain.handle('update-hotkey', (event, newHotkey) => {
    const state = ensureStateFile(); // always get fresh state

    state.hotkey = newHotkey;

    saveState(state);

    appState = state; // keep global in sync

    registerHotkey(newHotkey);

    return newHotkey;
});

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

    registerHotkey(appState.hotkey);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});