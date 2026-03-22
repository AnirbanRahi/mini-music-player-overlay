const { ipcRenderer } = require('electron');


async function selectFolder() {
    try {
        const selectedPath = await ipcRenderer.invoke('dialog:openDirectory');
        if (!selectedPath) return;

        const result = await ipcRenderer.invoke('update-library', selectedPath);

        if (result) {
            alert("Library updated!");
            if (result) {
                renderLibrary();
            }
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const folderBtn = document.getElementById("add-sources-svg");
    if (folderBtn) {
        folderBtn.addEventListener('click', selectFolder);
    }
});

