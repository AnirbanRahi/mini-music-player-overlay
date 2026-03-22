

document.addEventListener('DOMContentLoaded', () => {
    const song_name_t = document.querySelector(".song-name")
    const playing_image_t = document.querySelector(".playing-image")
    const play_svg_t = document.getElementById("play-svg")
    const pause_svg_t = document.getElementById("pause-svg")
    const progress_t = document.getElementById("progress")
    const progress_time_t = document.querySelector('.progress-time');
    const audio_t = document.getElementById("audio")
    const progress_time_ending_t = document.querySelector('.progress-time-ending');
    const artist_name_t = document.querySelector(".artist-name")
    const folderBtn = document.getElementById("add-sources-svg");

    folderBtn?.addEventListener('click', async () => {
        try {
            const selectedPath = await window.electronAPI.openDirectory();
            if (!selectedPath) return;

            await window.electronAPI.updateLibrary(selectedPath);
            alert("Library updated!");
            window.electronAPI.reloadWindow();

        } catch (err) {
            console.error(err);
        }
    });
});