document.addEventListener('DOMContentLoaded', () => {
    const folderBtn = document.getElementById("add-sources-svg");
    folderBtn?.addEventListener('click', async () => {
        try {
            const selectedPath = await window.electronAPI.openDirectory();
            if (!selectedPath) return;

            await window.electronAPI.updateLibrary(selectedPath);
            window.renderLibrary(); 
            alert("Library updated!");
        } catch (err) {
            console.error(err);
        }
    });
});