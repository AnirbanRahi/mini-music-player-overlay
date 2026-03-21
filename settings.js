const { ipcRenderer } = require('electron');
const fs = require('fs');

async function selectFolder() {
    try {

        const statePath = await ipcRenderer.invoke('get-state-path');

        const selectedPath = await ipcRenderer.invoke('dialog:openDirectory');

        if (!selectedPath) return;

        let currentState = { sources: [], currentTrack: null, volume: 1 };
        if (fs.existsSync(statePath)) {
            const data = fs.readFileSync(statePath, 'utf-8');
            currentState = JSON.parse(data);
        }

        if (currentState.sources !== selectedPath) {
            currentState.sources = selectedPath; 
            fs.writeFileSync(statePath, JSON.stringify(currentState, null, 2));
            console.log("State updated. Path saved to:", statePath);
            alert("Folder set successfully!");
        } else {
            alert("This folder is already selected.");
        }

    } catch (err) {
        console.error("Failed to update app state:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const folderBtn = document.getElementById("add-sources-svg");
    if (folderBtn) {
        folderBtn.addEventListener('click', selectFolder);
    }
});

